import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { AdminService } from '../admin.service';
import { MatSnackBar, MatSnackBarDismiss } from '@angular/material/snack-bar';
import { Table, TableResponse } from '../../../interfaces/table.interface';
import { User } from 'src/app/interfaces/user.interface';
import { Section  } from '../../../interfaces/section.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.css']
})
export class TablesComponent implements OnInit {
  @Input() nomargin: boolean;
  @Input() nopadding: boolean;
  
  userSubscription: Subscription;
  sectionSelected: Section;
  tableNew: Table;
  
  constructor(
    public adminService: AdminService,
    private snack: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.adminService.sections = this.adminService.sections;
    this.adminService.tables = this.adminService.tables;
  }

  deleteTable(idTable: string): void {
    this.snack.open('Desea eliminar la mesa?', 'ELIMINAR', { duration: 5000 }).afterDismissed().subscribe((data: MatSnackBarDismiss) => {
      if (data.dismissedByAction) {
        this.adminService.deleteTable(idTable).subscribe((data: TableResponse) => {
          this.snack.open(data.msg, null, { duration: 5000 });
          this.adminService.tables = this.adminService.tables.filter(table => table._id != idTable);
          this.adminService.tablesSection = this.adminService.tablesSection.filter(table => table._id != idTable);
        },
          (err: TableResponse) => {
            this.snack.open(err.msg, null, { duration: 5000 });
          }
        )
      }
    });
  }

  sectionChanged(section: Section): void {
    this.sectionSelected = section;
    this.adminService.tablesSection = this.adminService.tables.filter(table => table.id_section === section._id)
  }

  tableCreated(table: Table): void {
    this.tableNew = table;
    this.adminService.tables.push(table);
    this.adminService.tables.sort((a, b) => a.nm_table - b.nm_table)
    this.adminService.tablesSection.push(table);
    this.adminService.tablesSection.sort((a, b) => a.nm_table - b.nm_table)
  }

}
