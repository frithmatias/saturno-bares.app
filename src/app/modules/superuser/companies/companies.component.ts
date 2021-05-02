import { Component, OnInit } from '@angular/core';
import { Company, CompaniesResponse } from 'src/app/interfaces/company.interface';
import { AdminService } from '../../admin/admin.service';
import { SuperuserService } from '../superuser.service';
import { PublicService } from '../../public/public.service';
import { Section, SectionsResponse } from '../../../interfaces/section.interface';
import { WaiterService } from '../../waiter/waiter.service';
import { Table } from 'src/app/interfaces/table.interface';
import { TablesResponse } from '../../../interfaces/table.interface';

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.css']
})
export class CompaniesComponent implements OnInit {

  companies: Company[] = [];
  company: Company;
  sections: Section[] = [];
  tables: Table[] = [];
  tablesSection = new Map();
  displayedColumns: string[] = [
    'tx_company_name',
    'tx_company_type'
  ];

  constructor(
    private publicService: PublicService,
    private waiterService: WaiterService,
    private adminService: AdminService,
    private superuserService: SuperuserService
  ) { }

  ngOnInit(): void {
    this.superuserService.readAllCompanies().subscribe((data: CompaniesResponse) => {
      if (data.ok) {
        this.companies = data.companies;
      }
    })
  }

  selectCompany(company: Company) {
    this.company = company;
    const idCompany: string = this.company._id;

    this.publicService.readSections(idCompany).subscribe((data: SectionsResponse) => {
      this.sections = data.sections;
    }, () => { }, () => {
      this.waiterService.readTables(idCompany).subscribe((data: TablesResponse) => {
        this.tables = data.tables;

        this.sections.forEach(section => {
          this.tablesSection.set(section.tx_section, this.tables.filter(table => table.id_section === section._id))
        })
        console.log(this)
      })
    })
  }


}
