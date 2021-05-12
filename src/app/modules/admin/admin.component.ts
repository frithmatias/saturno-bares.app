import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, Subscription } from 'rxjs';
import { AdminService } from './admin.service';
import { LoginService } from '../../services/login.service';
import { WaiterService } from '../waiter/waiter.service';
import { PublicService } from '../public/public.service';
import { MatDrawer } from '@angular/material/sidenav';
import { CompaniesResponse } from 'src/app/interfaces/company.interface';
import { WebsocketService } from '../../services/websocket.service';
import { NotificationsResponse } from '../../interfaces/notification.interface';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {

  changeUserSub: Subscription; // user changes
  updateUserSub: Subscription; // system messages for user updates
  updateAdminSub: Subscription; // system messages for admin updates

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

    const txTheme = this.loginService.user.id_company?.tx_theme;
    if (txTheme) this.setTheme(txTheme);
    this.readNotifications(this.idUser);

    if (this.idCompany) {
      this.readNotifications(this.idCompany);
      this.readCompanyData(this.idCompany);
    } else {
      this.adminService.readCompanies(this.idUser).subscribe((data: CompaniesResponse) => {
        this.adminService.companies = data.companies;
      })
    }

    // subscription user changes 
    this.changeUserSub = this.loginService.user$.subscribe(user => {
      if (user) {
        const txTheme = user.id_company?.tx_theme;
        if (txTheme) this.setTheme(txTheme);
      }
      this.idCompany = user?.id_company?._id;
      if (this.idCompany) {
        this.readCompanyData(this.idCompany);
      }
    });

    // subscription to user messages
    this.updateUserSub = this.wsService.updateUser().subscribe((data) => {
      this.readNotifications(this.idUser);
    })

    // subscription to company messages
    this.updateAdminSub = this.wsService.updateAdmin().subscribe((data) => {
      this.readNotifications(this.idCompany);
    })


  }

  setTheme(theme: string) {
    let cssLink = <HTMLLinkElement>document.getElementById('themeAsset');
    cssLink.href = `./assets/css/themes/${theme}`;
  }


  readNotifications(idOwner: string) {
    this.loginService.readNotifications(idOwner).subscribe((data: NotificationsResponse) => {
      // remove old notifications for this owner
      this.loginService.notifications = this.loginService.notifications.filter(notification => !notification.id_owner.includes(idOwner))
      // add remaining (user) + new notifications for this owner
      this.loginService.notifications = [...this.loginService.notifications, ...data.notifications];
    });
  }

  readCompanyData(idCompany: string) {
    this.adminService.loading = true;
    this.wsService.emit('enterCompany', idCompany)
    const companies$ = this.adminService.readCompanies(this.idUser);
    const sections$ = this.publicService.readSections(idCompany);
    const tables$ = this.waiterService.readTables(idCompany);
    const scoreItems$ = this.adminService.readScoreItems(idCompany);
    const settings$ = this.publicService.readSettings(idCompany);

    forkJoin({
      companiesResponse: companies$,
      sectionsResponse: sections$,
      tablesResponse: tables$,
      scoreitemsResponse: scoreItems$,
      settingsResponse: settings$
    }).subscribe((data: any) => {

      // set companies
      this.adminService.companies = data.companiesResponse.companies;

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
    this.changeUserSub?.unsubscribe();
    this.updateUserSub?.unsubscribe();
    this.updateAdminSub?.unsubscribe();
  }
}
