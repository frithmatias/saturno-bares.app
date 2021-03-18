import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, Subscription } from 'rxjs';
import { AdminService } from './admin.service';
import { LoginService } from '../../services/login.service';
import { WaiterService } from '../waiter/waiter.service';
import { PublicService } from '../public/public.service';

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
    
    if(!idCompany) {
      this.adminService.loading = false;
      return;
    } else {
      this.adminService.loading = true;
    }
    
    
    let idUser = this.loginService.user._id;
    const companies$ = this.adminService.readCompanies(idUser)
    const sections$ = this.publicService.readSections(idCompany)
    const tables$ = this.waiterService.readTables(idCompany)
    const scoreItems$ = this.adminService.readScoreItems(idCompany)
    const settings$ = this.publicService.readSettings(idCompany)

    forkJoin({
      companiesResponse: companies$,
      sectionsResponse: sections$,
      tablesResponse: tables$,
      scoreitemsResponse: scoreItems$,
      settingsResponse: settings$
    })
      .subscribe((data: any) => {

        // set companies
        this.adminService.companies = data.companiesResponse.companies;

        // set sections and sectionsMap
        this.adminService.sections = data.sectionsResponse.sections;
        for (let section of data.sectionsResponse.sections) {
          this.adminService.sectionsMap.set(section._id, section.tx_section);
        }

        // set tables
        this.adminService.tables = data.tablesResponse.tables;
        this.adminService.tablesSection = data.tablesResponse.tables;

        // set score items
        this.adminService.scoreItems = data.scoreitemsResponse.scoreitems;
        this.adminService.scoreItemsSection = data.scoreitemsResponse.scoreitems;

        //set settings and working hours
        this.publicService.settings = data.settingsResponse.settings;
        if (this.publicService.settings.tm_working.length === 0) {
          this.publicService.settings.tm_working = [[], [], [], [], [], [], []]; //7 days of week
        }

        this.adminService.loading = false;
      })

  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }
}
