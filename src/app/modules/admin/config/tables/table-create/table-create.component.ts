import { Component, OnInit, EventEmitter, Output, Input, SimpleChange, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators, FormGroupDirective } from '@angular/forms';

import { AdminService } from 'src/app/modules/admin/admin.service';
import { Table, TableResponse } from 'src/app/interfaces/table.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { PublicService } from 'src/app/modules/public/public.service';

@Component({
	selector: 'app-table-create',
	templateUrl: './table-create.component.html',
	styleUrls: ['./table-create.component.css']
})
export class TableCreateComponent implements OnInit {
	@ViewChild('nmPersons') nmPersonsRef: ElementRef; 
	@Output() tableCreated: EventEmitter<Table> = new EventEmitter();
	@Input() idSection: string;
	@Input() tablesSection: Table[] = [];
	loading = false;
	forma: FormGroup;

	constructor(
		public adminService: AdminService,
		private publicService: PublicService
	) { }

	ngOnInit(): void {
		this.forma = new FormGroup({
			nmTable: new FormControl(null, [Validators.required, Validators.min(1), Validators.max(1000)]),
			nmPersons: new FormControl(null, [Validators.required, Validators.min(1), Validators.max(1000)]),
		});

		let numTables = this.tablesSection.length;
		this.forma?.patchValue({ nmTable: numTables + 1 }); // set num table on init

	}

	ngOnChanges(changes: SimpleChanges): void {
		if(changes.tablesSection){
			let numTables = changes.tablesSection.currentValue.length;
			this.forma?.patchValue({ nmTable: numTables + 1 }); // set num table on init
			this.nmPersonsRef?.nativeElement.focus();
		}
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
			id_section: this.idSection,
			nm_table: this.forma.value.nmTable,
			nm_persons: this.forma.value.nmPersons
		};

		this.loading = true;
		this.adminService.createTable(table).subscribe((data: TableResponse) => {

			this.loading = false;
			this.publicService.snack(data.msg, 2000);
			this.resetForm(formDirective);
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
	}

}
