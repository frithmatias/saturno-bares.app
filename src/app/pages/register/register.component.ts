import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { WebsocketService } from 'src/app/services/websocket.service';
import { PublicService } from '../../modules/public/public.service';
import { LoginService } from '../../services/login.service';

import { environment } from 'src/environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';

declare const gapi: any;

@Component({
	selector: 'app-register',
	templateUrl: './register.component.html',
	styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
	forma: FormGroup;
	auth2: any; // info de google con el token

	constructor(
		private router: Router,
		private publicService: PublicService,
		private loginService: LoginService,
		private wsService: WebsocketService,
		private snack: MatSnackBar
	) { }

	ngOnInit() {
		this.googleInit();
		this.publicService.drawerScrollTop();

		// this.publicUrl = document.
		// this.publicUrl = location.origin + '/#/public/';
		let defaults = {
			name: '',
			email: '',
			password1: '',
			password2: ''
		}
		this.forma = new FormGroup({
			name: new FormControl(defaults.name, Validators.required),
			email: new FormControl(defaults.email, [Validators.required, Validators.email]),
			password1: new FormControl(defaults.password1, Validators.required),
			password2: new FormControl(defaults.password2, Validators.required),
			// condiciones: new FormControl(false, Validators.required)
		}, { validators: [
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
					this.forma.controls['email'].setErrors({'incorrect': true});
					this.forma.setErrors({'emailExists': true})
				}	
			});
	}

	registrarUsuario() {

		if (this.forma.invalid) {
			this.snack.open('Faltan datos por favor verifique', 'Aceptar', { duration: 5000 });
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
				Swal.fire('Usuario creado', 'Por favor ahora ingrese con su usuario y contraseña', 'success');
				this.router.navigate(['/login'])
			}
		},
			() => {
				this.snack.open('Error al registrar el usuario', 'Aceptar', { duration: 5000 });
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
						window.location.href = '#/admin';
						// this.router.navigate(['/admin']);				
					}
				},
				() => {
					this.snack.open('Error de validación en Google', null, { duration: 2000 });
				}
			);
		});
	}
	

}
