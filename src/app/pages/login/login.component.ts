import { NgForm } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { WebsocketService } from '../../services/websocket.service';
import { LoginService } from '../../services/login.service';
import { NgZone } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { PublicService } from '../../modules/public/public.service';
import { LoginResponse } from '../../interfaces/login.interface';

declare const gapi: any;

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

	email: string;
	hidepass = true;
	recuerdame = false;
	auth2: gapi.auth2.GoogleAuth; // info de google con el token

	constructor(
		public publicService: PublicService,
		public router: Router,
		public activatedRoute: ActivatedRoute,
		private loginService: LoginService,
		private wsService: WebsocketService,
		private zone: NgZone
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
			this.loginService.login(gtoken, null, false).subscribe((data: LoginResponse) => {
				if (data.ok) {
					if (data.user.id_company) {
						const idCompany = data.user.id_company._id;
						this.wsService.emit('enterCompany', idCompany);
					}
					// window.location.href = '/admin';
					this.zone.run(() => {
						this.router.navigate([data.home]);
					})
				}
			}, (err: HttpErrorResponse) => {
				if(err.error.msg){
					this.publicService.snack(err.error.msg, 5000, 'Aceptar');
				} else {
					this.publicService.snack('Error de validación', 5000, 'Aceptar');
				}
			});
		}, () => {
			this.publicService.snack('Error de oAuth', 5000, 'Aceptar');
		});

	}

	// ==========================================================
	// LOGIN FORM 
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

		this.loginService.login(null, user, forma.value.recuerdame).subscribe((data: LoginResponse) => {
				if (data.ok) {
					if (data.user.id_company) {
						let idCompany = data.user.id_company._id;
						this.wsService.emit('enterCompany', idCompany);
					}
					this.router.navigate([data.home]);
				}
			},
			(err: HttpErrorResponse) => {
				if(err.error.msg){
					this.publicService.snack(err.error.msg, 5000, 'Aceptar');
				} else {
					this.publicService.snack('Error de validación', 5000, 'Aceptar');
				}			
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
