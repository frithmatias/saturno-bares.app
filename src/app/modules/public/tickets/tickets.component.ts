import { Component, OnInit } from '@angular/core';
import { WebsocketService } from '../../../services/websocket.service';
import { Router } from '@angular/router';
import { TicketResponse } from '../../../interfaces/ticket.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PublicService } from '../public.service';
import Swal from 'sweetalert2';
import { Section, SectionsResponse } from '../../../interfaces/section.interface';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
	selector: 'app-tickets',
	templateUrl: './tickets.component.html',
	styleUrls: ['./tickets.component.css']
})
export class TicketsComponent implements OnInit {
	loading: boolean = false;
	sections: Section[] = [];
	ticketForm: FormGroup;
	blPriority = false;
	constructor(
		private wsService: WebsocketService,
		public publicService: PublicService,
		private router: Router,
		private snack: MatSnackBar,
	) { }

	ngOnInit(): void {

		this.ticketForm = new FormGroup({
			nmPersons: new FormControl('', [Validators.required]),
			idSection: new FormControl('', [Validators.required]),
		});

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
				this.publicService.readSections(idCompany).subscribe((data: SectionsResponse) => {
					this.sections = data.sections;
				})
			}
		}
	}

	createTicket(): void {

		if (localStorage.getItem('user')) {
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
		let nmPersons = this.ticketForm.value.nmPersons;
		let idSection = this.ticketForm.value.idSection;

		this.publicService.createTicket(idSocket, blPriority, nmPersons, idSection).subscribe(
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

