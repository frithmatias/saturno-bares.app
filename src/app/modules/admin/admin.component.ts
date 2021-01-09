import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class AdminComponent implements OnInit, OnDestroy {

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
      this.readCompanyData(idCompany);
    }

    this.userSubscription = this.loginService.user$.subscribe(user => {
      let idCompany = user?.id_company?._id;
      if (idCompany) {
        this.readCompanyData(idCompany);
      }
    });

  }

  readCompanyData(idCompany: string) {
    this.adminService.readTables(idCompany);
    this.adminService.readSections(idCompany);
    this.adminService.readSettings(idCompany);

  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }
}
