import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
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
  @Output() toggleSideNav: EventEmitter<boolean> = new EventEmitter();
  events: string[] = [];
  opened: boolean;
  userSubscription: Subscription;

  constructor(
    public adminService: AdminService,
    public loginService: LoginService
  ) { }

  ngOnInit(): void {
    if (this.adminService.companies.length === 0 && this.loginService.user) {
      let idUser = this.loginService.user._id;
      this.adminService.readCompanies(idUser);
    }

    this.userSubscription = this.loginService.user$.subscribe((user: User) => {
      if (user?._id) {
        let idUser = user._id;
        this.adminService.readCompanies(idUser);
      }
    });

  }

  attachCompany(company: Company) {
    this.adminService.attachCompany(company);
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  toggleNav(): void {
    this.toggleSideNav.emit(true);
  }

}
