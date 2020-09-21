import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormControl, Validators, FormGroupDirective } from '@angular/forms';

import { AdminService } from '../../../../modules/admin/admin.service';
import { Skill, SkillResponse } from '../../../../interfaces/skill.interface';
import { LoginService } from '../../../../services/login.service';
import { SharedService } from '../../../../services/shared.service';

@Component({
	selector: 'app-skill-create-form',
	templateUrl: './skill-create-form.component.html',
	styleUrls: ['./skill-create-form.component.css']
})
export class SkillCreateFormComponent implements OnInit {
	@Output() skillCreated: EventEmitter<Skill> = new EventEmitter();

	forma: FormGroup;
	constructor(
		public adminService: AdminService,
		public loginService: LoginService,
		private sharedService: SharedService,
		private snack: MatSnackBar,
	) { }

	ngOnInit(): void {
		this.forma = new FormGroup({
			cdSkill: new FormControl(null, Validators.required),
			txSkill: new FormControl(null, Validators.required)
		});
	}

	createSkill(formDirective: FormGroupDirective) {
		if (this.forma.invalid) {
			return;
		}
		const skill: Skill = {
			id_company: this.loginService.user.id_company._id,
			cd_skill: this.forma.value.cdSkill,
			tx_skill: this.forma.value.txSkill,
			bl_generic: false,
			_id: null
		};

		this.adminService.createSkill(skill).subscribe((data: SkillResponse) => {
			if(data.ok){
				this.skillCreated.emit(data.skill);
				this.snack.open(data.msg, null, { duration: 5000 });
				this.resetForm(formDirective);
			}
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
