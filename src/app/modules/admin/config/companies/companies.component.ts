import { Component, OnInit, Input } from '@angular/core';

import { AdminService } from 'src/app/modules/admin/admin.service';
import { LoginService } from 'src/app/services/login.service';

import { Company } from 'src/app/interfaces/company.interface';
import { CompanyResponse } from 'src/app/interfaces/company.interface';
import { PublicService } from 'src/app/modules/public/public.service';


@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.css']
})
export class CompaniesComponent implements OnInit {
  @Input() nomargin: boolean;
  @Input() nopadding: boolean;

  displayedColumns: string[] = ['tx_company_name', '_id'];

  openForm = false;
  companyEdit: Company;  // company enviada al child
  companyUpdated: Company; // company recibida del child

  constructor(
    public adminService: AdminService,
    public loginService: LoginService,
    private publicService: PublicService
  ) { }

  ngOnInit(): void { }


  editCompany(company: Company): void {
    this.openForm = true;
    this.companyEdit = company
  }

  clearForm(): void {
    this.openForm = false; // close form
    this.companyEdit = null;
  }

  companyEditedOrCreated(company: Company): void {
    this.openForm = false;
    this.companyUpdated = company;
    if (this.companyEdit) {
      this.adminService.companies = this.adminService.companies.filter(comp => comp._id !== company._id)
    }
    this.adminService.companies = [...this.adminService.companies, company];
  }

  deleteCompany(company: Company): void {
    this.publicService.snack(`CUIDADO: Estás por borrar la empresa ${company.tx_company_name} y TODAS sus dependencias.`, 5000, 'BORRAR').then(() => {

      let idCompany = company._id;
      this.adminService.deleteCompany(idCompany).subscribe((data: CompanyResponse) => {
        this.publicService.snack(data.msg, 3000);
        this.adminService.companies = this.adminService.companies.filter(company => company._id != idCompany);
        if (idCompany === this.loginService.user.id_company?._id) {
          this.loginService.user.id_company = null;
          localStorage.setItem('user', JSON.stringify(this.loginService.user));
        }
      }, (err: CompanyResponse) => {
        this.publicService.snack(err.msg, 3000);
      }
      )

    })
  }

}
