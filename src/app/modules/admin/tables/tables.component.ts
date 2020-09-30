import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { AdminService } from '../admin.service';
import { MatSnackBar, MatSnackBarDismiss } from '@angular/material/snack-bar';
import { Table, TablesResponse, TableResponse } from '../../../interfaces/table.interface';
import { User } from 'src/app/interfaces/user.interface';
import { Subscription } from 'rxjs';
import { LoginService } from '../../../services/login.service';
import { Section, SectionsResponse } from '../../../interfaces/section.interface';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.css']
})
export class TablesComponent implements OnInit, OnDestroy {
  @Input() nomargin: boolean;
  @Input() nopadding: boolean;

  sections: Section[] = [];
  sectionSelected: Section;
  sectionTables: Table[] = [];
  companyTables: Table[] = [];
  user: User;
  userSubscription: Subscription;

  constructor(
    private adminService: AdminService,
    private loginService: LoginService,
    private snack: MatSnackBar
  ) { }

  ngOnInit(): void {

    if (this.loginService.user) {

      this.user = this.loginService.user;

      if (this.user.id_company) {
        let idCompany = this.user.id_company._id;
        this.readSections(idCompany);
        this.readTables(idCompany);
      }

      this.userSubscription = this.loginService.user$.subscribe(data => {
        if (data) {
          this.user = data;
          if (data.id_company) { this.readTables(data.id_company._id); }
        }
      });

    }
  }

  deleteTable(idTable: string): void {
    this.snack.open('Desea eliminar la mesa?', 'ELIMINAR', { duration: 5000 }).afterDismissed().subscribe((data: MatSnackBarDismiss) => {
      if (data.dismissedByAction) {
        this.adminService.deleteTable(idTable).subscribe((data: TableResponse) => {
          this.snack.open(data.msg, null, { duration: 5000 });
          this.companyTables = this.companyTables.filter(table => table._id != idTable);
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
    this.sectionTables = this.companyTables.filter(table => table.id_section === section._id)
  }
  
  tableCreated(table: Table): void {
    console.log(table);
    this.companyTables.push(table);
  }

  readSections(idCompany: string) {
    return new Promise((resolve, reject) => {
      this.adminService.readSections(idCompany).subscribe((data: SectionsResponse) => {
        if(data.ok){
          this.sections = data.sections;
          this.adminService.sections = data.sections;
          console.log(this.sections);
          resolve(data.sections);
        }
      });
    })
  }


  readTables(idCompany: string) {
    return new Promise((resolve, reject) => {
      this.adminService.readTables(idCompany).subscribe((data: TablesResponse) => {
        console.log(data)
        if(data.ok){
          this.companyTables = data.tables;
          this.sectionTables = data.tables;
          this.adminService.tables = data.tables;
          resolve(data.tables);
        }
      });
    })
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }
}
