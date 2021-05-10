import { NgForm } from '@angular/forms';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgZone } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { PublicService } from '../public.service';
import { LoginResponse } from '../../../interfaces/login.interface';
import { Social } from 'src/app/components/social/social.component';
import { User } from '../../../interfaces/user.interface';
import { Company } from 'src/app/interfaces/company.interface';
import { LoginService } from '../../../services/login.service';


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
	logging = false;

	constructor(
		private loginService: LoginService,
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
			bl_admin: false 
		};

		const platform = 'email';

		this.logging = true;
		this.loginCustomer(platform, null, emailForm);
	}


	loginSocial(social: Social) {
		if (!social) return;
		if (!social.txToken) {
			this.publicService.snack('No se recibio el token de la red social', 5000, 'Aceptar');
			return;
		}

		const token = social.txToken;
		const platform = social.txPlatform;

		this.logging = true;
		this.loginCustomer(platform, token, null);
	}


	loginCustomer(platform: string, token: string, emailForm: any) {
		this.loginService.loginCustomer(platform, token, emailForm).subscribe((data: LoginResponse) => {
			this.logging = false;
			if (data.ok) {
				if (localStorage.getItem('isembed')) {
					const companystring: string = localStorage.getItem('isembed');
					this.router.navigate(['/embed', companystring])
				} else {
					this.router.navigate(['/public/tickets'])
				}
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

	backToForm() {
		if (localStorage.getItem('isembed')) {
			const companyString = localStorage.getItem('isembed');
			this.router.navigate(['/embed/' + companyString]);
		}
	}

}
