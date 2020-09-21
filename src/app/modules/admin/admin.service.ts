import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment.prod';

// services
import { LoginService } from '../../services/login.service';

// Interfaces
import { Skill } from '../../interfaces/skill.interface';
import { User, UserResponse } from '../../interfaces/user.interface';
import { Company, CompaniesResponse, CompanyResponse } from '../../interfaces/company.interface';
import { Desktop } from '../../interfaces/desktop.interface';

@Injectable({
	providedIn: 'root'
})
export class AdminService {
	
	public companies: Company[] = [];
	public skills: Skill[] = [];
	public desktops: Desktop[] = [];
	public assistants: User[] = [];
	
	public companiesSource = new Subject<Company[]>();
	companies$ = this.companiesSource.asObservable();

	constructor(
		private loginService: LoginService,
		private http: HttpClient, 
		
		) {
			if (this.loginService.user?.tx_role === 'ADMIN_ROLE') {
				this.readCompanies(this.loginService.user._id).subscribe(data => {
					this.companies = data.companies;
					this.companiesSource.next(data.companies);
				})
			}
	}

	// ========================================================
	// Companies Methods
	// ========================================================

	createCompany(company: Company) {
		const headers = new HttpHeaders({
			'turnos-token': this.loginService.token
		});
		let data = { company };
		const url = environment.url + '/c/create';
		return this.http.post(url, data, { headers }).pipe(tap((data: CompanyResponse) => {
			this.attachCompany(data.company);
		}))
	}

	readCompanies(idUser: string) {
		const headers = new HttpHeaders({
			'turnos-token': this.loginService.token
		});
		const url = environment.url + '/c/readcompanies/' + idUser;
		return this.http.get(url, { headers }).pipe(tap((data: CompaniesResponse) => {
			this.companies = data.companies;
			this.companiesSource.next(data.companies);
		}));
	}

	updateCompany(company: Company) {
		const headers = new HttpHeaders({
			'turnos-token': this.loginService.token
		});
		const url = environment.url + '/c/update';
		return this.http.post(url, company, { headers });
	}

	deleteCompany(idCompany: string) {
		const headers = new HttpHeaders({
			'turnos-token': this.loginService.token
		});
		const url = environment.url + '/c/deletecompany/' + idCompany;
		return this.http.delete(url, { headers });
	}

	attachCompany(company: Company) {
		// return new user object with populated company
		const headers = new HttpHeaders({
			'turnos-token': this.loginService.token
		});
		let data = { company };
		let idUser = this.loginService.user._id;
		const url = environment.url + '/u/attachcompany/' + idUser;
		this.http.post(url, data, { headers }).subscribe((data: UserResponse) => {
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
	// Skill Methods
	// ========================================================

	createSkill(skill: Skill) {
		const headers = new HttpHeaders({
			'turnos-token': this.loginService.token
		});
		const url = environment.url + '/s/createskill';
		return this.http.post(url, skill, { headers });
	}

	readSkills(idCompany: string) {
		const headers = new HttpHeaders({
			'turnos-token': this.loginService.token
		});
		const url = environment.url + '/s/readskills/' + idCompany;
		return this.http.get(url, { headers });
	}

	deleteSkill(idSkill: string) {
		const headers = new HttpHeaders({
			'turnos-token': this.loginService.token
		});
		const url = environment.url + '/s/deleteskill/' + idSkill;
		return this.http.delete(url, { headers });
	}

	readSkillsUser(idUser: string) {
		const headers = new HttpHeaders({
			'turnos-token': this.loginService.token
		});
		const url = environment.url + '/s/readskillsuser/' + idUser;
		return this.http.get(url, { headers });
	}

	// ========================================================
	// Desktop Methods
	// ========================================================

	createDesktop(desktop: Desktop) {

		const headers = new HttpHeaders({
			'turnos-token': this.loginService.token
		});
		const url = environment.url + '/d/createdesktop';
		return this.http.post(url, desktop, { headers });
	}

	readDesktops(idCompany: string) {
		const headers = new HttpHeaders({
			'turnos-token': this.loginService.token
		});
		const url = environment.url + '/d/readdesktops/' + idCompany;
		return this.http.get(url, { headers });
	}

	deleteDesktop(idDesktop: string) {
		const headers = new HttpHeaders({
			'turnos-token': this.loginService.token
		});
		const url = environment.url + '/d/deletedesktop/' + idDesktop;
		return this.http.delete(url, { headers });
	}

	// ========================================================
	// Assistants Methods
	// ========================================================

	createAssistant(assistant: User) {
		const headers = new HttpHeaders({
			'turnos-token': this.loginService.token
		});
		const url = environment.url + '/a/createassistant';
		return this.http.post(url, assistant, { headers });
	}

	readAssistants(idCompany: string) {
		const headers = new HttpHeaders({
			'turnos-token': this.loginService.token
		});
		const url = environment.url + '/a/readassistants/' + idCompany;
		return this.http.get(url, { headers });
	}

	updateAssistant(assistant: User) {
		const headers = new HttpHeaders({
			'turnos-token': this.loginService.token
		});
		const url = environment.url + '/a/updateassistant';
		return this.http.post(url, assistant, { headers });
	}

	deleteAssistant(idAssistant: string) {
		const headers = new HttpHeaders({
			'turnos-token': this.loginService.token
		});
		const url = environment.url + '/a/deleteassistant/' + idAssistant;
		return this.http.delete(url, { headers });
	}

	readActiveSessionsBySkill(idSkill: string) {
		const url = environment.url + '/a/readactivesessionsbyskill/' + idSkill;
		return this.http.get(url);
	}


}
