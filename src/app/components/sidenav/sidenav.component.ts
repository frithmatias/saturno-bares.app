import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { AdminService } from '../../modules/admin/admin.service';
import { Company } from '../../interfaces/company.interface';
import { User } from '../../interfaces/user.interface';
import { Subscription } from 'rxjs';
import { LoginService } from '../../services/login.service';
import { CompaniesResponse } from 'src/app/interfaces/company.interface';

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
    this.userSubscription = this.loginService.user$.subscribe((user: User) => {
      if (user?._id) {
        let idUser = user._id;
        this.adminService.readCompanies(idUser).subscribe((data: CompaniesResponse) => {
          this.adminService.companies = data.companies;
        });
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
