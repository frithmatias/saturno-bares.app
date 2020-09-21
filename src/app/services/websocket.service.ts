import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable, of } from 'rxjs';
import { AjaxError } from 'rxjs/ajax';
import { catchError, take, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TicketResponse } from '../interfaces/ticket.interface';
import { PublicService } from '../modules/public/public.service';

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
		this.escucharActualizarTicket();
	}

	escucharConexiones(): void {

		this.socket.on('connect', () => {
			this.idSocket = this.socket.ioSocket.id;
			this.snack.open('Conectado al servidor de turnos', null, { duration: 2000 });
			this.socketStatus = true;
			this.updateSocket();
		});

		this.socket.on('disconnect', () => {
			this.snack.open('Desconectado del servidor de turnos.', null, { duration: 2000 });
			this.socketStatus = false;
		});
	}

	escucharUpdatePublic(): Observable<string> {
		return this.listen('update-public');
	}

	escucharUpdateDesktops(): Observable<string> {
		return this.listen('update-desktops' || 'update-public');
		
	}

	escucharActualizarTicket(): void {
		this.listen('ticket-updated').subscribe((data: any) => {
			this.snack.open('Se actualizo la sesión remota', null, { duration: 1000 });
			localStorage.setItem('ticket', JSON.stringify(data.ticket));
		});
	}

	escucharEnCamino(): Observable<string> {
		// con take solo dejo pasar una sola emisión luego se des suscribe.
		return this.listen('cliente-en-camino').pipe(take(3));
	}

	escucharTicketCancelled(): Observable<string> {
		return this.listen('ticket-cancelled');
	}

	escucharMensajes(): Observable<string> {
		return this.listen('message-private');
	}

	escucharSystem(): Observable<string> {
		return this.listen('message-system');
	}

	updateSocket(): void {
		// sólo actualiza el socket si existe un ticket
		if (localStorage.getItem('ticket')) {

			// si se reinicia el browser obtengo el ticket de la LS
			let myTicket = JSON.parse(localStorage.getItem('ticket'));
		
			// preparo la data
			let idTicket = myTicket._id;
			let oldSocket = localStorage.getItem('session') ? myTicket.id_socket_desk : myTicket.id_socket;
			let newSocket = this.idSocket;

			// oldSocket se envía como bandera para definir si es escritorio o público
			this.publicService.actualizarSocket(idTicket, oldSocket, newSocket).pipe(
				catchError(this.manejaError)
			).subscribe((data: TicketResponse) => {
				// actualizó ok en bd
				if (data.ok) {
					if (myTicket) {
						if (localStorage.getItem('session')) {
							myTicket.id_socket_desk = this.idSocket;
						} else {
							myTicket.id_socket = this.idSocket;
						}
					}
					// actualizo en LS
					localStorage.setItem('ticket', JSON.stringify(myTicket));

					// lo ingreso en la sala de la company
					this.emit('enterCompany', data.ticket.id_company);
				}
			});
		}
	}

	emit(evento: string, payload?: any, callback?: () => void): void {
		this.socket.emit(evento, payload, callback);
	}

	listen(evento: string): Observable<string> {
		return this.socket.fromEvent(evento);
	}

	manejaError = (err: AjaxError) => {
		// error al actualizar el socket, el socket anterior no existe
		localStorage.removeItem('turno');
		return of<AjaxError>(err);  // <b
	}

}
