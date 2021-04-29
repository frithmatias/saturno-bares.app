import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable, Observer, of } from 'rxjs';
import { AjaxError } from 'rxjs/ajax';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PublicService } from '../modules/public/public.service';
import { User } from '../interfaces/user.interface';
import { chatSession } from '../interfaces/chat.session.interface';

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
			this.publicService.snack('Conectado al servidor de turnos', 2000);
			this.socketStatus = true;
			this.updateSocket();
		});

		this.socket.on('disconnect', () => {
			this.publicService.snack('Desconectado del servidor de turnos.', 2000);
			this.socketStatus = false;
		});
	}

	updateClients(): Observable<string> {
		return this.listen('update-clients');
	}

	updateWaiters(): Observable<string> {
		return this.listen('update-waiters');
	}

	updateAdmin(): Observable<string> {
		return this.listen('update-admin');
	}

	updateTicket(): Observable<Object> {
		return this.listen('update-ticket');
	}

	escucharSystem(): Observable<string> {
		return this.listen('message-system'); // admin message to clients
	}

	// ---------------------------------------
	// CHAT LISTENERS

	escucharChatInitialized(): Observable<string> { // to client
		return this.listen('chat-session-initialized');
	}

	escucharChat(): Observable<string> { // to client and assistant
		return this.listen('chat-message');
	}

	escucharChatFinished(): Observable<string> { // to client
		return this.listen('chat-session-finished');
	}

	updateClientsList(): Observable<string> { // to assistant
		return this.listen('update-clients-list');
	}

	// END CHAT LISTENERS
	// ---------------------------------------

	updateSocket(): void {

		
		if (localStorage.getItem('chatsession')) { // chatsession is for CLIENTS ONLY
			let session: chatSession = JSON.parse(localStorage.getItem('chatsession'));
			session.id_user_socket = this.idSocket;
			localStorage.setItem('chatsession', JSON.stringify(session));

			let client: User;
			if (localStorage.getItem('user')) {
				client = JSON.parse(localStorage.getItem('user'));
			}
			if (localStorage.getItem('customer')) {
				client = JSON.parse(localStorage.getItem('customer'));
			}

			if (client) {
				let idSession = session._id;
				let newSocket = this.idSocket;
				let isClient = true; 
				this.publicService.actualizarChatSessionSocket(idSession, newSocket, isClient).subscribe(data => {
					this.publicService.snack(`Sesión de chat actualizada`, 1000);
				})
			}
		}

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
				if (ticket.tm_end === null) {
					ticket.id_socket_client = this.idSocket;
					let idTicket = ticket._id;
					let newSocket = this.idSocket;
					let isClient = true;
					this.publicService.actualizarSocket(idTicket, newSocket, isClient).subscribe(data => {
						this.publicService.snack(`Socket actualizado`, 1000);
					})
				}
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
