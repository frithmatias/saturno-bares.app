import { Component, OnInit } from '@angular/core';
import { WebsocketService } from '../../../services/websocket.service';
import { PublicService } from '../public.service';
import { Ticket, TicketsResponse } from 'src/app/interfaces/ticket.interface';
import { Subject } from 'rxjs';
const TAIL_LENGTH = 4;
@Component({
	selector: 'app-screen',
	templateUrl: './screen.component.html',
	styleUrls: ['./screen.component.css']
})
export class ScreenComponent implements OnInit {
	ticketsCalled: Ticket[] = [];
	ticketsTail: Ticket[] = [];
	lastTicket: Ticket;
	private subjectUpdateTickets$ = new Subject();
	constructor(
		private wsService: WebsocketService,
		public publicService: PublicService
	) { }

	ngOnInit(): void {
		const body = document.getElementsByTagName('body')[0];
		body.classList.remove('container');
		// listen for tickets
		this.wsService.escucharUpdatePublic().subscribe(this.subjectUpdateTickets$);
		let idCompany = this.publicService.company._id;
		this.subjectUpdateTickets$.subscribe(() => {
			this.getTickets(idCompany);
		});
		this.getTickets(idCompany);
	}

	getTickets(idCompany: string) {
		// traigo todos los tickets
		this.publicService.getTickets(idCompany).subscribe((data: TicketsResponse) => {
			if(data.ok){
				this.ticketsCalled = data.tickets.filter(ticket => ticket.tm_att !== null);
				this.ticketsTail = [...this.ticketsCalled].sort((a: Ticket, b: Ticket) => b.tm_att - a.tm_att).slice(0, TAIL_LENGTH);
				this.lastTicket = this.ticketsTail[0];

				const audio = new Audio();
				audio.src = '../../assets/bell.wav';
				audio.load();
				audio.play();
			}
		})
	}

	ngOnDestroy() {
		this.subjectUpdateTickets$.complete();
	}
}



