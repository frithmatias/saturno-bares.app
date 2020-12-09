import { Component, OnInit } from '@angular/core';
import { Section } from 'src/app/interfaces/section.interface';
import { Subscription } from 'rxjs';
import { AdminService } from './admin.service';
import { LoginService } from '../../services/login.service';
import { TablesResponse } from '../../interfaces/table.interface';
import { SectionsResponse } from '../../interfaces/section.interface';
import { CompaniesResponse } from '../../interfaces/company.interface';
@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  userSubscription: Subscription;

  constructor(
    private adminService: AdminService,
    private loginService: LoginService
  ) { }

  ngOnInit(): void {

    let idUser = this.loginService.user._id;
    this.adminService.readCompanies(idUser);

    let idCompany = this.loginService.user.id_company?._id;
    if (idCompany) {
      this.adminService.readTables(idCompany);
      this.adminService.readSections(idCompany);
    }

    this.userSubscription = this.loginService.user$.subscribe(user => {
      if (user) {
        let idCompany = user.id_company._id;
        this.adminService.readTables(idCompany)
        this.adminService.readSections(idCompany)
      }
    });

  }
}
