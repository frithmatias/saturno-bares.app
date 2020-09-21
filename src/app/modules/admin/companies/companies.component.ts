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
export class CompaniesComponent implements OnInit, OnDestroy {
  @Input() nomargin: boolean;
  @Input() nopadding: boolean;
  companies: Company[];
  companyEdit: Company;  // company enviada al child
  companyUpdated: Company; // company recibida del child
  user: User;
  userSubscription: Subscription;

  constructor(
    private adminService: AdminService,
    private loginService: LoginService,
    private snack: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.user = this.loginService.user;

    if (this.user._id) {

      let idUser = this.user._id;
      this.readCompanies(idUser);
    }

    this.userSubscription = this.loginService.user$.subscribe(data => {
      if (data) {
        this.user = data;
      }
    })
  }

  ngOnChanges(changes) {

  }

  editCompany(company: Company): void {
    this.companyEdit = company
  }

  newCompany(company: Company): void {
    this.companyUpdated = company;
    let idUser = this.user._id;
    this.readCompanies(idUser);
  }

  deleteCompany(idCompany: string): void {
    this.snack.open('Desea eliminar la empresa?', 'ELIMINAR', { duration: 10000 }).afterDismissed().subscribe((data: MatSnackBarDismiss) => {
      if (data.dismissedByAction) {
        this.adminService.deleteCompany(idCompany).subscribe((data: CompanyResponse) => {
          this.snack.open(data.msg, null, { duration: 2000 });
          this.companies = this.companies.filter(company => company._id != idCompany);
          this.adminService.companies = this.companies;
          this.adminService.companiesSource.next(this.companies);
          if (idCompany === this.user.id_company?._id) {
            this.user.id_company = null;
            localStorage.setItem('user', JSON.stringify(this.user));
          }
        }, (err: CompanyResponse) => {
          this.snack.open(err.msg, null, { duration: 2000 });
        }
        )
      }
    })
  }

  readCompanies(idUser: string): void {
    this.adminService.readCompanies(idUser).subscribe((data: CompaniesResponse) => {
      this.companies = data.companies;
      this.adminService.companies = data.companies;
    });
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }
}
