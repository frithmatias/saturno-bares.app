import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormControl, Validators, FormGroupDirective } from '@angular/forms';

import { AdminService } from '../../admin.service';
import { Section, SectionResponse } from '../../../../interfaces/section.interface';
import { LoginService } from '../../../../services/login.service';
import { SharedService } from '../../../../services/shared.service';

@Component({
	selector: 'app-section-create',
	templateUrl: './section-create.component.html',
	styleUrls: ['./section-create.component.css']
})
export class SectionCreateComponent implements OnInit {
	@Output() sectionCreated: EventEmitter<Section> = new EventEmitter();
	forma: FormGroup;

	constructor(
		public adminService: AdminService,
		private loginService: LoginService,
		private sharedService: SharedService,
		private snack: MatSnackBar
	) { }

	ngOnInit(): void {

		this.forma = new FormGroup({
			txSection: new FormControl(null, Validators.required)
		});
	}

	createSection(formDirective: FormGroupDirective) {
		if (this.forma.invalid) {
			return;
		}

		const section: Section = {
			id_company: this.loginService.user.id_company._id,
			tx_section: this.forma.value.txSection,
			id_session: null,
			__v: null,
			_id: null
		};

		this.adminService.createSection(section).subscribe((data: SectionResponse) => {
			this.sectionCreated.emit(data.section);
			this.snack.open(data.msg, null, { duration: 5000 });
			this.resetForm(formDirective);
		},
			(err: any) => {
				this.snack.open(err.error.msg, null, { duration: 5000 });
			}
		)
	}

	resetForm(formDirective: FormGroupDirective) {
		formDirective.resetForm();
		this.forma.reset();
		this.sharedService.scrollTop();
	}

}
