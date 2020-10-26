import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// interfaces
import { TicketResponse, TicketsResponse } from '../../../interfaces/ticket.interface';
import { Ticket } from '../../../interfaces/ticket.interface';

// services
import { WebsocketService } from '../../../services/websocket.service';
import { PublicService } from '../public.service';

// libs
import { MatSnackBar, MatSnackBarDismiss } from '@angular/material/snack-bar';
import { Subject, interval, Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import moment from 'moment';
import { SharedService } from 'src/app/services/shared.service';
import { ScoreItemsResponse, ScoreItem, ScoresResponse } from '../../../interfaces/score.interface';

const TAIL_LENGTH = 10;

@Component({
	selector: 'app-myticket',
	templateUrl: './myticket.component.html',
	styleUrls: ['./myticket.component.css']
})
export class MyticketComponent implements OnInit {

	timer: Subscription;
	showAlert = false;
	coming: boolean = false;
	ticket: Ticket;
	ticketTmEnd: number = null;
	tickets: Ticket[] = [];
	ticketsTail: Ticket[] = [];
	averageToAtt: string; // millisencods
	ticketsAhead: number;
	scoreItems: ScoreItem[] = []
	scores = new Map();

	private subjectUpdateTickets$ = new Subject();

	constructor(
		private wsService: WebsocketService,
		public publicService: PublicService,
		public sharedService: SharedService,
		private snack: MatSnackBar,
		private router: Router
	) { }

	ngOnInit(): void {


		if (!this.publicService.ticket) {
			this.router.navigate(['/public/tickets']);
			this.sharedService.snack('Debe obtener un turno primero.', 5000)
			return;
		}

		this.coming = false;
		const body = document.getElementsByTagName('body')[0];
		body.classList.remove('container');

		// listen for tickets
		this.wsService.updateTicketsClients().subscribe(this.subjectUpdateTickets$);
		this.subjectUpdateTickets$.subscribe(() => {
			this.getTickets();
		});

		if (this.publicService.company && this.publicService.ticket) {
			this.ticket = this.publicService.ticket;
			let idCompany = this.publicService.company._id;
			this.publicService.getTickets(idCompany);
		} else {
			this.router.navigate(['/public']);
			this.snack.open('Por favor ingrese una empresa primero!', null, { duration: 5000 });
		}

		this.getTickets();
	}

	async getTickets() {
		if (!this.ticket) { return; }
		let idCompany = this.ticket.id_company;
		this.publicService.getTickets(idCompany).subscribe((data: TicketsResponse) => {
			if (data.ok) {
				this.tickets = data.tickets;
				this.ticketsTail = data.tickets
					.filter(ticket => ticket.tm_provided !== null)
					.sort((a: Ticket, b: Ticket) => b.tm_provided - a.tm_provided)
					.slice(0, TAIL_LENGTH);
				this.pickMyTicket();

				if (this.ticket?.id_session && !this.timer) {
					this.timer = interval(500).subscribe(data => {
						this.showAlert = !this.showAlert;
					})
				} else {
					if (this.timer) { this.timer.unsubscribe(); }
					this.showAlert = false;
				}

				if (this.ticket && this.ticket.tm_provided === null) { this.calculateTimeToAtt(); }

				const audio = new Audio();
				audio.src = '../../assets/bell.wav';
				audio.load();
				audio.play();
			}
		})
	}

	pickMyTicket(): void {
		const pickMyTicket = this.tickets.filter(ticket => (
			ticket._id === this.ticket._id
		))[0];

		if (pickMyTicket) {
			if (pickMyTicket.tm_end !== null) {
				this.getScoreItems().then(() => {
					this.ticketTmEnd = pickMyTicket.tm_end;
					this.publicService.clearPublicSession();
				})
			} else {
				this.ticket = pickMyTicket;
				this.publicService.ticket = pickMyTicket;
				localStorage.setItem('ticket', JSON.stringify(this.ticket));
			}
		}
	}

	calculateTimeToAtt(): void {
		let ticketsEnd = this.tickets.filter(ticket => ticket.tm_end !== null);
		let ticketsWaiting = this.tickets.filter(ticket => ticket.tm_end === null);

		// ticketsEndDesc: se usa para el cálculo de tiempos de atención 
		// sólo tickets ordenados del último finalizado al primero
		// sólo la cantidad en TAIL,
		let ticketsEndDesc = ticketsEnd
			.sort((a: Ticket, b: Ticket) => b.tm_end - a.tm_end)
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
			sumTa += ticket.tm_end - ticket.tm_att;
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
			let tmEnd = 0;
			let tmAtt = 0;
			// 		      t2                 t1
			// orden <----|------------------|---------
			// [a....5....e]<------To------>[a...2...e] 
			if (ticket.id_session === idSession) {
				tmEnd = ticket.tm_end;
				sumTo += ticket.tm_att - ticket.tm_att;
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
		this.averageToAtt = `Su mesa estará lista en ${moment.duration(AvgAtt).humanize()}`;
	}

	toggle(chat): void {
		chat.toggle();
	}

	// ---------------------
	// Client actions

	enCamino(): void {
		this.coming = true;
		let idSocketDesk = this.publicService.ticket.id_socket_waiter;
		this.wsService.emit('cliente-en-camino', idSocketDesk);
	}

	callWaiter(txCall: string) {
		let idTicket = this.ticket._id;
		this.publicService.callWaiter(idTicket, txCall).subscribe((data: TicketResponse) => {
			if (data.ok) {
				this.ticket.tx_call = data.ticket.tx_call;
				this.snack.open(data.msg, 'ACEPTAR', { duration: 2000 });
			}
		});
	}

	endTicket() {
		return new Promise(resolve => {
			this.sharedService.snack('Esta acción finalizara su turno', 5000, 'TERMINAR').then((ok) => {
				if (ok) {
					let idTicket = this.ticket._id;
					this.publicService.endTicket(idTicket).subscribe((data: TicketResponse) => {
						if (data.ok) {
							resolve();
							this.snack.open(data.msg, 'ACEPTAR', { duration: 2000 });
							this.publicService.clearPublicSession();
							this.router.navigate(['/public']);
						}
					});
				}
			})
		})
	}


	// ---------------------

	getScoreItems() {
		return new Promise(resolve => {
			let idSection = this.ticket.id_section._id;
			this.publicService.getScoreItems(idSection).subscribe((data: ScoreItemsResponse) => {
				this.scoreItems = data.scoreitems;
				resolve();
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
				}
			})

			const Toast = Swal.mixin({
				toast: true,
				position: 'center',
				showConfirmButton: false,
				timer: 3000,
				timerProgressBar: true,
				onOpen: (toast) => {
					toast.addEventListener('mouseenter', Swal.stopTimer)
					toast.addEventListener('mouseleave', Swal.resumeTimer)
				}
			})

			Toast.fire({
				icon: 'success',
				title: '¡Gracias!'
			}).then(data => {
				if (data.isDismissed) {
					this.publicService.clearPublicSessionComplete();
				}
			})
		}






	}

	ngOnDestroy() {
		this.subjectUpdateTickets$.complete();
		if (this.timer) { this.timer.unsubscribe(); }

	}

}

interface Score {
	id_ticket: string,
	id_scoreitem: string,
	cd_score: number
}



