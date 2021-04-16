import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { AdminService } from 'src/app/modules/admin/admin.service';
import { Table, TableResponse } from 'src/app/interfaces/table.interface';
import { Section } from 'src/app/interfaces/section.interface';
import { LoginService } from 'src/app/services/login.service';
import { PublicService } from 'src/app/modules/public/public.service';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.css']
})
export class TablesComponent implements OnInit {
  @Input() nomargin: boolean;
  @Input() nopadding: boolean;

  displayedColumns: string[] = ['id_section', 'nm_table', 'nm_persons', 'tx_status', '_id'];

  tableCreate = false;
  sectionSelected: Section;
  tableNew: Table;

  constructor(
    public loginService: LoginService,
    public adminService: AdminService,
    private publicService: PublicService
  ) { }

  ngOnInit(): void { }

  deleteTable(table: Table): void {
    this.publicService.snack(`Desea eliminar la mesa ${table.nm_table}?`, 2000, 'Aceptar').then(() => {

      let idTable = table._id;
      this.adminService.deleteTable(idTable).subscribe((data: TableResponse) => {
        this.publicService.snack(data.msg, 1000);
        this.adminService.tables = this.adminService.tables.filter(table => table._id != idTable);
        this.adminService.tablesSection = this.adminService.tablesSection.filter(table => table._id != idTable);
      },
        (err: TableResponse) => {
          this.publicService.snack(err.msg, 3000);
        }
      )

    });
  }

  sectionChanged(section: Section): void {
    this.sectionSelected = section;
    this.adminService.tablesSection = this.adminService.tables.filter(table => table.id_section === section._id)
  }

  tableCreated(table: Table): void {
    this.tableNew = table;
    this.adminService.tables = [...this.adminService.tables, table];
    this.adminService.tables.sort((a, b) => a.nm_table - b.nm_table)
    this.adminService.tablesSection = [...this.adminService.tablesSection, table];
    this.adminService.tablesSection.sort((a, b) => a.nm_table - b.nm_table)
  }

}
