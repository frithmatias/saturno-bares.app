import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { FormGroupDirective, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '../../admin.service';
import { LoginService } from '../../../../services/login.service';
import { SharedService } from '../../../../services/shared.service';
import { ScoreItem, ScoreItemsResponse, ScoreItemResponse } from '../../../../interfaces/score.interface';
import { Section } from '../../../../interfaces/section.interface';

@Component({
  selector: 'app-poll-create',
  templateUrl: './poll-create.component.html',
  styleUrls: ['./poll-create.component.css']
})
export class PollCreateComponent implements OnInit {

	@Output() scoreItemCreated: EventEmitter<ScoreItem> = new EventEmitter();
	@Output() sectionChanged: EventEmitter<Section> = new EventEmitter();
	@Input() sections: Section[] = [];

	forma: FormGroup;
	constructor(
		public adminService: AdminService,
		private loginService: LoginService,
		private sharedService: SharedService,
		private snack: MatSnackBar
	) { }

	ngOnInit(): void {
		this.forma = new FormGroup({
			idSection: new FormControl(null, Validators.required),
      txItem: new FormControl(null, Validators.required)
  	});
	}

	createTable(formDirective: FormGroupDirective) {
		if (this.forma.invalid) {
			return;
		}

		const scoreItem: ScoreItem = {
			id_section: this.forma.value.idSection,
			tx_item: this.forma.value.txItem
		};

		this.adminService.createScoreItem(scoreItem).subscribe((data: ScoreItemResponse) => {
			this.scoreItemCreated.emit(data.scoreitem);
			this.snack.open(data.msg, null, { duration: 5000 });
			this.resetForm(formDirective);

			// persist selected section option on select control
			this.forma.patchValue({idSection: data.scoreitem.id_section})
			
		})
	}

	resetForm(formDirective: FormGroupDirective) {
		formDirective.resetForm();
		this.sharedService.scrollTop();
	}

	sectionChange(section: Section): void {
		this.sectionChanged.emit(section);
	}
}
