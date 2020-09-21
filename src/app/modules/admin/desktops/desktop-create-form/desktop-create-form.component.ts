import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormControl, Validators, FormGroupDirective } from '@angular/forms';

import { AdminService } from '../../../../modules/admin/admin.service';
import { Desktop, DesktopResponse } from '../../../../interfaces/desktop.interface';
import { LoginService } from '../../../../services/login.service';
import { SharedService } from '../../../../services/shared.service';

@Component({
	selector: 'app-desktop-create-form',
	templateUrl: './desktop-create-form.component.html',
	styleUrls: ['./desktop-create-form.component.css']
})
export class DesktopCreateFormComponent implements OnInit {
	@Output() desktopCreated: EventEmitter<Desktop> = new EventEmitter();
	forma: FormGroup;

	constructor(
		public adminService: AdminService,
		private loginService: LoginService,
		private sharedService: SharedService,
		private snack: MatSnackBar
	) { }

	ngOnInit(): void {

		this.forma = new FormGroup({
			cdDesktop: new FormControl(null, Validators.required),
			idType: new FormControl(null)
		});
	}

	createDesktop(formDirective: FormGroupDirective) {

		if (this.forma.invalid) {
			return;
		}

		const desktop: Desktop = {
			id_company: this.loginService.user.id_company._id,
			cd_desktop: this.forma.value.cdDesktop,
			id_session: null,
			bl_generic: false,
			__v: null,
			_id: null
		};

		this.adminService.createDesktop(desktop).subscribe((data: DesktopResponse) => {
			this.desktopCreated.emit(data.desktop);
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
