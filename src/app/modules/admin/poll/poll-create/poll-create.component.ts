import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { FormGroupDirective, FormGroup, FormControl, Validators } from '@angular/forms';
import { AdminService } from '../../admin.service';
import { SharedService } from '../../../../services/shared.service';
import { ScoreItem, ScoreItemResponse } from '../../../../interfaces/score.interface';
import { Section } from '../../../../interfaces/section.interface';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
	selector: 'app-poll-create',
	templateUrl: './poll-create.component.html',
	styleUrls: ['./poll-create.component.css']
})
export class PollCreateComponent implements OnInit {

	@Output() scoreItemCreated: EventEmitter<ScoreItem> = new EventEmitter();
	@Output() sectionChanged: EventEmitter<Section> = new EventEmitter();
	@Input() sections: Section[] = [];
	loading = false;
	forma: FormGroup;

	constructor(
		public adminService: AdminService,
		private sharedService: SharedService
	) { }

	ngOnInit(): void {
		this.forma = new FormGroup({
			idSection: new FormControl(null, Validators.required),
			txItem: new FormControl(null, [Validators.required, Validators.maxLength(20)])
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

		this.loading = true;
		this.adminService.createScoreItem(scoreItem).subscribe((data: ScoreItemResponse) => {
			this.loading = false;
			this.sharedService.snack(data.msg, 2000);
			this.resetForm(formDirective);
			if (data.ok) {
				this.scoreItemCreated.emit(data.scoreitem);
			}
		}, (err: HttpErrorResponse) => {
			this.loading = false;
			this.sharedService.snack(err.error.msg, 2000);
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
