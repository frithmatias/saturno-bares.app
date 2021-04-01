import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { FormGroupDirective, FormGroup, FormControl, Validators } from '@angular/forms';
import { AdminService } from 'src/app/modules/admin/admin.service';
import { ScoreItem, ScoreItemResponse } from 'src/app/interfaces/score.interface';
import { Section } from 'src/app/interfaces/section.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { PublicService } from 'src/app/modules/public/public.service';

@Component({
	selector: 'app-poll-create',
	templateUrl: './poll-create.component.html',
	styleUrls: ['./poll-create.component.css']
})
export class PollCreateComponent implements OnInit {

	@Output() scoreItemCreated: EventEmitter<ScoreItem> = new EventEmitter();
	@Output() sectionChanged: EventEmitter<Section> = new EventEmitter();
	@Input() idSection: string;
	loading = false;
	forma: FormGroup;

	constructor(
		public adminService: AdminService,
		private publicService: PublicService
	) { }

	ngOnInit(): void {
		this.forma = new FormGroup({
			txItem: new FormControl(null, [Validators.required, Validators.maxLength(20)])
		});
	}

	createTable(formDirective: FormGroupDirective) {
		if (this.forma.invalid) {
			return;
		}

		const scoreItem: ScoreItem = {
			id_section: this.idSection,
			tx_item: this.forma.value.txItem
		};

		this.loading = true;
		this.adminService.createScoreItem(scoreItem).subscribe((data: ScoreItemResponse) => {
			this.loading = false;
			this.publicService.snack(data.msg, 2000);
			this.resetForm(formDirective);
			if (data.ok) {
				this.scoreItemCreated.emit(data.scoreitem);
			}
		}, (err: HttpErrorResponse) => {
			this.loading = false;
			this.publicService.snack(err.error.msg, 2000);
		})
	}

	resetForm(formDirective: FormGroupDirective) {
		formDirective.resetForm();
	}

	sectionChange(section: Section): void {
		this.sectionChanged.emit(section);
	}
}
