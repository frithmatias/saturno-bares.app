import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { PublicService } from '../../modules/public/public.service';
import { LoginService } from '../../services/login.service';
import { HttpErrorResponse } from '@angular/common/http';
import { LoginResponse } from '../../interfaces/login.interface';
import { Social } from '../../components/social/social.component';
import { WebsocketService } from '../../services/websocket.service';

declare const gapi: any;

@Component({
	selector: 'app-register',
	templateUrl: './register.component.html',
	styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

	forma: FormGroup;
	auth2: any; // info de google con el token
	disabled = false;

	constructor(
		private router: Router,
		private publicService: PublicService,
		private loginService: LoginService,
		private wsService: WebsocketService
	) { }

	ngOnInit() {

		this.publicService.drawerScrollTop();

		// this.publicUrl = document.
		// this.publicUrl = location.origin + '/public/';
		let defaults = {
			name: '',
			email: '',
			password1: '',
			password2: ''
		}
		this.forma = new FormGroup({
			name: new FormControl(defaults.name, [Validators.required, Validators.maxLength(30)]),
			email: new FormControl(defaults.email, [Validators.required, Validators.email, Validators.maxLength(50)]),
			password1: new FormControl(defaults.password1, [Validators.required, Validators.maxLength(30)]),
			password2: new FormControl(defaults.password2, [Validators.required, Validators.maxLength(30)]),
			// condiciones: new FormControl(false, Validators.required)
		}, {
			validators: [
				this.sonIguales('password1', 'password2')]
		});
	}

	sonIguales(campo1: string, campo2: string) {
		return (group: FormGroup) => {
			const pass1 = group.controls[campo1].value;
			const pass2 = group.controls[campo2].value;
			if (pass1 === pass2) {
				return null;
			}
			return {
				passwordsDiffer: true
			};
		};
	}

	checkEmailExists() {
		let pattern = this.forma.value.email;
		if (this.forma.value.email.length > 6)
			this.loginService.checkEmailExists(pattern).subscribe((data: any) => {
				if (!data.ok) {
					this.forma.controls['email'].setErrors({ 'incorrect': true });
					this.forma.setErrors({ 'emailExists': true })
				}
			});
	}

	registerUser() {

		if (this.forma.invalid) {
			this.publicService.snack('Faltan datos por favor verifique', 5000, 'Aceptar');
			return;
		}

		// if (!this.forma.value.condiciones) {
		// 	this.snack.open('Debe aceptar las condiciones.', 'Aceptar', { duration: 5000 });
		// 	return;
		// }

		const user: any = {
			tx_name: this.forma.value.name,
			tx_email: this.forma.value.email,
			tx_password: this.forma.value.password1,
			id_company: this.forma.value.company
		};

		this.loginService.createUser(user).subscribe((data: any) => {
			if (data.ok) {
				this.publicService.snack('Te enviamos un email para que confirmes tu cuenta.', 10000, 'Aceptar');
				this.router.navigate(['/activate'])
			}
		},
			(err: HttpErrorResponse) => {
				if (err.error.msg) {
					this.publicService.snack(err.error.msg, 5000, 'Aceptar');
				} else {
					this.publicService.snack('Error al registrar el usuario', 5000, 'Aceptar');
				}
			}
		)
	}

	registerSocial(social: Social) {

		if (!social) return;
		if (!social.txToken) {
			this.publicService.snack('No se recibio el token de la red social', 5000, 'Aceptar');
			return;
		}

		const platform = social.txPlatform;
		const gtoken = social.txToken;

		this.loginService.loginUser(platform, gtoken, social, false).subscribe((data: LoginResponse) => {
			if (data.ok) {
				if (data.user.id_company) {
					const idCompany = data.user.id_company._id;
					this.wsService.emit('enterCompany', idCompany);
				}
				// window.location.href = '/admin';
				this.router.navigate([data.home]);
			}
		}, (err: HttpErrorResponse) => {
			if (err.error.msg) {
				this.publicService.snack(err.error.msg, 5000, 'Aceptar');
			} else {
				this.publicService.snack('Error de validación', 5000, 'Aceptar');
			}
		});
	}

}
