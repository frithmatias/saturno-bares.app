import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators, FormGroupDirective } from '@angular/forms';

// libraries
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { AjaxError } from 'rxjs/ajax';
import { HttpErrorResponse } from '@angular/common/http';

// services
import { AdminService } from '../../../../modules/admin/admin.service';
import { LoginService } from '../../../../services/login.service';
import { SharedService } from '../../../../services/shared.service';

// interfaces
import { User, UserResponse } from '../../../../interfaces/user.interface';
import { Skill, SkillsResponse } from '../../../../interfaces/skill.interface';


@Component({
	selector: 'app-assistant-create-form',
	templateUrl: './assistant-create-form.component.html',
	styleUrls: ['./assistant-create-form.component.css']
})
export class AssistantCreateFormComponent implements OnInit, OnChanges {
	@Input() assistantEdit: User;
	@Output() idAssistantUpdated: EventEmitter<string> = new EventEmitter();

	forma: FormGroup;
	skills: Skill[] = [];
	hasGenericSkillOnly = true; // dont show if assistant has generic skill only
	selStrSkills: string[] = [];
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
		if (changes.assistantEdit.currentValue?.tx_role === 'ADMIN_ROLE') {
			this.forma.controls['rol'].disable();
			this.forma.controls['email'].disable();
		}

		if (changes.assistantEdit.currentValue?.id_company._id) {
			let idCompany = changes.assistantEdit.currentValue.id_company._id;
			this.forma?.patchValue({ idCompany });
			this.getSkills(idCompany);
		}
		
		this.forma?.patchValue({
			rol: changes.assistantEdit.currentValue.tx_role,
			email: changes.assistantEdit.currentValue.tx_email,
			nombre: changes.assistantEdit.currentValue.tx_name,
			password: '******',
			password2: '******'
		})

		if(changes.assistantEdit?.currentValue?.id_skills.length > 0){
			this.selStrSkills = changes.assistantEdit?.currentValue?.id_skills;
		} else {
			this.selStrSkills = [];
		}
	}

	getSkills(idCompany: string) {
		this.adminService.readSkills(idCompany).subscribe((data: SkillsResponse) => {
			// if company has generic_skill only dont show table and select generic_skill by default
			if(data.skills.length === 1 && data.skills[0].bl_generic === true){
				this.hasGenericSkillOnly = true;
				this.selStrSkills.push(data.skills[0]._id); // select generic_skill
			} else {
				this.hasGenericSkillOnly = false;
			}

			this.skills = data.skills.filter(skill => skill.bl_generic === false);
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


	createAssistant(formDirective: FormGroupDirective) {
		if (!this.selStrSkills || this.selStrSkills.length === 0) {
			this.snack.open('Seleccione al menos un skill', 'ACEPTAR', { duration: 5000 });
			return;
		}

		if (this.forma.invalid) {
			if (this.forma.errors?.password) {
				this.snack.open(this.forma.errors.password, 'ACEPTAR', { duration: 5000 });
			}
			return;
		}

		const assistant: any = {
			// para acceder a los datos de un control disabled puedo traerlos desde forma.controls 
			// o con el método this.forma.getRawValue()
			tx_role: this.forma.controls.rol.value,
			id_company: this.forma.value.idCompany,
			tx_name: this.forma.value.nombre,
			tx_email: this.forma.controls.email.value,
			tx_password: this.forma.value.password,
			id_skills: this.selStrSkills
		};

		if (this.assistantEdit) {
			assistant._id = this.assistantEdit._id;

			this.adminService.updateAssistant(assistant).subscribe((data: UserResponse) => {
				if (data.ok) {
					if (data.user._id === this.loginService.user._id) {
						// push my user edited
						this.loginService.pushUser(data.user)
					}
					this.idAssistantUpdated.emit(data.user._id);
					this.snack.open(data.msg, null, { duration: 5000 });
					this.resetForm(formDirective);
				}
			}, (err: HttpErrorResponse) => {
				this.snack.open(err.error.msg, null, { duration: 5000 });
			})

		} else {

			this.adminService.createAssistant(assistant).subscribe(
				(data: UserResponse) => {
					this.idAssistantUpdated.emit(data.user._id);
					this.snack.open(data.msg, null, { duration: 5000 });
					this.resetForm(formDirective);
					formDirective.resetForm();
				}, (err: HttpErrorResponse) => {
					this.snack.open(err.error.msg, null, { duration: 5000 });
				}
			)
		}

	}

	manejaError = (err: AjaxError) => {
		return of<AjaxError>(err);
	}


	resetForm(formDirective: FormGroupDirective) {
		this.assistantEdit = null;
		this.forma.enable();
		this.forma.reset();
		formDirective.resetForm();
		this.sharedService.scrollTop();
	}
}
