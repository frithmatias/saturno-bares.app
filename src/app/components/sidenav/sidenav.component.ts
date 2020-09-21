import { Component, OnInit, OnDestroy } from '@angular/core';
import { AdminService } from '../../modules/admin/admin.service';
import { Company, CompaniesResponse } from '../../interfaces/company.interface';
import { User } from '../../interfaces/user.interface';
import { Subscription } from 'rxjs';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent implements OnInit, OnDestroy {
  events: string[] = [];
  opened: boolean;

  user: User;
  userSubscription: Subscription;

  companies: Company[];
  companiesSubscription: Subscription;
  constructor(public adminService: AdminService, public loginService: LoginService) { }

  ngOnInit(): void {
    this.user = this.loginService.user;
    if (this.user) {
      this.readCompanies();
      // subscriptions
    }


    this.userSubscription = this.loginService.user$.subscribe((user: User) => {
      this.user = user;
      this.readCompanies();
    });

    this.companiesSubscription = this.adminService.companies$.subscribe((data: Company[]) => {
      this.companies = data;
    })
  }

  readCompanies(): void {
    if (this.user) {
      let idUser = this.user._id;
      this.adminService.readCompanies(idUser).subscribe((data: CompaniesResponse) => {
        this.companies = data.companies;
      });
    }
  }

  attachCompany(company: Company) {
    this.adminService.attachCompany(company);
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
    this.companiesSubscription.unsubscribe();
  }

}
