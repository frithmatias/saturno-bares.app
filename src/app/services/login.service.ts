import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { User } from 'src/app/interfaces/user.interface';
import { map, catchError } from 'rxjs/operators';
import { throwError, Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
	providedIn: 'root'
})
export class LoginService {


	token: string;
	menu: any[] = [];

	public user: User;
	public userSource = new Subject<User>();
	user$ = this.userSource.asObservable();


	constructor(
		private http: HttpClient,
		private router: Router
	) {
		if (localStorage.getItem('token') && localStorage.getItem('user') && localStorage.getItem('menu')) {
			this.token = JSON.parse(localStorage.getItem('token'));
			this.menu = JSON.parse(localStorage.getItem('menu'));
			let user = JSON.parse(localStorage.getItem('user'));
			this.pushUser(user);
		}
	}

	// ========================================================
	// Register Methods
	// ========================================================

	createUser(user: User) {
		let data = { user };
		const url = environment.url + '/u/register';
		return this.http.post(url, data);
	}

	checkEmailExists(pattern: string) {
		let data = { pattern }
		const url = environment.url + '/u/checkemailexists';
		return this.http.post(url, data);
	}

	// ========================================================
	// Login Methods
	// ========================================================

	// google and normal login
	login(gtoken: string, user: User, recordar: boolean = false) {
		recordar ? localStorage.setItem('email', user.tx_email) : localStorage.removeItem('email');

		const api = gtoken ? '/u/google' : '/u/login'
		const data = gtoken ? { gtoken } : user;
		const url = environment.url + api;

		return this.http.post(url, data).pipe(map((resp: any) => {
			localStorage.setItem('token', JSON.stringify(resp.token));
			localStorage.setItem('menu', JSON.stringify(resp.menu));
			localStorage.setItem('user', JSON.stringify(resp.user));
			this.token = resp.token;
			this.menu = resp.menu;
			this.user = resp.user;
			return resp;
		}),
			catchError(err => {
				return throwError(err);
			})
		);
	}

	estaLogueado() {
		if ((this.token.length < 5) || (typeof this.token === 'undefined') || (this.token === 'undefined')) {
			return false;
		}
		const payload = JSON.parse(atob(this.token.split('.')[1]));
		const ahora = new Date().getTime() / 1000;
		if (payload.exp < ahora) {
			this.logout();
			return false; // token expirado
		} else {
			return true; // token valido
		}
	}

	pushUser(user: User) {
		localStorage.setItem('user', JSON.stringify(user));
		this.user = user;
		this.userSource.next(this.user);
	}

	updateToken() {
		const url = environment.url + '/u/updatetoken';
		// url += '?token=' + this.token;

		const headers = new HttpHeaders({
			'turnos-token': this.token
		});

		let data = { user: this.user };
		return this.http.post(url, data, { headers })
			.pipe(map((resp: any) => {
				if (resp.ok) {
					this.token = resp.newtoken;
					localStorage.setItem('token', JSON.stringify(this.token));
				} else {
					this.logout();
				}
				return resp;
			}));

	}

	logout() {
		if (localStorage.getItem('user')) { localStorage.removeItem('user'); }
		if (localStorage.getItem('assistant')) { localStorage.removeItem('assistant'); }
		if (localStorage.getItem('token')) { localStorage.removeItem('token'); }
		if (localStorage.getItem('menu')) { localStorage.removeItem('menu'); }
		if (localStorage.getItem('desktop')) { localStorage.removeItem('desktop'); }
		if (localStorage.getItem('ticket')) { localStorage.removeItem('ticket'); }

		this.token = null;
		this.menu = null;
		this.user = null;

		this.userSource.next(null)
		this.router.navigate(['/home']);
	}

}
