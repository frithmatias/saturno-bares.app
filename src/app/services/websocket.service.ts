import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable, Observer, of } from 'rxjs';
import { AjaxError } from 'rxjs/ajax';
import { catchError, take, tap, map } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PublicService } from '../modules/public/public.service';
import { User } from '../interfaces/user.interface';
import { Ticket } from 'src/app/interfaces/ticket.interface';

@Injectable({
	providedIn: 'root'
})
export class WebsocketService {
	public socketStatus = false;
	public idSocket = null;

	constructor(
		private socket: Socket,
		private publicService: PublicService,
		private snack: MatSnackBar,
	) {
		this.escucharConexiones();
	}

	escucharConexiones(): void {

		this.socket.on('connect', () => {
			this.idSocket = this.socket.ioSocket.id;
			this.snack.open('Conectado al servidor de reservas', null, { duration: 2000 });
			this.socketStatus = true;
			this.updateSocket();
		});

		this.socket.on('disconnect', () => {
			this.snack.open('Desconectado del servidor de reservas.', null, { duration: 2000 });
			this.socketStatus = false;
		});
	}

	updateClients(): Observable<string> {
		return this.listen('update-clients');
	}

	updateWaiters(): Observable<string> {
		return this.listen('update-waiters');
	}

	updateTicket(): Observable<Object> {
		return this.listen('update-ticket');
	}

	escucharMensajes(): Observable<string> { // chat
		return this.listen('message-private');
	}

	escucharSystem(): Observable<string> {
		return this.listen('message-system'); // admin message to clients
	}

	updateSocket(): void {
		// Sólo si ya existe un usuario loguado o un ticket (cliente)
		if (localStorage.getItem('user')) { // admin / user

			// update localstorage
			let user: User = JSON.parse(localStorage.getItem('user'));
			user.id_socket = this.idSocket;
			localStorage.setItem('user', JSON.stringify(user));

			// Enter new socket user to company room
			let idCompany = user.id_company?._id;
			if (idCompany) { this.emit('enterCompany', idCompany); }

		}

		if (localStorage.getItem('tickets')) { // client

			// update localstorage
			let tickets = JSON.parse(localStorage.getItem('tickets'));
			for (let ticket of tickets) {
				ticket.id_socket_client = this.idSocket; 
				let idTicket = ticket._id;
				let newSocket = this.idSocket;
				let isClient = true;
				this.publicService.actualizarSocket(idTicket, newSocket, isClient).subscribe(data => { })
			}
			localStorage.setItem('tickets', JSON.stringify(tickets));

		}
	}

	emit(evento: string, payload?: any, callback?: () => void): void {
		this.socket.emit(evento, payload, callback);
	}

	listen(evento: string): Observable<string> {
		return this.socket.fromEvent(evento);
	}

	manejaError = (err: AjaxError) => {
		return of<AjaxError>(err);  // <b
	}

}
