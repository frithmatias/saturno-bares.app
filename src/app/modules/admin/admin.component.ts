import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AdminService } from './admin.service';
import { LoginService } from '../../services/login.service';
import { WaiterService } from '../waiter/waiter.service';
import { Table } from 'src/app/interfaces/table.interface';
import { TablesResponse } from '../../interfaces/table.interface';
import { PublicService } from '../public/public.service';
import { SectionsResponse } from '../../interfaces/section.interface';
import { ScoreItemsResponse } from '../../interfaces/score.interface';
import { SettingsResponse } from 'src/app/interfaces/settings.interface';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {

  userSubscription: Subscription;

  constructor(
    private adminService: AdminService,
    private waiterService: WaiterService,
    private publicService: PublicService,
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
    
    this.waiterService.readTables(idCompany).subscribe((data: TablesResponse) => {
      this.adminService.tables = data.tables;
			this.adminService.tablesSection = data.tables;
    })

    this.publicService.readSections(idCompany).subscribe((data: SectionsResponse) => {
      if(data.ok){
        this.adminService.sections = data.sections;
        for (let section of data.sections) {
          this.adminService.sectionsMap.set(section._id, section.tx_section);
        }
      }
    })

    this.adminService.readScoreItems(idCompany).subscribe((data: ScoreItemsResponse) => {
      this.adminService.scoreItems = data.scoreitems;
			this.adminService.scoreItemsSection = data.scoreitems;
    })

    this.publicService.readSettings(idCompany).subscribe((data: SettingsResponse) => {
      this.publicService.settings = data.settings;
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }
}
