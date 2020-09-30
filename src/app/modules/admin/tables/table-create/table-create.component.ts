import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormControl, Validators, FormGroupDirective } from '@angular/forms';

import { AdminService } from '../../admin.service';
import { Table, TableResponse } from '../../../../interfaces/table.interface';
import { LoginService } from '../../../../services/login.service';
import { SharedService } from '../../../../services/shared.service';
import { Section } from '../../../../interfaces/section.interface';

@Component({
	selector: 'app-table-create',
	templateUrl: './table-create.component.html',
	styleUrls: ['./table-create.component.css']
})
export class TableCreateComponent implements OnInit {
	@Output() tableCreated: EventEmitter<Table> = new EventEmitter();
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
			nmTable: new FormControl(null, Validators.required),
			nmPersons: new FormControl(null, Validators.required),
		});
	}

	createTable(formDirective: FormGroupDirective) {
		console.log(this.forma)
		if (this.forma.invalid) {
			return;
		}

		const table: Table = {
			id_section: this.forma.value.idSection,
			nm_table: this.forma.value.nmTable,
			nm_persons: this.forma.value.nmPersons,
			tx_status: 'paused',
			id_ticket: null
		};

		this.adminService.createTable(table).subscribe((data: TableResponse) => {
			this.tableCreated.emit(data.table);
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

	sectionChange(section: Section): void {
		this.sectionChanged.emit(section);
	}
}
