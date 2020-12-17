import { Component, OnInit, OnDestroy, Input } from '@angular/core';

import { MatSnackBar, MatSnackBarDismiss } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

import { AdminService } from '../../../modules/admin/admin.service';
import { LoginService } from '../../../services/login.service';

import { Company } from '../../../interfaces/company.interface';
import { CompanyResponse, CompaniesResponse } from '../../../interfaces/company.interface';
import { User } from '../../../interfaces/user.interface';


@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.css']
})
export class CompaniesComponent implements OnInit {
  @Input() nomargin: boolean;
  @Input() nopadding: boolean;

  displayedColumns: string[] = ['tx_company_name', 'tx_address_street', 'tx_address_number', '_id'];

  openForm = false;
  companyEdit: Company;  // company enviada al child
  companyUpdated: Company; // company recibida del child

  constructor(
    public adminService: AdminService,
    private loginService: LoginService,
    private snack: MatSnackBar
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

  newCompany(company: Company): void {
    this.openForm = false;
    this.companyUpdated = company;
    this.adminService.companies = [...this.adminService.companies, company];
  }

  deleteCompany(idCompany: string): void {
    this.snack.open('Desea eliminar la empresa?', 'ELIMINAR', { duration: 10000 }).afterDismissed().subscribe((data: MatSnackBarDismiss) => {
      if (data.dismissedByAction) {
        this.adminService.deleteCompany(idCompany).subscribe((data: CompanyResponse) => {
          this.snack.open(data.msg, null, { duration: 2000 });
          this.adminService.companies = this.adminService.companies.filter(company => company._id != idCompany);
          if (idCompany === this.loginService.user.id_company?._id) {
            this.loginService.user.id_company = null;
            localStorage.setItem('user', JSON.stringify(this.loginService.user));
          }
        }, (err: CompanyResponse) => {
          this.snack.open(err.msg, null, { duration: 2000 });
        }
        )
      }
    })
  }

}
