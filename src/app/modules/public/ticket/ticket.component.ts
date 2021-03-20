import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

// interfaces
import { TicketResponse, TicketsResponse } from '../../../interfaces/ticket.interface';
import { Ticket } from '../../../interfaces/ticket.interface';

// services
import { WebsocketService } from '../../../services/websocket.service';
import { PublicService } from '../public.service';

// libs
import { Subject, interval, Subscription } from 'rxjs';
import { ScoreItemsResponse, ScoreItem, ScoresResponse } from '../../../interfaces/score.interface';
import { Company } from '../../../interfaces/company.interface';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { TicketInfoComponent } from '../../../components/ticket-info/ticket-info.component';

const TAIL_LENGTH = 5;

@Component({
	selector: 'app-ticket',
	templateUrl: './ticket.component.html',
	styleUrls: ['./ticket.component.css']
})
export class TicketComponent implements OnInit, OnDestroy {


	idTicket: string;

	timerSub: Subscription;
	updateTicketSub: Subscription;
	updateTicketsSub: Subscription;
	systemMessagesSub: Subscription;

	showAlert = false;
	coming: boolean = false;
	company: Company;
	ticket: Ticket;
	ticketTmEnd: Date = null;
	tickets: Ticket[] = [];
	ticketsTail: Ticket[] = [];
	averageToAtt: string; // millisencods
	ticketsAhead: number;
	scoreItems: ScoreItem[] = [];
	scores = new Map();

	private subjectUpdateTickets$ = new Subject();

	constructor(
		private wsService: WebsocketService,
		public publicService: PublicService,
		private router: Router,
		private route: ActivatedRoute,
		private bottomSheet: MatBottomSheet
	) { }

	async ngOnInit() {

		this.route.params.subscribe(data => {
			this.idTicket = data.idTicket;
		})


		if (!this.idTicket) {
			this.publicService.clearPublicSession();
			this.router.navigate(['/home']);
			this.publicService.snack('No hay ticket para gestionar', 5000)
			return;
		}

		// Get Ticket Data
		this.publicService.getTicket(this.idTicket).subscribe(async (data: any) => {
			this.ticket = data.ticket;
			this.company = data.ticket.id_company;
			await this.getTickets();
		})

		// System Messages Subscription
		this.systemMessagesSub = this.wsService.escucharSystem().subscribe(txMessage => {
			this.publicService.snack(txMessage, null, 'ACEPTAR');
		})

		// Update Tickets List Subscription (request for all clients)
		this.updateTicketsSub = this.wsService.updateClients().subscribe(async () => {
			await this.getTickets();
		});

		// Update active ticket subscription    
		this.updateTicketSub = this.wsService.updateTicket().subscribe((ticket: Ticket) => {
			// id_company en el metodo provide() del backend NO viene populado
			ticket.id_company = this.ticket?.id_company;
			this.ticket = ticket;
			this.checkEnd(this.ticket);
			this.publicService.updateStorageTickets(ticket);
		});

	}

	async getTickets() {

		if (!this.ticket || !this.company) { return; }

		const idCompany = this.company._id;

		this.publicService.getTickets(idCompany).subscribe((data: TicketsResponse) => {

			if (data.ok) {
				this.tickets = data.tickets;
				// pick my ticket
				this.ticket = this.tickets.find(ticket => ticket._id === this.ticket._id);

				this.ticketsTail = data.tickets
					.filter(ticket => ticket.tm_provided !== null)
					.sort((a: Ticket, b: Ticket) => + new Date(b.tm_provided) - +new Date(a.tm_provided))
					.slice(0, TAIL_LENGTH);

				this.checkEnd(this.ticket);

				// si existe sesión dispara un timer para titilar el número del ticket
				if (this.ticket?.id_session && !this.timerSub) {
					this.timerSub = interval(500).subscribe(data => {
						this.showAlert = !this.showAlert;
					})
				}

				// si ya no hay session finaliza el observable showAlert
				if (!this.ticket?.id_session) {
					if (this.timerSub) { this.timerSub.unsubscribe(); }
					this.showAlert = false;
				}

				if (this.ticket && this.ticket.tm_provided === null && this.ticket.tm_intervals) { this.calculateTimeToAtt(); }

				const audio = new Audio();
				audio.src = '../../assets/bell.wav';
				audio.load();
				audio.play();
			}
		})
	}

	async checkEnd(ticket: Ticket) {
		if (ticket.tm_end !== null) {
			this.ticketTmEnd = ticket.tm_end;
			let idSection = this.ticket.id_section._id;
			this.publicService.getScoreItems(idSection).subscribe((data: ScoreItemsResponse) => {
				if (data.ok) {
					this.scoreItems = data.scoreitems;
				} else {
					setTimeout(() => {
						this.publicService.clearPublicSession();
					}, 5000);
				}
			})

		}

	}

	calculateTimeToAtt(): void {
		let ticketsEnd = this.tickets.filter(ticket => ticket.tm_end !== null);
		let ticketsWaiting = this.tickets.filter(ticket => ticket.tm_end === null);

		// ticketsEndDesc: se usa para el cálculo de tiempos de atención 
		// sólo tickets ordenados del último finalizado al primero
		// sólo la cantidad en TAIL,
		let ticketsEndDesc = ticketsEnd
			.sort((a: Ticket, b: Ticket) => +new Date(b.tm_end) - +new Date(a.tm_end))
			.slice(0, TAIL_LENGTH)
			.filter(ticket => {
				return (
					ticket.tm_att !== null // elimino cancelados (tm_att===null && tm_end!=null)
				);
			});

		if (ticketsEndDesc.length === 0) {
			this.averageToAtt = 'Sin datos todavía'
			return;
		}
		// ticketsSessionDesc: se usa para el cálculo de tiempos de ocio 
		// sólo tickets ordenados por sesion finalizado al primero
		// sólo la cantidad en TAIL,

		let ticketsSessionDesc = ticketsEnd
			.sort((a: Ticket, b: Ticket) => b.id_session > a.id_session ? -1 : 1)
			.slice(0, TAIL_LENGTH)

		// Ta, sumatoria de últimos tiempos de atención 
		let sumTa = 0;
		for (let ticket of ticketsEndDesc) {
			sumTa += ticket.tm_end.getTime() - ticket.tm_att.getTime();
		}

		// OCIO
		// Sumatoria de tiempos transcurridos entre TM_ATT hasta TM_END del anterior
		// o TM_END hasta TM_ATT del siguiente ticket (según orden sort() de ticketsSessionDesc) 
		// SIEMPRE contando de ticket a ticket en LA MISMA SESION Y EL MISMO SKILL.
		// (Visión asistente)
		// ESCRITORIO 1:	T0 -> [a....5....e]<------To------>[a...2...e]   
		// ESCRITORIO 2:	T0 ->      [a.6.e]<--To-->[a...3...e]   
		// ESCRITORIO 3:	T0 ->           [a..4..e]<----To---->[a...1...e]       
		// T0 (tiempo de comienzo de atención que no cuenta)
		// El orden es [a.1.e],[a.2.e],[a.N.e] (estan ordenados por orden de TM_END)

		let sumTo = 0;
		let idSession = null;
		for (let ticket of ticketsEndDesc) {
			let tmEnd = null;
			let tmAtt = null;
			// 		      t2                 t1
			// orden <----|------------------|---------
			// [a....5....e]<------To------>[a...2...e] 
			if (ticket.id_session === idSession) {
				tmEnd = ticket.tm_end;
				sumTo += ticket.tm_att.getTime() - ticket.tm_att.getTime();
				tmAtt = 0;
				tmEnd = 0;
			} else {
				tmAtt = ticket.tm_att;
			}

			idSession = ticket._id;
			if (sumTo === 0) { // es el primer ticket de los últimos finalizados que entra en el cálculo
				tmAtt = ticket.tm_att;
			}
		}

		// cuantos tengo adelante
		let count = 0;
		for (let ticket of ticketsWaiting) {
			if (ticket._id === this.ticket._id) {
				break;
			} else {
				count++;
			}
		}

		/*
			-> espera | atendidos ->
			T5,To,T4,To,T3,To,T2,To,T1,To | AtA, To, AtB, To, AtC
			( Avg(To) + Avg(Ta) ) * ΣT (tickets pendientes)
			Avg -> Promedio
			To -> Tiempo de ocio (ocio de asistentes entre ticket y ticket, entre un tm_end y un tm_att del siguiente ticket)
			At -> Tiempo de atención (att -> end)
			ΣT -> Sumatoria de tickets en espera (T1+T2+...+Tn)
		*/

		this.ticketsAhead = count;
		let AvgTa = sumTa / ticketsEndDesc.length;
		let AvgTo = sumTo / ticketsEndDesc.length;

		let AvgAtt = ((AvgTa + AvgTo) * (this.ticketsAhead)) + ((AvgTa + AvgTo) / 4);
	//	this.averageToAtt = `Su mesa estará lista en ${mom_ent.duration(AvgAtt).humanize()}`;
	}

	toggle(chat): void {
		chat.toggle();
	}

	// ---------------------
	// Client actions

	enCamino(): void {
		this.coming = true;
		let idSocketDesk = this.ticket.id_socket_waiter;
		this.wsService.emit('cliente-en-camino', idSocketDesk);
	}

	callWaiter(txCall: string) {
		let idTicket = this.ticket._id;
		this.publicService.callWaiter(idTicket, txCall).subscribe((data: TicketResponse) => {
			if (data.ok) {
				this.ticket.tx_call = data.ticket.tx_call;
				this.publicService.snack(data.msg, 3000, 'ACEPTAR')
			}
		});
	}

	endTicket(): Promise<void> {
		return new Promise(resolve => {
			this.publicService.snack('Esta acción finalizara su turno', 5000, 'TERMINAR').then((ok) => {
				if (ok) {
					const idTicket = this.ticket._id;
					const reqBy = 'client';
					this.publicService.endTicket(idTicket, reqBy).subscribe((data: TicketResponse) => {
						if (data.ok) {
							resolve();
							this.publicService.snack(data.msg, 3000, 'ACEPTAR')
							this.publicService.clearPublicSession();
							this.router.navigate(['/home']);
						}
					}, () => {
						this.publicService.clearPublicSession();
						this.router.navigate(['/home']);
					});
				}
			})
		})
	}

	setScore(idItem: string, nmScore: number): void {
		this.scores.set(idItem, nmScore);

		if (this.scores.size === this.scoreItems.length) {
			let idTicket = this.ticket._id;
			let dataScores: Score[] = [];
			this.scores.forEach(function (valor, llave, mapaOrigen) {

				dataScores.push({ id_ticket: idTicket, id_scoreitem: llave, cd_score: valor });
			});

			this.publicService.sendScores(dataScores).subscribe((d: ScoresResponse) => {
				if (d.ok) {
					delete this.ticket;
					this.publicService.snack('Gracias!', 5000).then(ok => {
						if (ok) this.publicService.clearPublicSession();
					})
				}
			})

		}
	}

	openBottomSheet = (): void => {
		this.bottomSheet.open(TicketInfoComponent, { data: this.ticket });
	}

	ngOnDestroy() {
		if (this.updateTicketSub) { this.updateTicketSub?.unsubscribe(); }
		if (this.updateTicketsSub) { this.updateTicketsSub?.unsubscribe(); }
		if (this.systemMessagesSub) { this.systemMessagesSub?.unsubscribe(); }
		if (this.timerSub) { this.timerSub.unsubscribe(); }
	}

}

interface Score {
	id_ticket: string,
	id_scoreitem: string,
	cd_score: number
}



