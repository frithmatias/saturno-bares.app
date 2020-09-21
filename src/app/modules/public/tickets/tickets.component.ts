import { Component, OnInit } from '@angular/core';
import { WebsocketService } from '../../../services/websocket.service';
import { Router } from '@angular/router';
import { TicketResponse } from '../../../interfaces/ticket.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Skill } from '../../../interfaces/skill.interface';
import { SkillsResponse } from '../../../interfaces/skill.interface';
import { PublicService } from '../public.service';
import Swal from 'sweetalert2';

@Component({
	selector: 'app-tickets',
	templateUrl: './tickets.component.html',
	styleUrls: ['./tickets.component.css']
})
export class TicketsComponent implements OnInit {
	loading: boolean = false;
	skills: Skill[];
	blPriority = false;
	constructor(
		private wsService: WebsocketService,
		public publicService: PublicService,
		private router: Router,
		private snack: MatSnackBar,
	) { }

	ngOnInit(): void {
		if (this.publicService.ticket) {
			this.snack.open('Usted ya tiene un turno!', null, { duration: 2000 });
			this.router.navigate(['/public/myticket']);
		} else {
			if (!this.publicService.company) {
				this.snack.open('Por favor ingrese una empresa primero.', null, { duration: 2000 });
				this.router.navigate(['/public']);
			} else {
				let idCompany = this.publicService.company._id;
				this.wsService.emit('enterCompany', idCompany);
				this.publicService.readSkills(idCompany).subscribe((data: SkillsResponse) => {
					this.skills = data.skills;
				})
			}
		}
	}

	createTicket(idSkill: string): void {
		
		if (localStorage.getItem('user')){
			Swal.fire({
				icon: 'error',
				title: 'Tiene una sesión de usuario activa',
				text: 'Usted está en una página de acceso al público pero tiene una sesión de usuario activa. Para obtener un turno debe cerrar la sesión de usuario o abrir una pestaña en modo incógnito.',
			  })	
			return;
		}

		this.loading = true;

		let idSocket = this.wsService.idSocket;
		let blPriority = this.blPriority;
		this.publicService.createTicket(idSkill, idSocket, blPriority).subscribe(
			(data: TicketResponse) => {
				if (data.ok) {
					localStorage.setItem('ticket', JSON.stringify(data.ticket));
					this.publicService.ticket = data.ticket;
					this.loading = false;
					this.router.navigate(['/public/myticket']);
				}
			}
		);
	}

	salir(): void {
		this.publicService.clearPublicSession();
		this.router.navigate(['/home'])
	}

}
