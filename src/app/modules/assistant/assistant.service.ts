import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';

import { Ticket } from '../../interfaces/ticket.interface';
import { Desktop } from '../../interfaces/desktop.interface';
import { User } from '../../interfaces/user.interface';

import { LoginService } from '../../services/login.service';

import { Observable } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';

@Injectable({
	providedIn: 'root'
})
export class AssistantService {

	//assistant || user
	token: string;
	menu: any[] = [];

	user: User = null;
	desktop: Desktop = null;
	ticket: Ticket = null;

	chatMessages: {
		own: boolean,
		time: Date,
		message: string,
		viewed: boolean
	}[] = [];


	constructor(
		private http: HttpClient,
		private loginService: LoginService
	) {

		if (localStorage.getItem('desktop')) {
			this.desktop = JSON.parse(localStorage.getItem('desktop'));
		}

		if (localStorage.getItem('ticket')) {
			this.ticket = JSON.parse(localStorage.getItem('ticket'));
		}
		
	}

	readDesktops(idCompany: string) {
		const headers = new HttpHeaders({
			'turnos-token': this.loginService.token
		});
		const url = environment.url + '/d/readdesktops/' + idCompany;
		return this.http.get(url, { headers });
	}

	takeDesktop(idDesktop: string, idAssistant: string) {
		const headers = new HttpHeaders({
			'turnos-token': this.loginService.token
		});
		let data = { idDesktop, idAssistant }
		const url = environment.url + '/d/takedesktop';
		return this.http.post(url, data, { headers });
	}

	readSkills(idCompany: string) {
		const headers = new HttpHeaders({
			'turnos-token': this.loginService.token
		});
		const url = environment.url + '/s/readskills/' + idCompany;
		return this.http.get(url, { headers });
	}

	getTickets(idCompany: string) {
		if (!idCompany) { return; }
		const url = environment.url + '/t/gettickets/' + idCompany;
		return this.http.get(url);
	}

	takeTicket(idSession: string, idSocketDesk: string): Observable<object> {

		const headers = new HttpHeaders({
			'turnos-token': this.loginService.token
		});

		const deskData = { idSession, idSocketDesk };

		const url = environment.url + `/t/taketicket`;
		return this.http.post(url, deskData, { headers });
	}

	releaseTicket(idTicket: string): Observable<object> {
		const data = { idTicket };
		const headers = new HttpHeaders({
			'turnos-token': this.loginService.token
		});
		const url = environment.url + '/t/releaseticket';
		return this.http.post(url, data, { headers });
	}

	reassignTicket(idTicket: string, idSkill: string, blPriority: boolean): Observable<object> {
		const data = { idTicket, idSkill, blPriority };
		const headers = new HttpHeaders({
			'turnos-token': this.loginService.token
		});
		const url = environment.url + '/t/reassignticket';
		return this.http.post(url, data, { headers });
	}

	endTicket(idTicket: string): Observable<object> {
		const data = { idTicket };
		const headers = new HttpHeaders({
			'turnos-token': this.loginService.token
		});
		const url = environment.url + '/t/endticket';
		return this.http.post(url, data, { headers });
	}

	releaseDesktop(idDesktop: string) {
		const headers = new HttpHeaders({
			'turnos-token': this.loginService.token
		});
		let data = { idDesktop }
		const url = environment.url + '/d/releasedesktop';
		return this.http.post(url, data, { headers });
	}

	getTimeInterval(from: number, to?: number): string {
		let interval = to - from;
		let h = Math.floor(interval / 1000 / 60 / 60);
		interval = interval - (h * 60 * 60 * 1000);
		let m = Math.floor(interval / 1000 / 60);
		interval = interval - (m * 60 * 1000);
		let s = Math.floor(interval / 1000);
		let hStr = h.toString().length === 1 ? '0' + h : h;
		let mStr = m.toString().length === 1 ? '0' + m : m;
		let sStr = s.toString().length === 1 ? '0' + s : s;
		return `${hStr}:${mStr}:${sStr}`;
	}

}
