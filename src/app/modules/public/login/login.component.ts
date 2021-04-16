import { NgForm } from '@angular/forms';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgZone } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { PublicService } from '../public.service';
import { LoginResponse } from '../../../interfaces/login.interface';
import { Social } from 'src/app/components/social/social.component';
import { User } from 'src/app/interfaces/user.interface';


declare const gapi: any;

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
	@Output() customer: EventEmitter<User> = new EventEmitter;
	email: string;
	hidepass = true;
	recuerdame = false;
	auth2: gapi.auth2.GoogleAuth; // info de google con el token

	constructor(
		public publicService: PublicService,
		public router: Router,
		public activatedRoute: ActivatedRoute,
		private zone: NgZone
	) { }

	ngOnInit() {
	}

	loginEmail(forma: NgForm) {

		if (forma.invalid) {
			return;
		}

		const emailForm: any = {
			tx_name: null,
			tx_email: forma.value.email,
			tx_password: forma.value.password,
			bl_admin: false //admin || customer 

		};

		const recordar = forma.value.recuerdame;
		const platform = 'email';
		this.loginCustomer(platform, null, emailForm, recordar);
	}

	loginSocial(social: Social) {

		if (!social) return;
		if (!social.txToken) {
			this.publicService.snack('No se recibio el token de la red social', 5000, 'Aceptar');
			return;
		}

		const token = social.txToken;
		const platform = social.txPlatform;
		this.loginCustomer(platform, token, null, false);
	}


	loginCustomer(platform: string, token: string, emailForm: any, remember: boolean){
		this.publicService.loginCustomer(platform, token, emailForm, remember).subscribe((data: LoginResponse) => {
			if (data.ok) {
				this.customer.emit(data.user);
				// this.router.navigate(['/public/tickets']);
			}
		}, (err: HttpErrorResponse) => {
			if (err.error.msg) {
				this.publicService.snack(err.error.msg, 5000);
			} else {
				this.publicService.snack('Error de validación', 5000);
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
