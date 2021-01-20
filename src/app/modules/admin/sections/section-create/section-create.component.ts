import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormControl, Validators, FormGroupDirective, FormArray } from '@angular/forms';

import { AdminService } from '../../admin.service';
import { Section, SectionResponse } from '../../../../interfaces/section.interface';
import { LoginService } from '../../../../services/login.service';
import { SharedService } from '../../../../services/shared.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
	selector: 'app-section-create',
	templateUrl: './section-create.component.html',
	styleUrls: ['./section-create.component.css']
})
export class SectionCreateComponent implements OnInit {

	@Output() sectionCreated: EventEmitter<Section> = new EventEmitter();
	forma: FormGroup;
	loading = false;

	constructor(
		public adminService: AdminService,
		private loginService: LoginService,
		private sharedService: SharedService
	) { }

	ngOnInit(): void {

		this.forma = new FormGroup({
			txSection: new FormControl(null, [Validators.required, Validators.maxLength(30)]),
			scoreItems: new FormArray([])
		});
	}

	createSection(formDirective: FormGroupDirective) {

		if (this.forma.invalid) {
			this.sharedService.snack('Faltan datos, verifica todos los campos', 3000);
			return;
		}

		const section: Section = {
			id_company: this.loginService.user.id_company._id,
			tx_section: this.forma.value.txSection,
			ar_scoreitems: this.forma.controls.scoreItems.value,
			__v: null,
			_id: null
		};

		this.loading = true;
		this.adminService.createSection(section).subscribe((data: SectionResponse) => {
			this.loading = false;
			this.sharedService.snack(data.msg, 2000);
			this.resetForm(formDirective);
			if (data.ok) {
				this.sectionCreated.emit(data.section);
			}
		}, (err: HttpErrorResponse) => {
			this.loading = false;
			this.sharedService.snack(err.error.msg, 2000);
		});
	}

	resetForm(formDirective: FormGroupDirective) {
		formDirective.resetForm();
		this.forma.reset();
		this.sharedService.scrollTop();
	}


	createScoreItem() {

		// si existe un valor "vacío" dentro del array de controles, evito crear otro control.
		for (let control of (<FormArray>this.forma.controls['scoreItems']).controls) {
			this.sharedService.snack('Complete todos los campos en blanco', 2000);
			if (control.value === '') return;
		}

		(<FormArray>this.forma.controls['scoreItems']).push(new FormControl('', Validators.required))

	}

	deleteScoreItem(item: number) {
		(<FormArray>this.forma.controls['scoreItems']).removeAt(item);
	}

}
