import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.prod';

// services
import { LoginService } from '../../services/login.service';

// Interfaces
import { User, UserResponse } from '../../interfaces/user.interface';
import { Company, CompaniesResponse, CompanyResponse } from '../../interfaces/company.interface';
import { Table } from '../../interfaces/table.interface';
import { Section } from '../../interfaces/section.interface';

@Injectable({
	providedIn: 'root'
})
export class AdminService {
	
	public companies: Company[] = [];
	public sections: Section[] = [];
	public waiters: User[] = [];
	public tables: Table[] = [];
	
	public companiesSource = new Subject<Company[]>();
	companies$ = this.companiesSource.asObservable();

	constructor(
		private loginService: LoginService,
		private http: HttpClient, 
		
		) {
			if (this.loginService.user?.id_role === 'ADMIN_ROLE') {
				this.readCompanies(this.loginService.user._id).subscribe(data => {
					this.companies = data.companies;
					this.companiesSource.next(data.companies);
				})
			}
	}

	// ========================================================
	// Company Methods
	// ========================================================

	createCompany(company: Company) {
		let data = { company };
		const url = environment.url + '/c/create';
		return this.http.post(url, data).pipe(tap((data: CompanyResponse) => {
			this.attachCompany(data.company);
		}))
	}

	readCompanies(idUser: string) {
		const url = environment.url + '/c/readcompanies/' + idUser;
		return this.http.get(url).pipe(tap((data: CompaniesResponse) => {
			this.companies = data.companies;
			this.companiesSource.next(data.companies);
		}));
	}

	updateCompany(company: Company) {
		const url = environment.url + '/c/update';
		return this.http.post(url, company);
	}

	deleteCompany(idCompany: string) {
		const url = environment.url + '/c/deletecompany/' + idCompany;
		return this.http.delete(url);
	}

	attachCompany(company: Company) {
		// return new user object with populated company
		let data = { company };
		let idUser = this.loginService.user._id;
		const url = environment.url + '/u/attachcompany/' + idUser;
		this.http.post(url, data).subscribe((data: UserResponse) => {
			// obtengo el usuario con el nuevo id_company populado
			if (data.ok) {
				this.loginService.pushUser(data.user);
			}
		})
	}

	checkCompanyExists(pattern: string) {
		let data = { pattern }
		const url = environment.url + '/c/checkcompanyexists';
		return this.http.post(url, data);
	}

	// ========================================================
	// Section Methods
	// ========================================================

	createSection(section: Section) {
		const url = environment.url + '/section/createsection';
		return this.http.post(url, section);
	}

	readSections(idCompany: string) {
		const url = environment.url + '/section/readsections/' + idCompany;
		return this.http.get(url);
	}

	deleteSection(idSection: string) {
		const url = environment.url + '/section/deletesection/' + idSection;
		return this.http.delete(url);
	}

	// ========================================================
	// Table Methods
	// ========================================================

	createTable(table: Table) {

		const url = environment.url + '/table/createtable';
		return this.http.post(url, table);
	}

	readTables(idCompany: string) {
		const url = environment.url + '/table/readtables/' + idCompany;
		return this.http.get(url);
	}

	deleteTable(idTable: string) {
		const url = environment.url + '/table/deletetable/' + idTable;
		return this.http.delete(url);
	}

	// ========================================================
	// Waiter Methods
	// ========================================================

	createWaiter(waiter: User) {
		const url = environment.url + '/w/createwaiter';
		return this.http.post(url, waiter);
	}

	readWaiters(idCompany: string) {
		const url = environment.url + '/w/readwaiters/' + idCompany;
		return this.http.get(url);
	}

	updateWaiter(waiter: User) {
		const url = environment.url + '/w/updatewaiter';
		return this.http.post(url, waiter);
	}

	deleteWaiter(idWaiter: string) {
		const url = environment.url + '/w/deletewaiter/' + idWaiter;
		return this.http.delete(url);
	}

	readActiveSessions(idCompany: string) {
		const url = environment.url + '/w/readactivesessions/' + idCompany;
		return this.http.get(url);
	}


}
