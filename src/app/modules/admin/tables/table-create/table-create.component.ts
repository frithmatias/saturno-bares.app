import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormGroupDirective } from '@angular/forms';

import { AdminService } from '../../admin.service';
import { Table, TableResponse } from '../../../../interfaces/table.interface';
import { SharedService } from '../../../../services/shared.service';
import { Section } from '../../../../interfaces/section.interface';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
	selector: 'app-table-create',
	templateUrl: './table-create.component.html',
	styleUrls: ['./table-create.component.css']
})
export class TableCreateComponent implements OnInit {

	@Output() tableCreated: EventEmitter<Table> = new EventEmitter();
	@Output() sectionChanged: EventEmitter<Section> = new EventEmitter();
	@Input() sections: Section[] = [];
	@Input() tablesSection: Table[] = [];
	loading = false;
	forma: FormGroup;

	constructor(
		public adminService: AdminService,
		private sharedService: SharedService
	) { }

	ngOnInit(): void {
		this.forma = new FormGroup({
			idSection: new FormControl(null, Validators.required),
			nmTable: new FormControl(null, [Validators.required, Validators.min(1), Validators.max(1000)]),
			nmPersons: new FormControl(null, [Validators.required, Validators.min(1), Validators.max(1000)]),
		});
		0
	}

	createTable(formDirective: FormGroupDirective) {
		if (this.forma.invalid) {
			return;
		}

		// verifico que el número de mesa no exista dentro del sector.
		for (let table of this.tablesSection) {
			if (this.forma.controls.nmTable.value === table.nm_table) {
				this.sharedService.snack('Ya existe la mesa ' + table.nm_table + ' en este sector.', 3000);
				return;
			}
		}

		const table: Table = {
			id_section: this.forma.value.idSection,
			nm_table: this.forma.value.nmTable,
			nm_persons: this.forma.value.nmPersons
		};

		this.loading = true;
		this.adminService.createTable(table).subscribe((data: TableResponse) => {
			this.loading = false;
			this.sharedService.snack(data.msg, 2000);
			this.forma.patchValue({ idSection: data.table.id_section }); // persist data
			this.resetForm(formDirective);
			if (data.ok) {
				this.tableCreated.emit(data.table);
			}
		}, (err: HttpErrorResponse) => {
			this.loading = false;
			this.sharedService.snack(err.error.msg, 2000);
		});
	}

	resetForm(formDirective: FormGroupDirective) {
		formDirective.resetForm();
		this.sharedService.scrollTop();
	}

	sectionChange(section: Section): void {
		this.sectionChanged.emit(section);
	}
}
