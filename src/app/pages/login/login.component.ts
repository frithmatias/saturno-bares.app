import { NgForm } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WebsocketService } from '../../services/websocket.service';
import { LoginService } from '../../services/login.service';

declare const gapi: any;
// 
@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

	email: string;
	hidepass = true;
	recuerdame = false;
	auth2: any; // info de google con el token

	constructor(
		public router: Router,
		public activatedRoute: ActivatedRoute,
		private loginService: LoginService,
		private wsService: WebsocketService,
		private snack: MatSnackBar
	) { }

	ngOnInit() {
		this.googleInit();
	}

	// ==========================================================
	// LOGIN GOOGLE
	// ==========================================================

	googleInit() {
		gapi.load('auth2', () => {
			this.auth2 = gapi.auth2.init({
				client_id: environment.gapi_uid,
				cookiepolicy: 'single_host_origin',
				scope: 'profile email'
			});
			this.attachSignin(document.getElementById('btnGoogle'));
		});
	}

	attachSignin(element) {
		this.auth2.attachClickHandler(element, {}, googleUser => {
			const gtoken = googleUser.getAuthResponse().id_token;
			this.loginService.login(gtoken, null, false).subscribe(
				data => {
					if (data.ok) {
						if (data.user.id_company) { this.wsService.emit('enterCompany', data.user.id_company._id); }
						// window.location.href = '#/admin';

						this.router.navigate([data.home]);			
					}
				},
				() => {
					this.snack.open('Error de validación en Google', null, { duration: 2000 });
				}
			);
		});
	}

	// ==========================================================
	// LOGIN NORMAL 
	// ==========================================================
	// TODO: Rehacer el formulario con formbuilder.

	login(forma: NgForm) {
		if (forma.invalid) {
			return;
		}

		const user: any = {
			tx_name: null,
			tx_email: forma.value.email,
			tx_password: forma.value.password,
			id_company: null
		};

		this.loginService.login(null, user, forma.value.recuerdame).subscribe(
		data => {
			if (data.ok) {
				if (data.user.id_company) { this.wsService.emit('enterCompany', data.user.id_company._id); }
				this.router.navigate([data.home]);
			}
		},
		err => {
				this.snack.open(err.error.msg, null, { duration: 2000 });
		});
	}

	cleanEmail(elementEmail, elementPassword) {
		elementEmail.value = null;
		elementPassword.value = null;
		if (localStorage.getItem('email')) {
			localStorage.removeItem('email');
		}
	}

}
