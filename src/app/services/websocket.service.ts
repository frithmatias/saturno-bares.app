import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable, of } from 'rxjs';
import { AjaxError } from 'rxjs/ajax';
import { catchError, take, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PublicService } from '../modules/public/public.service';
import { User } from '../interfaces/user.interface';

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
		this.escucharSocketActualizado();
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

	updateTicketsClients(): Observable<string> {
		return this.listen('update-clients');
	}

	updateTicketsWaiters(): Observable<string> {
		return this.listen('update-waiters');
	}

	escucharSocketActualizado(): void {
		this.listen('socket-updated').subscribe((data: any) => {
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
		console.log('updating socket', this.idSocket)
		// Sólo si ya existe un usuario loguado o un ticket (cliente)
		
		if (localStorage.getItem('user')) { // admin / user

			// update localstorage
			let user: User = JSON.parse(localStorage.getItem('user'));
			user.id_socket = this.idSocket;
			localStorage.setItem('user', JSON.stringify(user));
			
			// Enter new socket user to company room
			let idCompany = user.id_company._id;
			this.emit('enterCompany', idCompany);

			// todo: obtener los tickets de section.component y rular por cada uno para actualizarlos en la bd
			// todo: hacerlo desde el servicio de waiters para evitar traer los tickets a este servicio público.
		}

		if (localStorage.getItem('ticket')) { // client
			
			// update localstorage
			let ticket = JSON.parse(localStorage.getItem('ticket'));
			ticket.id_socket = this.idSocket; 
			localStorage.setItem('ticket', JSON.stringify(ticket));
			
			// Enter new socket client to company room
			let idCompany = ticket.id_company;
			this.emit('enterCompany', idCompany);
			
			// oldSocket se envía como bandera para definir si es escritorio o público
			let idTicket = ticket._id;
			let newSocket = this.idSocket;
			let isClient = true;
			this.publicService.actualizarSocket(idTicket, newSocket, isClient).subscribe(data => {
				console.log(data)
			})
	}
}

emit(evento: string, payload ?: any, callback ?: () => void): void {
	this.socket.emit(evento, payload, callback);
}

listen(evento: string): Observable < string > {
	return this.socket.fromEvent(evento);
}

manejaError = (err: AjaxError) => {
	return of<AjaxError>(err);  // <b
}

}
