import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { WebsocketService } from 'src/app/services/websocket.service';
import { PublicService } from '../../modules/public/public.service';
import { LoginService } from '../../services/login.service';
import { environment } from 'src/environments/environment';

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
		this.googleInit();
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

	registrarUsuario() {

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
				this.publicService.snack('Usuario creado. Te enviamos un email para que confirmes tu cuenta.', 10000, 'Aceptar');
				this.router.navigate(['/activate'])
			}
		},
			() => {
				this.publicService.snack('Error al registrar el usuario', 5000, 'Aceptar');
			}
		)
	}


	// ========================================================
	// REGISTER GOOGLE 
	// ========================================================

	googleInit() {
		gapi.load('auth2', () => {
			this.auth2 = gapi.auth2.init({
				client_id: environment.gapi_uid,
				cookiepolicy: 'single_host_origin',
				scope: 'profile email'
			});
			this.attachSignin(document.getElementById('btnGoogleRegister'));
		});
	}

	attachSignin(element) {
		this.auth2.attachClickHandler(element, {}, googleUser => {
			const gtoken = googleUser.getAuthResponse().id_token;
			this.loginService.login(gtoken, null, false).subscribe(
				data => {
					if (data.ok) {
						let idCompany = data.user.id_company._id;
						if (data.user.id_company) { this.wsService.emit('enterCompany', idCompany); }
						window.location.href = '/admin';
						// this.router.navigate(['/admin']);				
					}
				},
				() => {
					this.publicService.snack('Error de validación en Google', 2000, null);
				}
			);
		});
	}

}
