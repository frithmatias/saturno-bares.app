import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WebsocketService } from '../../../services/websocket.service';
import { TicketResponse, TicketsResponse } from '../../../interfaces/ticket.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { interval, Subscription, Subject } from 'rxjs';
import { take, takeUntil, tap, map } from 'rxjs/operators';
import { TableResponse } from 'src/app/interfaces/table.interface';
import { WaiterService } from '../waiter.service';
import { LoginService } from 'src/app/services/login.service';
import { Table, TablesResponse } from '../../../interfaces/table.interface';
import { Ticket } from 'src/app/interfaces/ticket.interface';
import { Section, SectionsResponse } from '../../../interfaces/section.interface';

const TABLE_TIME_OUT = 2; // 60 segundos
const TABLE_TIME_EXTRA = 5; // 120 segundos
export interface Tile {
	color: string;
	cols: number;
	rows: number;
	text: string;
}
@Component({
	selector: 'app-section',
	templateUrl: './section.component.html',
	styleUrls: ['./section.component.css']
})
export class SectionComponent implements OnInit {
	loading = false;
	waitForClient: boolean = false;
	comingClient: boolean = false;

	pendingTicketsCount: number = 0;
	pendingBySection: any[] = [];

	timerCount: number = TABLE_TIME_OUT;
	tmStrWait: string = '--:--:--';
	tmStrWaitSub: Subscription;
	tmStrAtt: string = '--:--:--';
	tmStrAttSub: Subscription;
	tmExtraTimeSub: Subscription;
	message: string = '';

	sections: Section[] = [];
	tables: Table[] = [];
	tickets: Ticket[] = [];

	sectionSelected: string = ''; // reassign
	blPriority = false;

	private subjectUpdateTickets$ = new Subject();
	private subjectTurnoCancelado$ = new Subject();

	constructor(
		public loginService: LoginService,
		public waiterService: WaiterService,
		private wsService: WebsocketService,
		private snack: MatSnackBar,
		private router: Router
	) { }

	async ngOnInit() {
		this.loading = true;

		if (!this.waiterService.section) {
			this.router.navigate(['/waiter/home']);
			return;
		}

		await this.readSections().then((data: Section[]) => {
			this.sections = data;
		}).catch(() => { this.snack.open('Error al obtener los sectores', null, { duration: 2000 }); })

		await this.readSectionTables().then((data: Table[]) => {
			this.tables = data;
		}).catch(() => { this.snack.open('Error al obtener los sectores', null, { duration: 2000 }); })


		await this.getTickets();

		// hot subjects subscribe to socket.io listeners
		this.wsService.updateTicketsWaiters().subscribe(this.subjectUpdateTickets$);
		this.subjectUpdateTickets$.subscribe(() => {
			this.getTickets();
		});

		this.wsService.escucharTicketCancelled().subscribe(this.subjectTurnoCancelado$);
		this.subjectTurnoCancelado$.subscribe((idCancelledTicket: string) => {
			// obtengo los tickets activos dentro de la sección del camarero
			let activeTickets = this.tickets.filter(ticket => ticket.tm_att !== null && ticket.tm_end === null);
			// si el ticket cancelado esta incluido en los tickets activos, lo cancelo.
			if (activeTickets.map(ticket => ticket._id).includes(idCancelledTicket)) {
				let ticketToCancel = activeTickets.filter(ticket => ticket._id === idCancelledTicket)[0];
				this.snack.open('El turno fue cancelado por el cliente', null, { duration: 10000 });
				this.clearTicketSession(ticketToCancel);
				this.getTickets();
			}
		});

		this.loading = false;
		console.log(this);
	}

	async getTickets() {
		// traigo todos los tickets para el sector seleccionado (todas sus mesas)
		let idCompany = this.loginService.user.id_company?._id;
		return this.waiterService.getTickets(idCompany).subscribe((data: TicketsResponse) => {
			// MESA: verifico si existe un ticket actualmente en curso 
			const sectionTickets = data.tickets.filter(ticket => {
				return (
					// obtengo todos los tickets atendidos, no finalizados para el sector del camarero
					ticket.id_session.id_section === this.waiterService.section._id &&
					ticket.tm_att !== null &&
					ticket.tm_end === null
				);
			});
			if (sectionTickets) {
				this.message = 'Tiene clientes en sus mesas'
				this.tickets = sectionTickets;
				localStorage.setItem('tickets', JSON.stringify(sectionTickets));
			} else {
				delete this.tickets;
			}


			const ticketsPendingThisSection = data.tickets.filter(
				ticket => ticket.tm_end === null && 
				ticket.id_section._id === this.waiterService.section._id
			);
			
			const ticketsPendingAllSections = data.tickets.filter(ticket => ticket.tm_end === null);
			
			this.pendingTicketsCount = ticketsPendingThisSection.length;
			
			if (ticketsPendingThisSection.length > 0) {
				this.message = `Hay ${ticketsPendingThisSection.length} clientes esparando una mesa.`;
			} else {
				this.message = `No hay solicitud de mesa para este sector.`
			}
			
			// table of pending tickets by section
			this.pendingBySection = [];
			
			for (let section of this.sections) {
				this.pendingBySection.push({
					'id': section._id,
					'assigned': this.waiterService.section._id === section._id,
					'cd_table': section.tx_section,
					'tickets': ticketsPendingAllSections.filter(ticket => ticket.id_session.id_section === section._id && ticket.tm_end === null)
				});

			}
			this.loading = false;
		})


	}

	clearTicketSession(ticket: Ticket) { // close ONE client session
		this.tickets = this.tickets.filter(thisTicket => thisTicket._id !== ticket._id);
		this.waiterService.chatMessages = this.waiterService.chatMessages.filter(message => message.id_ticket !== ticket._id)
		localStorage.setItem('tickets', JSON.stringify(this.tickets));
		this.tmStrWait = '--:--:--';
		this.tmStrAtt = '--:--:--';
		this.timerCount = TABLE_TIME_OUT;
		this.waitForClient = false;
		if (this.tmStrWaitSub) { this.tmStrWaitSub.unsubscribe(); }
		if (this.tmStrAttSub) { this.tmStrAttSub.unsubscribe(); }
		if (this.tmExtraTimeSub) { this.tmExtraTimeSub.unsubscribe(); }
		this.getTickets();
	}

	clearTicketsSessions() { // close ALL client sessions
		delete this.tickets;
		delete this.waiterService.chatMessages;
		if( localStorage.getItem('tickets')) {localStorage.removeItem('tickets')};
		this.tmStrWait = '--:--:--';
		this.tmStrAtt = '--:--:--';
		this.timerCount = TABLE_TIME_OUT;
		this.waitForClient = false;
		if (this.tmStrWaitSub) { this.tmStrWaitSub.unsubscribe(); }
		if (this.tmStrAttSub) { this.tmStrAttSub.unsubscribe(); }
		if (this.tmExtraTimeSub) { this.tmExtraTimeSub.unsubscribe(); }
		this.getTickets();
	}

	clearSectionSession() {
		delete this.waiterService.section;
		if (localStorage.getItem('section')) { localStorage.removeItem('section'); }
		this.router.navigate(['waiter/home']);
	}

	async releaseSection() {

		if (this.tickets.length > 0) {
			this.message = 'No puede cerrar la sesión, tiene una sesiones de mesa activas.';
			return;
		}

		let idSection = this.waiterService.section._id;
		this.waiterService.releaseSection(idSection).subscribe((data: TableResponse) => {
			if (data.ok) {
				this.clearSectionSession();
			}
		})

	}

	readSections(): Promise<Section[]> {
		return new Promise((resolve, reject) => {
			let idCompany = this.waiterService.section.id_company;
			this.waiterService.readSections(idCompany).subscribe((data: SectionsResponse) => {
				if (data.ok) {
					resolve(data.sections);
				} else {
					reject([])
				}
			})
		})
	}

	readSectionTables(): Promise<Table[]> {
		return new Promise((resolve, reject) => {
			let idSection = this.waiterService.section._id;
			console.log(this)
			this.waiterService.readSectionTables(idSection).subscribe((data: TablesResponse) => {
				if (data.ok) {
					resolve(data.tables);
				} else {
					reject([])
				}
			})
		})
	}

	askForContinue(snackMsg: string): Promise<boolean> {
		return new Promise((resolve, reject) => {
			this.snack.open(snackMsg, 'ACEPTAR', { duration: 5000 }).afterDismissed().subscribe(data => {
				if (data.dismissedByAction) {
					resolve();
				} else {
					reject()
				}
			});
		})
	}

	async takeTicket() {

		if (!this.tickets) {

			let idSession = this.waiterService.section.id_session._id;
			let idSocketDesk = this.wsService.idSocket;

			this.waiterService.takeTicket(idSession, idSocketDesk).subscribe((resp: TicketResponse) => {
				this.snack.open(resp.msg, null, { duration: 2000 });
				if (!resp.ok) { // no tickets
					this.waitForClient = false;
					this.message = resp.msg;
				} else {
					this.waitForClient = true;
					this.message = '';
					this.tickets.push(resp.ticket);
					localStorage.setItem('tickets', JSON.stringify(resp.ticket));

					// Seteo el tiempo que el cliente estuvo en espera desde que saco su turno hasta que fué atendido
					this.tmStrWait = this.waiterService.getTimeInterval(resp.ticket.tm_start, resp.ticket.tm_att);

					// DESKTOP WAITING TIMERS
					const encamino$ = this.wsService.escucharEnCamino();
					const timer_timeout$ = interval(1000).pipe(map(num => num + 1), take(TABLE_TIME_OUT));
					let timeIsOut = false;
					this.tmStrWaitSub = timer_timeout$.pipe(
						tap(num => this.timerCount = TABLE_TIME_OUT - num),
						takeUntil(encamino$)
					).subscribe(
						data => {	// next
							if (data >= TABLE_TIME_OUT - 1) { timeIsOut = true; }
						},
						undefined, 	// error
						() => { 	// complete
							const timerEnd = new Promise((resolve) => {
								if (timeIsOut) { // Cliente no envió en camino, el operador puede cerrar el turno. 
									this.waitForClient = false;
									this.comingClient = false;
									resolve();
								} else { // Cliente envió en camino, corre un segundo observable que adiciona tiempo de espera.
									this.waitForClient = true;
									this.comingClient = true;
									const timer_extratime$ = interval(1000).pipe(
										map(num => num + 1),
										take(TABLE_TIME_EXTRA)
									);

									this.tmExtraTimeSub = timer_extratime$.subscribe(
										num => this.timerCount = TABLE_TIME_EXTRA - num,  // next
										undefined, 	// error
										() => { 	// complete
											this.waitForClient = false;
											this.comingClient = false;
											resolve();
										});
								}

							});

							timerEnd.then(() => {
									const timer_cliente$ = interval(1000);
									const start_cliente = new Date().getTime();
									// finalizo el tiempo de espera del cliente, comienza el tiempo del asistente.
									this.tmStrAttSub = timer_cliente$.subscribe((data) => {
										const start_cliente = new Date().getTime();
										this.tmStrAtt = this.waiterService.getTimeInterval(start_cliente, + new Date());
									});
								});
						});
				}
			});
		}
		this.getTickets();
	}

	async releaseTicket(ticket: Ticket) {
		if (this.tickets) {
			let snackMsg = 'Desea soltar el ticket y devolverlo a su estado anterior?';
			await this.askForContinue(snackMsg).then(() => {
				let idTicket = ticket._id;
				this.waiterService.releaseTicket(idTicket).subscribe((resp: TicketResponse) => {
					if (resp.ok) {
						this.tickets = this.tickets.filter(ticket => ticket._id !== ticket._id);
						this.clearTicketSession(ticket);
						this.message = resp.msg;
					}
				})
			}).catch(() => {
				return;
			})
		}
	}

	async reassignTicket(ticket: Ticket) {
		let snackMsg = 'Desea enviar el ticket al skill seleccionado?'
		await this.askForContinue(snackMsg).then(() => {
			let idTicket = ticket._id;
			let idSession = this.sectionSelected;
			let blPriority = this.blPriority;
			if (idTicket && idSession) {
				this.waiterService.reassignTicket(idTicket, idSession, blPriority).subscribe((resp: TicketResponse) => {
					if (resp.ok) {
						this.blPriority = false;
						this.clearTicketSession(ticket);
						this.message = resp.msg;
					}
				});
			}
		}).catch(() => {
			return;
		})
	}

	async endTicket(ticket: Ticket) {
		if (this.tickets) {
			let snackMsg = 'Desea finalizar el ticket actual?'
			await this.askForContinue(snackMsg).then(() => {
				let idTicket = ticket._id;
				this.waiterService.endTicket(idTicket).subscribe((resp: TicketResponse) => {
					if (resp.ok) {
						this.clearTicketSession(ticket);
						this.message = resp.msg;
					}
				})
			}).catch(() => {
				return;
			})
		}
	}

	ngOnDestroy() {
		this.subjectUpdateTickets$.complete();
		this.subjectTurnoCancelado$.complete();
	}


}
