import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { AdminService } from '../../modules/admin/admin.service';
import { Company } from '../../interfaces/company.interface';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent implements OnInit {
  
  @Output() toggleSideNav: EventEmitter<boolean> = new EventEmitter();
  events: string[] = [];
  opened: boolean;

  constructor(
    public adminService: AdminService,
    public loginService: LoginService
  ) { }

  ngOnInit(): void {}

  attachCompany(company: Company) {
    this.adminService.attachCompany(company);
  }

  toggleNav(): void {
    this.toggleSideNav.emit(true);
  }

}
