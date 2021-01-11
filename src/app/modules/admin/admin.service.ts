import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

// services
import { LoginService } from '../../services/login.service';

// Interfaces
import { User, UserResponse } from '../../interfaces/user.interface';
import { Company, CompaniesResponse, CompanyResponse } from '../../interfaces/company.interface';
import { Table, TablesResponse } from '../../interfaces/table.interface';
import { Section, SectionsResponse } from '../../interfaces/section.interface';
import { ScoreItem } from '../../interfaces/score.interface';
import { Settings, SettingsResponse } from 'src/app/interfaces/settings.interface';


@Injectable({
	providedIn: 'root'
})
export class AdminService {

	public companies: Company[] = [];
	public company: Company; // todo: selected company
	public settings: Settings;

	public sections: Section[] = [];
	public sectionsMap = new Map();

	public tables: Table[] = [];
	public tablesSection: Table[] = [];

	public waiters: User[] = [];


	constructor(
		private loginService: LoginService,
		private http: HttpClient
	) { }

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
		return this.http.get(url).subscribe((data: CompaniesResponse) => {
			this.companies = data.companies;
		});
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

	updateWebPage(data: any, idCompany: string) {
		const url = environment.api + '/c/updatewebpage/' + idCompany;
		return this.http.put(url, data);
	}

	// ========================================================
	// Section Methods
	// ========================================================

	createSection(section: Section) {
		const url = environment.api + '/section/createsection';
		return this.http.post(url, section);
	}

	readSections(idCompany: string) {
		const url = environment.api + '/section/readsections/' + idCompany;
		return this.http.get(url).subscribe((data: SectionsResponse) => {
			this.sections = data.sections;
			for (let section of data.sections) {
				this.sectionsMap.set(section._id, section.tx_section);
			}
		})
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

	readTables(idCompany: string) {
		const url = environment.api + '/table/readtables/' + idCompany;
		return this.http.get(url).subscribe((data: TablesResponse) => {
			this.tables = data.tables;
			this.tablesSection = data.tables;
		});
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

	readSettings(idCompany: string): Promise<SettingsResponse> {
		return new Promise(resolve => {
			const url = environment.api + '/settings/readsettings/' + idCompany;
			return this.http.get(url).subscribe((data: SettingsResponse) => {
				this.settings = Object.assign({}, data.settings);
				let newdata = Object.assign({}, data);
				resolve(newdata)
			})

		})
	}

	updateSettings(settings: Settings) {
		const url = environment.api + '/settings/updatesettings';
		return this.http.put(url, settings);
	}

	sendMessage(idCompany: string, txMessage: string) {
		const url = environment.api + '/settings/sendmessage';
		return this.http.post(url, {idCompany, txMessage});
	}
}
