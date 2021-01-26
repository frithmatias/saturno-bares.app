import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators, FormGroupDirective } from '@angular/forms';

// libraries
import { of } from 'rxjs';
import { AjaxError } from 'rxjs/ajax';
import { HttpErrorResponse } from '@angular/common/http';

// services
import { AdminService } from '../../admin.service';
import { LoginService } from '../../../../services/login.service';

// interfaces
import { User, UserResponse } from '../../../../interfaces/user.interface';
import { Table } from '../../../../interfaces/table.interface';
import { PublicService } from '../../../public/public.service';

@Component({
	selector: 'app-waiter-create',
	templateUrl: './waiter-create.component.html',
	styleUrls: ['./waiter-create.component.css']
})
export class WaiterCreateComponent implements OnInit, OnChanges {
	
	@Input() waiterEdit: User;
	@Output() idWaiterUpdated: EventEmitter<string> = new EventEmitter();
	loading = false;
	forma: FormGroup;
	tables: Table[] = [];

	constructor(
		public adminService: AdminService,
		private loginService: LoginService,
		private publicService: PublicService
	) { }

	ngOnInit(): void {
		// build reactive form
		if(!this.forma) this.createForm();
	}

	createForm(): void {
		this.forma = new FormGroup({
			rol: new FormControl(null, Validators.required),
			idCompany: new FormControl(null, Validators.required),
			nombre: new FormControl(null, [Validators.required, Validators.maxLength(30)]),
			email: new FormControl(null, [Validators.required, Validators.maxLength(30), Validators.email]),
			password: new FormControl(null, [Validators.required, Validators.maxLength(30)]),
			password2: new FormControl(null, [Validators.required, Validators.maxLength(30)])
		}, { validators: this.sonIguales('password', 'password2') });
	}

	ngOnChanges(changes: SimpleChanges) {

		if (!changes.waiterEdit?.currentValue) { return; }

		if(this.waiterEdit && !this.forma) this.createForm();
		this.forma?.enable();
		// ADMIN_ROLE -> id_company: null

		if(changes.waiterEdit.currentValue === 'clear_form'){
			// si se hace click en editar el usuario, pero luego en lugar de editarlo se borra, 
			// el formulario queda cargado y hay que limpiarlo.
			this.resetForm();
			return;
		}

		if (changes.waiterEdit.currentValue?.id_role === 'ADMIN_ROLE') {
			this.forma?.controls['rol'].disable();
			this.forma?.controls['email'].disable();
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

	createWaiter(formDirective: FormGroupDirective) {

		if (this.forma.invalid) {
			if (this.forma.errors?.password) {
				this.publicService.snack(this.forma.errors.password, 5000, 'Aceptar');
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

		this.loading = true;
		if (this.waiterEdit) {
			waiter._id = this.waiterEdit._id;
			this.adminService.updateWaiter(waiter).subscribe((data: UserResponse) => {
				this.loading = false;
				this.publicService.snack(data.msg, 2000);
				this.resetForm(formDirective);
				if (data.ok) {
					this.loginService.pushUser(data.user);
					this.idWaiterUpdated.emit(data.user._id);
				}
			}, (err: HttpErrorResponse) => {
				this.loading = false;
				this.publicService.snack(err.error, 5000);
			})
		} else {
			this.adminService.createWaiter(waiter).subscribe(
				(data: UserResponse) => {
					this.loading = false;
					this.publicService.snack(data.msg, 2000);
					this.resetForm(formDirective);
					if (data.ok) {
						this.idWaiterUpdated.emit(data.user._id);
					}
				}, (err: HttpErrorResponse) => {
					this.loading = false;
					this.publicService.snack(err.error, 5000);
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
		this.publicService.scrollTop();
	}
}
