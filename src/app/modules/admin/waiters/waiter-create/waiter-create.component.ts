import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators, FormGroupDirective } from '@angular/forms';

// libraries
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { AjaxError } from 'rxjs/ajax';
import { HttpErrorResponse } from '@angular/common/http';

// services
import { AdminService } from '../../admin.service';
import { LoginService } from '../../../../services/login.service';
import { SharedService } from '../../../../services/shared.service';

// interfaces
import { User, UserResponse } from '../../../../interfaces/user.interface';
import { Table } from '../../../../interfaces/table.interface';

@Component({
	selector: 'app-waiter-create',
	templateUrl: './waiter-create.component.html',
	styleUrls: ['./waiter-create.component.css']
})
export class WaiterCreateComponent implements OnInit, OnChanges {
	@Input() waiterEdit: User;
	@Output() idWaiterUpdated: EventEmitter<string> = new EventEmitter();

	forma: FormGroup;
	tables: Table[] = [];

	constructor(
		public adminService: AdminService,
		private loginService: LoginService,
		private sharedService: SharedService,
		private snack: MatSnackBar
	) { }

	ngOnInit(): void {
		// build reactive form
		this.forma = new FormGroup({
			rol: new FormControl(null, Validators.required),
			idCompany: new FormControl(null, Validators.required),
			nombre: new FormControl(null, Validators.required),
			email: new FormControl(null, [Validators.required, Validators.email]),
			password: new FormControl(null, Validators.required),
			password2: new FormControl(null, Validators.required)
		}, { validators: this.sonIguales('password', 'password2') });
	}

	ngOnChanges(changes: SimpleChanges) {
		this.forma?.enable();
		// ADMIN_ROLE -> id_company: null

		if(changes.waiterEdit.currentValue === 'clear_form'){
			// si se hace click en editar el usuario, pero luego en lugar de editarlo se borra, 
			// el formulario queda cargado y hay que limpiarlo.
			this.resetForm();
			return;
		}

		if (changes.waiterEdit.currentValue?.id_role === 'ADMIN_ROLE') {
			this.forma.controls['rol'].disable();
			this.forma.controls['email'].disable();
		}

		if (changes.waiterEdit.currentValue?.id_company._id) {
			let idCompany = changes.waiterEdit.currentValue.id_company._id;
			this.forma?.patchValue({ idCompany });
		}
		
		this.forma?.patchValue({
			rol: changes.waiterEdit.currentValue.id_role,
			email: changes.waiterEdit.currentValue.tx_email,
			nombre: changes.waiterEdit.currentValue.tx_name,
			password: '******',
			password2: '******'
		})

	}

	// validators
	sonIguales(campo1: string, campo2: string) {
		return (group: FormGroup) => {
			const pass1 = group.controls[campo1].value;
			const pass2 = group.controls[campo2].value;
			if (pass1 === pass2) {
				return null;
			}
			return {
				password: 'Las contraseñas deben ser iguales'
			};
		};
	}


	createWaiter(formDirective: FormGroupDirective) {

		if (this.forma.invalid) {
			if (this.forma.errors?.password) {
				this.snack.open(this.forma.errors.password, 'ACEPTAR', { duration: 5000 });
			}
			return;
		}

		const waiter: User = {
			// para acceder a los datos de un control disabled puedo traerlos desde forma.controls 
			// o con el método this.forma.getRawValue()
			tx_name: this.forma.value.nombre,
			tx_email: this.forma.controls.email.value,
			tx_password: this.forma.value.password,
			id_company: this.forma.value.idCompany,
			id_role: this.forma.controls.rol.value
		};

		if (this.waiterEdit) {
			waiter._id = this.waiterEdit._id;
			this.adminService.updateWaiter(waiter).subscribe((data: UserResponse) => {
				if (data.ok) {
					if (data.user._id === this.loginService.user._id) {
						// push my user edited
						this.loginService.pushUser(data.user)
					}
					this.idWaiterUpdated.emit(data.user._id);
					this.snack.open(data.msg, null, { duration: 5000 });
					this.resetForm(formDirective);
				}
			}, (err: HttpErrorResponse) => {
				this.snack.open(err.error.msg, null, { duration: 5000 });
			})

		} else {

			this.adminService.createWaiter(waiter).subscribe(
				(data: UserResponse) => {
					this.idWaiterUpdated.emit(data.user._id);
					this.snack.open(data.msg, null, { duration: 5000 });
					this.resetForm(formDirective);
				}, (err: HttpErrorResponse) => {
					this.snack.open(err.error.msg, null, { duration: 5000 });
				}
			)
		}

	}

	manejaError = (err: AjaxError) => {
		return of<AjaxError>(err);
	}


	resetForm(formDirective?: FormGroupDirective) {
		this.waiterEdit = null;
		this.forma.enable();
		this.forma.reset();
		if(formDirective){formDirective.resetForm();}
		this.sharedService.scrollTop();
	}
}
