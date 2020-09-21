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
	scores = new Map();

	allMytickets: Ticket[] = [];
	myTicket: Ticket;
	ticketTmEnd: number = null;

	lastTicket: Ticket;
	ticketsAll: Ticket[] = [];
	ticketsCalled: Ticket[] = [];
	ticketsTail: Ticket[] = [];
	ticketsEnd: Ticket[] = [];
	ticketsWaiting: Ticket[] = [];
	averageToAtt: string; // millisencods
	ticketsAhead: number;
	assistantWorking: number;
	assistantWorkingMySkill: number;

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
			this.sharedService.snackShow('Debe obtener un turno primero.', 5000)
			return;
		} 

		this.coming = false;
		const body = document.getElementsByTagName('body')[0];
		body.classList.remove('container');

		// listen for tickets
		this.wsService.escucharUpdatePublic().subscribe(this.subjectUpdateTickets$);
		this.subjectUpdateTickets$.subscribe(() => {
			this.getTickets();
		});

		if (this.publicService.company && this.publicService.ticket) {
			this.myTicket = this.publicService.ticket;
			let idCompany = this.publicService.company._id;
			this.publicService.getTickets(idCompany);
		} else {
			this.router.navigate(['/public']);
			this.snack.open('Por favor ingrese una empresa primero!', null, { duration: 5000 });
		} 

		this.getTickets();
	}

	async getTickets() {
		// traigo todos los tickets
		if(!this.myTicket){
			return;
		}
		let idCompany = this.myTicket.id_company;
		this.publicService.getTickets(idCompany).subscribe((data: TicketsResponse) => {
			if (data.ok) {

				this.ticketsAll = data.tickets;
				this.ticketsEnd = data.tickets.filter(ticket => ticket.tm_end !== null);
				this.ticketsWaiting = data.tickets.filter(ticket => ticket.tm_end === null);
				this.ticketsCalled = data.tickets.filter(ticket => ticket.tm_att !== null);
				this.ticketsTail = [...this.ticketsCalled].sort((a: Ticket, b: Ticket) => b.tm_att - a.tm_att).slice(0, TAIL_LENGTH);
				this.lastTicket = this.ticketsTail[0];
				this.updateMyTicket();

				if (this.myTicket?.id_session) {
					this.timer = interval(500).subscribe(data => {
						this.showAlert = !this.showAlert;
					})
				} else {
					if(this.timer){this.timer.unsubscribe();}
					this.showAlert = false;
				}

				if (this.myTicket) { this.calculateTimeToAtt(); } 
				const audio = new Audio();
				audio.src = '../../assets/bell.wav';
				audio.load();
				audio.play();
			}
		})
	}

	calculateTimeToAtt(): void {
		// ticketsEndDesc: se usa para el cálculo de tiempos de atención 
		// sólo tickets ordenados del último finalizado al primero
		// sólo la cantidad en TAIL,
		// sólo para el skill del ticket del cliente

		let ticketsEndDesc = this.ticketsEnd
		.sort((a: Ticket, b: Ticket) => b.tm_end - a.tm_end)
		.slice(0, TAIL_LENGTH)
		.filter(ticket => {
			return (
				ticket.id_skill._id === this.myTicket.id_skill._id && // calculo solo para el skill del ticket
				ticket.tm_att !== null // elimino cancelados (tm_att===null && tm_end!=null)
				);
			});
			
			if (ticketsEndDesc.length === 0 ){
				this.averageToAtt = 'Sin datos todavía'
				return;
			}
		// ticketsSessionDesc: se usa para el cálculo de tiempos de ocio 
		// sólo tickets ordenados por sesion finalizado al primero
		// sólo la cantidad en TAIL,
		// sólo para el skill del ticket del cliente
		let ticketsSessionDesc = this.ticketsEnd
			.sort((a: Ticket, b: Ticket) => b.id_session > a.id_session ? -1 : 1)
			.slice(0, TAIL_LENGTH)
			.filter(ticket => ticket.id_skill._id === this.myTicket.id_skill._id)

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
		for (let ticket of this.ticketsWaiting) {
			if (ticket._id === this.myTicket._id) {
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
		this.averageToAtt = `Será atendido en ${moment.duration(AvgAtt).humanize()}`;
	}

	updateMyTicket(): void {
		if (this.myTicket) { // client and assistant
			// pick LAST ticket
			const pickMyTicket = this.ticketsAll.filter(ticket => (
				ticket.id_root === this.myTicket.id_root && ticket.id_child === null
			))[0];

			if (pickMyTicket) {

				if (pickMyTicket.tm_end !== null && pickMyTicket.id_child === null) {
					// El ticket finalizó.
					this.myTicket = null;
					this.ticketTmEnd = pickMyTicket.tm_end;
					this.publicService.clearPublicSession();
				} else {
					this.myTicket = pickMyTicket;
					this.publicService.ticket = pickMyTicket;
					localStorage.setItem('ticket', JSON.stringify(this.myTicket));

					this.allMytickets = this.ticketsAll.filter(ticket => (
						(ticket.id_root === pickMyTicket.id_root)
					))
				}
			} 
		}
	}

	toggle(chat): void {
		chat.toggle();
	}

	enCamino(): void {
		this.coming = true;
		let idSocketDesk = this.publicService.ticket.id_socket_desk;
		this.wsService.emit('cliente-en-camino', idSocketDesk);
	}

	cancelTicket(): void {
		this.snack.open('Desea cancelar el turno?', 'SI, CANCELAR', { duration: 10000 }).afterDismissed().subscribe((data: MatSnackBarDismiss) => {
			if (data.dismissedByAction) {
				let idTicket = this.myTicket._id;
				this.publicService.cancelTicket(idTicket).subscribe((data: TicketResponse) => {
					if (data.ok) {
						this.snack.open(data.msg, 'ACEPTAR', { duration: 2000 });
						this.publicService.clearPublicSession();
						this.router.navigate(['/public']);
					}
				});
			}
		});
	}

	setScore(idTicket: string, cdScore: number): void {
		this.scores.set(idTicket, cdScore);

		if (this.allMytickets.length === this.scores.size) {
			let dataScores: Score[] = [];

			this.scores.forEach(function (valor, llave, mapaOrigen) {
				dataScores.push({ id_ticket: llave, cd_score: valor });
			});


			this.publicService.sendScores(dataScores).subscribe((d) => {
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
	cd_score: number
}



