import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, Subscription } from 'rxjs';
import { AdminService } from './admin.service';
import { LoginService } from '../../services/login.service';
import { WaiterService } from '../waiter/waiter.service';
import { PublicService } from '../public/public.service';
import { MatDrawer } from '@angular/material/sidenav';
import { CompaniesResponse } from 'src/app/interfaces/company.interface';
import { WebsocketService } from '../../services/websocket.service';
import { NotificationsResponse, Notification } from '../../interfaces/notification.interface';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {

  userSubscription: Subscription; // user changes
  adminSubscription: Subscription; // system messages for admin updates
  idUser: string;
  idCompany: string;
  constructor(
    private adminService: AdminService,
    private waiterService: WaiterService,
    private publicService: PublicService,
    public loginService: LoginService,
    private wsService: WebsocketService
  ) { }

  ngOnInit(): void {

    this.idUser = this.loginService.user._id;
    this.idCompany = this.loginService.user.id_company?._id;

    this.readUserNotifications(this.idUser);

    const txTheme = this.loginService.user.id_company?.tx_theme;
    if (txTheme) this.setTheme(txTheme);

    if (this.idCompany) {
      this.readCompanyData(this.idCompany);
    } else {
      this.adminService.readCompanies(this.idUser).subscribe((data: CompaniesResponse) => {
        this.adminService.companies = data.companies;
      })
    }

    this.userSubscription = this.loginService.user$.subscribe(user => {

      // if company changes set the theme
      if (user) {
        const txTheme = user.id_company?.tx_theme;
        if (txTheme) this.setTheme(txTheme);
      }

      this.idCompany = user?.id_company?._id;
      if (this.idCompany) {
        this.readCompanyData(this.idCompany);
      }

    });

    // subscription messages to admin for update user
    this.adminSubscription = this.wsService.updateUser().subscribe((data)=>{
      this.adminService.readNotifications(this.idUser).subscribe((data: NotificationsResponse) => {
        this.loginService.notifications = data.notifications;
      })
     })  


    // subscription messages to admin for update company
    this.adminSubscription = this.wsService.updateAdmin().subscribe((data)=>{
     this.adminService.readNotifications(this.idCompany).subscribe((data: NotificationsResponse) => {
       this.loginService.notifications = data.notifications;
     })
    })  


  }

  setTheme(theme: string) {
    let cssLink = <HTMLLinkElement>document.getElementById('themeAsset');
    cssLink.href = `./assets/css/themes/${theme}`;
  }


  readUserNotifications(idUser: string){
    this.adminService.readNotifications(idUser).subscribe((data: NotificationsResponse) => {
      this.loginService.notifications.push(...data.notifications);
    });
  }

  readCompanyData(idCompany: string) {

    this.wsService.emit('enterCompany', idCompany)
    const companies$ = this.adminService.readCompanies(this.idUser);
    const notificationsAdmin$ = this.adminService.readNotifications(idCompany);
    const sections$ = this.publicService.readSections(idCompany);
    const tables$ = this.waiterService.readTables(idCompany);
    const scoreItems$ = this.adminService.readScoreItems(idCompany);
    const settings$ = this.publicService.readSettings(idCompany);

    forkJoin({
      companiesResponse: companies$,
      notificationsAdminResponse: notificationsAdmin$,
      sectionsResponse: sections$,
      tablesResponse: tables$,
      scoreitemsResponse: scoreItems$,
      settingsResponse: settings$
    }).subscribe((data: any) => {

      // set companies
      this.adminService.companies = data.companiesResponse.companies;
      this.loginService.notifications.push(...data.notificationsAdminResponse.notifications);

      // set sections and sectionsMap
      this.adminService.sections = data.sectionsResponse.sections;

      for (let section of data.sectionsResponse.sections) {
        this.adminService.sectionsMap.set(section._id, section.tx_section);
      }

      this.adminService.tables = data.tablesResponse.tables;
      this.adminService.scoreItems = data.scoreitemsResponse.scoreitems;

      //set settings and working hours
      this.publicService.settings = data.settingsResponse.settings;
      if (this.publicService.settings.tm_working.length === 0) {
        this.publicService.settings.tm_working = [[], [], [], [], [], [], []]; //7 days of week
      }

      this.adminService.loading = false;

    })



  }

  toggle(htmlRef: MatDrawer): void {
    htmlRef.toggle();
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
    this.adminSubscription?.unsubscribe(); 
  }
}
