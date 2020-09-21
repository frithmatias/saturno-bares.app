import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WebsocketService } from 'src/app/services/websocket.service';
import { TicketResponse, TicketsResponse } from '../../../interfaces/ticket.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { interval, Subscription, Subject } from 'rxjs';
import { take, takeUntil, tap, map } from 'rxjs/operators';
import { DesktopResponse } from 'src/app/interfaces/desktop.interface';
import { Skill, SkillsResponse } from 'src/app/interfaces/skill.interface';
import { AssistantService } from '../../../modules/assistant/assistant.service';
import { LoginService } from 'src/app/services/login.service';

const DESK_TIMEOUT = 2; // 60 segundos
const DESK_EXTRATIME = 5; // 120 segundos
export interface Tile {
	color: string;
	cols: number;
	rows: number;
	text: string;
}
@Component({
	selector: 'app-desktop',
	templateUrl: './desktop.component.html',
	styleUrls: ['./desktop.component.css']
})
export class DesktopComponent implements OnInit {
	loading = false;
	waitForClient: boolean = false;
	comingClient: boolean = false;

	pendingTicketsCount: number = 0;
	pendingTicketsBySkill: any[] = [];

	timerCount: number = DESK_TIMEOUT;
	cdDesk: string;
	idDesk: string;
	tmWaitingStr: string = '--:--:--';
	tmAttention: string = '--:--:--';
	tmWaitingSub: Subscription;
	tmExtraTimeSub: Subscription;
	tmRunSub: Subscription;
	message: string = '';
	skills: Skill[] = [];
	skillsAssistantThisCompany: Skill[] = [];
	skillSelected: string = '';
	blPriority = false;

	private subjectUpdateTickets$ = new Subject();
	private subjectTurnoCancelado$ = new Subject();

	constructor(
		public loginService: LoginService,
		public assistantService: AssistantService,
		private wsService: WebsocketService,
		private snack: MatSnackBar,
		private router: Router
	) { }

	async ngOnInit() {
		this.loading = true;

		if (!this.assistantService.desktop) {
			this.router.navigate(['/assistant/home']);
			return;
		}

		await this.readSkills().then((data: Skill[]) => {
			this.skills = data;
		}).catch(() => { this.snack.open('Error al obtener los skills', null, { duration: 2000 }); })

		await this.getTickets();

		// hot subjects subscribe to socket.io listeners
		this.wsService.escucharUpdateDesktops().subscribe(this.subjectUpdateTickets$);
		this.subjectUpdateTickets$.subscribe(() => {
			this.getTickets();
		});

		this.wsService.escucharTicketCancelled().subscribe(this.subjectTurnoCancelado$);
		this.subjectTurnoCancelado$.subscribe(idCancelledTicket => {
			let idActiveTicket = this.assistantService.ticket?._id;
			if (idCancelledTicket === idActiveTicket) {
				this.snack.open('El turno fue cancelado por el cliente', null, { duration: 10000 });
				this.clearTicketSession();
				this.getTickets();
			}
		});

		this.loading = false;
	}

	async getTickets() {
		// traigo todos los tickets
		let idCompany = this.loginService.user.id_company?._id;
		return this.assistantService.getTickets(idCompany).subscribe((data: TicketsResponse) => {
			// DESKTOP: verifico si existe un ticket anterior pendiente 
			const desktopPendingTicket = data.tickets.filter(ticket => {
				return (
					ticket.id_session?.id_desktop._id === this.assistantService.desktop.id_session.id_desktop._id &&
					ticket.id_session?.id_desktop._id !== undefined &&
					ticket.tm_att !== null &&
					ticket.tm_end === null &&
					ticket.id_child === null
				);
			})[0];
			if (desktopPendingTicket) {
				this.message = 'Existe un ticket pendiente de resolución'
				this.assistantService.ticket = desktopPendingTicket;
				localStorage.setItem('ticket', JSON.stringify(desktopPendingTicket));
			} else {
				delete this.assistantService.ticket;
			}

			let skillsCompany = this.skills;
			let skillsAssistantArray = [];
			this.loginService.user.id_skills.forEach(skill => skillsAssistantArray.push(skill._id));

			const ticketsWaitingAssistant = data.tickets.filter(ticket => ticket.tm_end === null && skillsAssistantArray.includes(ticket.id_skill?._id));
			const ticketsWaitingTeam = data.tickets.filter(ticket => ticket.tm_end === null);

			this.pendingTicketsCount = ticketsWaitingAssistant.length;

			if (ticketsWaitingAssistant.length > 0) {
				this.message = `Hay ${ticketsWaitingAssistant.length} turnos en espera`;
			} else {
				this.message = `No hay turnos pendientes.`
			}

			// table pending skills
			this.pendingTicketsBySkill = [];

			for (let skillCompany of skillsCompany) {
				if (skillsAssistantArray.includes(skillCompany._id)) {
					this.skillsAssistantThisCompany.push(skillCompany);
				}
				this.pendingTicketsBySkill.push({
					'id': skillCompany._id,
					'assigned': skillsAssistantArray.includes(skillCompany._id),
					'cd_skill': skillCompany.cd_skill,
					'tx_skill': skillCompany.tx_skill,
					'tickets': ticketsWaitingTeam.filter(ticket => ticket.id_skill?._id === skillCompany._id && ticket.tm_end === null)
				});

			}
			this.loading = false;
		})


	}

	clearTicketSession() {
		delete this.assistantService.ticket;
		delete this.assistantService.chatMessages;
		if (localStorage.getItem('ticket')) { localStorage.removeItem('ticket'); }
		this.tmWaitingStr = '--:--:--';
		this.tmAttention = '--:--:--';
		this.timerCount = DESK_TIMEOUT;
		this.waitForClient = false;
		if (this.tmWaitingSub) { this.tmWaitingSub.unsubscribe(); }
		if (this.tmExtraTimeSub) { this.tmExtraTimeSub.unsubscribe(); }
		if (this.tmRunSub) { this.tmRunSub.unsubscribe(); }
		this.getTickets();
	}

	clearDesktopSession() {
		delete this.assistantService.desktop;
		if (localStorage.getItem('desktop')) { localStorage.removeItem('desktop'); }
		this.router.navigate(['assistant/home']);
	}

	async releaseDesktop() {
		if (this.assistantService.ticket) {
			let snackMsg = 'Tiene una sesión de turno activa. ¿Desea finalizarla?';
			return await this.askForContinue(snackMsg).then(() => {
				// end ticket session
				let idTicket = this.assistantService.ticket._id;
				this.assistantService.endTicket(idTicket).subscribe((resp: TicketResponse) => {
					if (resp.ok) {
						let idDesktop = this.assistantService.ticket._id;
						this.clearTicketSession();
						this.assistantService.releaseDesktop(idDesktop).subscribe((data: DesktopResponse) => {
							if (data.ok) {
								this.clearDesktopSession();
							} else {
								this.message = resp.msg;
							}
						})
					}
				})
			}).catch(() => {
				return;
			})
		}

		// end desktop session
		let idDesktop = this.assistantService.desktop._id;
		this.assistantService.releaseDesktop(idDesktop).subscribe((data: DesktopResponse) => {
			if (data.ok) {
				this.clearDesktopSession();
			}
		})

	}

	readSkills(): Promise<Skill[]> {
		return new Promise((resolve, reject) => {
			let idCompany = this.loginService.user.id_company?._id;
			this.assistantService.readSkills(idCompany).subscribe((data: SkillsResponse) => {
				if (data.ok) {
					resolve(data.skills);
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

		if (!this.assistantService.ticket) {

			let idSession = this.assistantService.desktop.id_session._id;
			let idSocketDesk = this.wsService.idSocket;

			this.assistantService.takeTicket(idSession, idSocketDesk).subscribe((resp: TicketResponse) => {
				this.snack.open(resp.msg, null, { duration: 2000 });
				if (!resp.ok) { // no tickets
					this.waitForClient = false;
					this.message = resp.msg;
				} else {
					this.waitForClient = true;
					this.message = '';
					this.assistantService.ticket = resp.ticket;
					localStorage.setItem('ticket', JSON.stringify(resp.ticket));

					// Seteo el tiempo que el cliente estuvo en espera desde que saco su turno hasta que fué atendido
					this.tmWaitingStr = this.assistantService.getTimeInterval(resp.ticket.tm_start, resp.ticket.tm_att);

					// DESKTOP WAITING TIMERS
					const encamino$ = this.wsService.escucharEnCamino();
					const timer_timeout$ = interval(1000).pipe(map(num => num + 1), take(DESK_TIMEOUT));
					let timeIsOut = false;
					this.tmWaitingSub = timer_timeout$.pipe(
						tap(num => this.timerCount = DESK_TIMEOUT - num),
						takeUntil(encamino$)
					).subscribe(
						data => {	// next
							if (data >= DESK_TIMEOUT - 1) { timeIsOut = true; }
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
										take(DESK_EXTRATIME)
									);

									this.tmExtraTimeSub = timer_extratime$.subscribe(
										num => this.timerCount = DESK_EXTRATIME - num,  // next
										undefined, 	// error
										() => { 	// complete
											this.waitForClient = false;
											this.comingClient = false;
											resolve();
										});
								}

							});

							timerEnd.then(() => {
								// finalizo el tiempo de espera del cliente, comienza el tiempo del asistente.
								const timer_cliente$ = interval(1000);
								const start_cliente = new Date().getTime();
								this.tmRunSub = timer_cliente$.subscribe((data) => {
									this.tmAttention = this.assistantService.getTimeInterval(start_cliente, + new Date());
								});
							});
						});
				}
			});
		}
		this.getTickets();
	}

	async releaseTicket() {
		if (this.assistantService.ticket) {
			let snackMsg = 'Desea soltar el ticket y devolverlo a su estado anterior?';
			await this.askForContinue(snackMsg).then(() => {
				let idTicket = this.assistantService.ticket._id;
				this.assistantService.releaseTicket(idTicket).subscribe((resp: TicketResponse) => {
					if (resp.ok) {
						delete this.assistantService.ticket;
						this.clearTicketSession();
						this.message = resp.msg;
					}
				})
			}).catch(() => {
				return;
			})
		}
	}

	async reassignTicket() {
		if (this.assistantService.ticket) {
			let snackMsg = 'Desea enviar el ticket al skill seleccionado?'
			await this.askForContinue(snackMsg).then(() => {
				let idTicket = this.assistantService.ticket?._id;
				let idSkill = this.skillSelected;
				let blPriority = this.blPriority;
				if (idTicket && idSkill) {
					this.assistantService.reassignTicket(idTicket, idSkill, blPriority).subscribe((resp: TicketResponse) => {
						if (resp.ok) {
							this.blPriority = false;
							this.clearTicketSession();
							this.message = resp.msg;
						}
					});
				}
			}).catch(() => {
				return;
			})
		}
	}

	async endTicket() {
		if (this.assistantService.ticket) {
			let snackMsg = 'Desea finalizar el ticket actual?'
			await this.askForContinue(snackMsg).then(() => {
				let idTicket = this.assistantService.ticket._id;
				this.assistantService.endTicket(idTicket).subscribe((resp: TicketResponse) => {
					if (resp.ok) {
						this.clearTicketSession();
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
