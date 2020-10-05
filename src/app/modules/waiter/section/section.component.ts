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

		this.readSections()
		this.readSectionTables()
		this.getTickets();

		// hot subjects subscribe to socket.io listeners
		this.wsService.updateTicketsWaiters().subscribe(this.subjectUpdateTickets$);
		this.subjectUpdateTickets$.subscribe(() => {
			this.readSectionTables()
			this.getTickets();
		});

		this.loading = false;
	}

	getTickets() {
		// traigo todos los tickets para el sector seleccionado (todas sus mesas)
		let idCompany = this.loginService.user.id_company?._id;
		return this.waiterService.getTickets(idCompany).subscribe((data: TicketsResponse) => {
			// MESA: verifico si existe un ticket actualmente en curso 
			const sectionTickets = data.tickets.filter(ticket => {
				return (
					// obtengo todos los tickets atendidos, no finalizados para el sector del camarero
					ticket.id_session?.id_section === this.waiterService.section._id &&
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
					'tickets': ticketsPendingAllSections.filter(ticket => ticket.id_session?.id_section === section._id && ticket.tm_end === null)
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

	clearTableSession(ticket: Ticket) {
		let table = this.tables.filter(table => table.id_session?.id_ticket._id === ticket._id)[0];
		table.tx_status = 'paused';
		table.id_session = null;
	}

	clearSectionSession() {
		delete this.waiterService.section;
		if (localStorage.getItem('section')) { localStorage.removeItem('section'); }
		this.router.navigate(['waiter/home']);
	}

	releaseSection() {

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

	readSections() {

		let idCompany = this.waiterService.section.id_company;
		this.waiterService.readSections(idCompany).subscribe((data: SectionsResponse) => {
			if (data.ok) {
				this.sections = data.sections;
			}
		})

	}

	readSectionTables() {
		let idSection = this.waiterService.section._id;
		this.waiterService.readSectionTables(idSection).subscribe((data: TablesResponse) => {
			if (data.ok) {
				this.tables = data.tables;
			}
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

	toggleTableStatus = (table: Table) => {

		let idTable = table._id;
		this.waiterService.toggleTableStatus(idTable).subscribe((data: TableResponse) => {
			if (data.ok) {
				let tableToChangeStatus = this.tables.filter(table => table._id === data.table._id)[0];
				tableToChangeStatus.tx_status = data.table.tx_status;
			}
		},
			() => {
				// on error update all sliders stats
				this.readSectionTables();
			})
	}

	// ========================================================
	// ACTIONS
	// ========================================================

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
		let idTicket = ticket._id;
		if (this.tickets) {
			let snackMsg = 'Desea finalizar el ticket actual?'
			await this.askForContinue(snackMsg).then(() => {
				this.waiterService.endTicket(idTicket).subscribe((resp: TicketResponse) => {
					if (resp.ok) {
						this.clearTicketSession(ticket);
						this.clearTableSession(ticket);
						this.message = resp.msg;
					}
				})
			}).catch(() => {
				return;
			})
		}
	}

	attendedTicket = (idTicket: string) => {
		this.waiterService.attendedTicket(idTicket).subscribe((resp: TicketResponse) => {
			if (resp.ok) {
				let table = this.tables.filter(table => table.id_session?.id_ticket._id === resp.ticket._id)[0];
				table.id_session.id_ticket.bl_called = false;
				this.message = resp.msg;
			}
		})
	}

	ngOnDestroy() {
		this.subjectUpdateTickets$.complete();
		this.subjectTurnoCancelado$.complete();
	}


}
