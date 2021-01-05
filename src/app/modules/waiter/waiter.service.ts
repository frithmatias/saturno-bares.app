import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

import { Ticket } from '../../interfaces/ticket.interface';
import { LoginService } from '../../services/login.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Section } from '../../interfaces/section.interface';
import { Session } from '../../interfaces/session.interface';
import { Table } from '../../interfaces/table.interface';

@Injectable({
	providedIn: 'root'
})
export class WaiterService {

	// set on home
	sections: Section[] = [];
	session: Session = null;
	sectionSelected: string = ''; // reassign section

	// set on section (contingent ticket)
	contingentTicket: Ticket;

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
	) { }

	readSections(idCompany: string) {
		const url = environment.api + '/section/readsections/' + idCompany;
		return this.http.get(url);
	}

	readSessions(idCompany: string) {
		const url = environment.api + '/section/readsessions/' + idCompany;
		return this.http.get(url);
	}

	takeSection(idSection: string, idWaiter: string) {
		let data = { idSection, idWaiter }
		const url = environment.api + '/section/takesection';
		return this.http.post(url, data);
	}

	readTables(idCompany: string) {
		const url = environment.api + '/table/readtables/' + idCompany;
		return this.http.get(url);
	}

	toggleTableStatus(idTable: string) {
		const url = environment.api + '/table/toggletablestatus/' + idTable;
		return this.http.get(url);
	}

	assignTables(idTicket: string, cdTables: number[], blPriority: boolean = false) {
		const data = { idTicket, cdTables, blPriority };
		const url = environment.api + '/table/assigntables';
		return this.http.post(url, data);
	}

	readTickets(idCompany: string) {
		if (!idCompany) { return; }
		const url = environment.api + '/t/readtickets/' + idCompany;
		return this.http.get(url);
	}

	releaseTicket(ticket: Ticket): Observable<object> {
		const data = { ticket };
		const url = environment.api + '/t/releaseticket';
		return this.http.post(url, data);
	}

	reassignTicket(idTicket: string, idSession: string, blPriority: boolean): Observable<object> {
		const data = { idTicket, idSession, blPriority };
		const url = environment.api + '/t/reassignticket';
		return this.http.post(url, data);
	}

	attendedTicket(idTicket: string): Observable<object> {
		const data = { idTicket };
		const url = environment.api + '/t/attendedticket';
		return this.http.post(url, data);
	}

	endTicket(idTicket: string): Observable<object> {
		const data = { idTicket };
		const url = environment.api + '/t/endticket';
		return this.http.post(url, data);
	}

	createTicket(blContingent: boolean, idSocket: string, txName: string, nmPersons: number, idSection: string): Observable<object> {
		let data = { blContingent, idSocket, txName, nmPersons, idSection };
		return this.http.post(environment.api + '/t/createticket/', data);
	}


	releaseSection(idSection: string, idWaiter: string) {
		let data = { idSection, idWaiter }
		const url = environment.api + '/section/releasesection';
		return this.http.post(url, data);
	}


	// ========================================================
	// SESSION METHODS
	// ========================================================

	clearSectionSession = () => {
		delete this.session;
		if (localStorage.getItem('session')) {
			localStorage.removeItem('session');
		}
		if (localStorage.getItem('tables')) {
			localStorage.removeItem('tables');
		}
	};

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
