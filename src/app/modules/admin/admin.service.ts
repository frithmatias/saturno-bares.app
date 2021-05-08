import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

// services
import { LoginService } from '../../services/login.service';

// Interfaces
import { User, UserResponse } from '../../interfaces/user.interface';
import { Company, CompanyResponse } from '../../interfaces/company.interface';
import { Table } from '../../interfaces/table.interface';
import { Section } from '../../interfaces/section.interface';
import { ScoreItem } from '../../interfaces/score.interface';
import { Settings } from 'src/app/interfaces/settings.interface';
import { Observable } from 'rxjs';
import { Notification } from '../../interfaces/notification.interface';


@Injectable({
	providedIn: 'root'
})
export class AdminService {

	public loading = false;
	public companies: Company[] = [];
	public tables: Table[] = [];
	public tablesSection: Table[] = [];
	public scoreItems: ScoreItem[] = [];
	public scoreItemsSection: ScoreItem[] = [];
	public sections: Section[] = [];
	public waiters: User[] = [];
	sectionsMap = new Map();


	constructor(
		private loginService: LoginService,
		private http: HttpClient
	) { }


	readNotifications(idOwner: string) {
		const data = {idOwner};
		const url = environment.api + '/n/readnotifications';
		return this.http.post(url, data);
	}

	// ========================================================
	// Company Methods
	// ========================================================

	createCompany(company: Company) {
		const url = environment.api + '/c/create';
		return this.http.post(url, company).pipe(tap((data: CompanyResponse) => {
			this.attachCompany(data.company);
		}))
	}

	readCompanies(idUser: string) {
		const url = environment.api + '/c/readcompanies/' + idUser;
		return this.http.get(url);
	}

	updateCompany(company: Company) {
		const url = environment.api + '/c/update';
		return this.http.post(url, company);
	}

	deleteCompany(idCompany: string) {
		const url = environment.api + '/c/deletecompany/' + idCompany;
		return this.http.delete(url);
	}

	attachCompany(company: Company) {
		// return new user object with populated company
		let data = { company };
		let idUser = this.loginService.user._id;
		const url = environment.api + '/u/attachcompany/' + idUser;
		this.http.post(url, data).subscribe((data: UserResponse) => {
			// obtengo el usuario con el nuevo id_company populado
			if (data.ok) {
				this.loginService.pushUser(data.user);
			}
		})
	}

	checkCompanyExists(pattern: string) {
		let data = { pattern }
		const url = environment.api + '/c/checkcompanyexists';
		return this.http.post(url, data);
	}


	// WEB PAGE

	updateWebPage(data: any, idCompany: string) {
		const url = environment.api + '/c/updatewebpage/' + idCompany;
		return this.http.put(url, data);
	}
	
	readCovers() {
		const url = environment.api + '/c/readcovers';
		return this.http.get(url);
	}

	updateCover(idCompany: string, coverFilename: string) {
		const data = {idCompany, coverFilename};
		const url = environment.api + '/c/updatecover';
		return this.http.post(url, data);
	}


	updateTheme(idCompany: string, themeFilename: string) {
		const data = {idCompany, themeFilename};
		const url = environment.api + '/c/updatetheme';
		return this.http.post(url, data);
	}

	// ========================================================
	// Section Methods
	// ========================================================

	createSection(section: Section) {
		const url = environment.api + '/section/createsection';
		return this.http.post(url, section);
	}

	deleteSection(idSection: string) {
		const url = environment.api + '/section/deletesection/' + idSection;
		return this.http.delete(url);
	}

	// ========================================================
	// Table Methods
	// ========================================================

	createTable(table: Table) {
		const url = environment.api + '/table/createtable';
		return this.http.post(url, table);
	}

	deleteTable(idTable: string) {
		const url = environment.api + '/table/deletetable/' + idTable;
		return this.http.delete(url);
	}

	// ========================================================
	// Poll Methods
	// ========================================================

	createScoreItem(scoreItem: ScoreItem) {
		const url = environment.api + '/scoreitem/createscoreitem';
		return this.http.post(url, scoreItem);
	}

	readScoreItems(idCompany: string) {
		const url = environment.api + '/scoreitem/readscoreitems/' + idCompany;
		return this.http.get(url);
	}

	deleteScoreItem(idScoreItem: string) {
		const url = environment.api + '/scoreitem/deletescoreitem/' + idScoreItem;
		return this.http.delete(url);
	}


	// ========================================================
	// Waiter Methods
	// ========================================================

	createWaiter(waiter: User) {
		const url = environment.api + '/w/createwaiter';
		return this.http.post(url, waiter);
	}

	readWaiters(idCompany: string) {
		const url = environment.api + '/w/readwaiters/' + idCompany;
		return this.http.get(url);
	}

	updateWaiter(waiter: User) {
		const url = environment.api + '/w/updatewaiter';
		return this.http.post(url, waiter);
	}

	deleteWaiter(idWaiter: string) {
		const url = environment.api + '/w/deletewaiter/' + idWaiter;
		return this.http.delete(url);
	}

	readActiveSessions(idCompany: string) {
		const url = environment.api + '/w/readactivesessions/' + idCompany;
		return this.http.get(url);
	}

	// ========================================================
	// Settings Methods
	// ========================================================

	updateSettings(settings: Settings) {
		const url = environment.api + '/settings/updatesettings';
		return this.http.put(url, settings);
	}

	sendMessage(idCompany: string, txMessage: string) {
		const url = environment.api + '/settings/sendmessage';
		return this.http.post(url, { idCompany, txMessage });
	}

	// ========================================================
	// Schedule Methods
	// ========================================================

	createTicket(
		blContingent: boolean,
		txName: string,
		nmPersons: number,
		idSection: string,
		tmIntervals: Date[],
		txEmail: string,
		nmPhone: number,
		cdTables: number[]
	): Observable<object> {
		let data = { blContingent, txName, nmPersons, idSection, tmIntervals, txEmail, nmPhone, cdTables };
		return this.http.post(environment.api + '/t/createticket/', data);
	}


	readPending(idCompany:string, idYear: number, idMonth: number): Observable<object> {
		let data = { idCompany, idYear, idMonth };
		return this.http.post(environment.api + '/t/readpending/', data);
	  }
	
}
