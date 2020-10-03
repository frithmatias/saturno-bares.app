import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';

import { Ticket } from '../../interfaces/ticket.interface';
import { Table } from '../../interfaces/table.interface';

import { LoginService } from '../../services/login.service';

import { Observable } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Section } from '../../interfaces/section.interface';

@Injectable({
	providedIn: 'root'
})
export class WaiterService {

	section: Section = null;

	chatMessages: {
		id_ticket: string,
		bl_own: boolean,
		tm_time: Date,
		tx_message: string,
		bl_viewed: boolean
	}[] = [];

	constructor(
		private http: HttpClient,
		private loginService: LoginService
	) {

		if (localStorage.getItem('section')) {
			this.section = JSON.parse(localStorage.getItem('section'));
		}

	
	}

	readSections(idCompany: string) {
		const headers = new HttpHeaders({
			'turnos-token': this.loginService.token
		});
		const url = environment.url + '/section/readsections/' + idCompany;
		return this.http.get(url, { headers });
	}

	takeSection(idSection: string, idWaiter: string) {
		const headers = new HttpHeaders({
			'turnos-token': this.loginService.token
		});
		let data = { idSection, idWaiter }
		const url = environment.url + '/section/takesection';
		return this.http.post(url, data, { headers });
	}

	readTables(idCompany: string) {
		const headers = new HttpHeaders({
			'turnos-token': this.loginService.token
		});
		const url = environment.url + '/section/readtables/' + idCompany;
		return this.http.get(url, { headers });
	}

	readSectionTables(idSection: string) {
		const headers = new HttpHeaders({
			'turnos-token': this.loginService.token
		});
		const url = environment.url + '/table/readsectiontables/' + idSection;
		return this.http.get(url, { headers });
	}

	toggleTableStatus(idTable: string) {
		const headers = new HttpHeaders({
			'turnos-token': this.loginService.token
		});
		const url = environment.url + '/table/toggletablestatus/' + idTable;
		return this.http.get(url, { headers });
	}

	getTickets(idCompany: string) {
		if (!idCompany) { return; }
		const url = environment.url + '/t/gettickets/' + idCompany;
		return this.http.get(url);
	}


	// actions

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

	reassignTicket(idTicket: string, idSession: string, blPriority: boolean): Observable<object> {
		const data = { idTicket, idSession, blPriority };
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

	releaseSection(idSection: string) {
		const headers = new HttpHeaders({
			'turnos-token': this.loginService.token
		});
		let data = { idSection }
		const url = environment.url + '/section/releasesection';
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
