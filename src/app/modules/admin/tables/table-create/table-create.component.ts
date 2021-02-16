import { Component, OnInit, EventEmitter, Output, Input, SimpleChange, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators, FormGroupDirective } from '@angular/forms';

import { AdminService } from '../../admin.service';
import { Table, TableResponse } from '../../../../interfaces/table.interface';
import { Section } from '../../../../interfaces/section.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { PublicService } from '../../../public/public.service';

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
		private publicService: PublicService
	) { }

	ngOnInit(): void {
		this.forma = new FormGroup({
			idSection: new FormControl(null, Validators.required),
			nmTable: new FormControl(null, [Validators.required, Validators.min(1), Validators.max(1000)]),
			nmPersons: new FormControl(null, [Validators.required, Validators.min(1), Validators.max(1000)]),
		});
	}

	ngOnChanges(changes: SimpleChanges): void {
		let numTables = changes.tablesSection.currentValue.length;
		this.forma?.patchValue({ nmTable: numTables + 1 }); // set num table on init
	}

	createTable(formDirective: FormGroupDirective) {
		if (this.forma.invalid) {
			return;
		}
		// verifico que el número de mesa no exista dentro del sector.
		for (let table of this.tablesSection) {
			if (this.forma.controls.nmTable.value === table.nm_table) {
				this.publicService.snack('Ya existe la mesa ' + table.nm_table + ' en este sector.', 3000);
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
			this.publicService.snack(data.msg, 2000);
			this.resetForm(formDirective);
			this.forma.patchValue({ idSection: data.table.id_section }); // persist section data
			this.forma.patchValue({ nmTable: data.table.nm_table + 1 }); // set num table on save

			if (data.ok) {
				this.tableCreated.emit(data.table);
			}

		}, (err: HttpErrorResponse) => {
			this.loading = false;
			this.publicService.snack(err.error.msg, 2000);
		});
	}

	resetForm(formDirective: FormGroupDirective) {
		formDirective.resetForm();
		this.publicService.scrollTop();
	}

	sectionChange(section: Section): void {
		this.sectionChanged.emit(section);
	}
}
