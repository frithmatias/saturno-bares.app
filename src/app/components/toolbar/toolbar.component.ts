import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LoginService } from '../../services/login.service';
import { PublicService } from '../../modules/public/public.service';
import { environment } from '../../../environments/environment.prod';
import { WaiterService } from '../../modules/waiter/waiter.service';
import { AdminService } from '../../modules/admin/admin.service';
import { CompanyResponse, Company } from '../../interfaces/company.interface';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Notification } from '../../interfaces/notification.interface';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {

  @Output() toggleSideNav: EventEmitter<boolean> = new EventEmitter();
  @Input() notifications: Notification[] = [];

  version = environment.version;
  
  module: string;
  component: string;
  company: Company;

  constructor(
    public adminService: AdminService,
    public waiterService: WaiterService,
    public loginService: LoginService,
    public publicService: PublicService,
    public router: Router
  ) { }

  ngOnInit(): void {
    
    this.module = this.publicService.urlModule;
    this.component = this.publicService.urlComponent;

    if (localStorage.getItem('company')) {
      this.company = JSON.parse(localStorage.getItem('company'));
    }

  }

  toggle(): void {
    this.toggleSideNav.emit(true);
  }

  themeSelected(theme: string) {
    const idCompany = this.loginService.user.id_company._id || null;
    if (idCompany) {
      this.adminService.updateTheme(idCompany, theme).subscribe((data: CompanyResponse) => {
        this.publicService.snack(data.msg, 3000);
        this.loginService.user.id_company.tx_theme = theme;
        this.loginService.pushUser(this.loginService.user);
      })
    }
  }

  scrollToElement(): void {
    // browser autorizado para preguntar posición al usuario
    this.publicService.canAksPositionUser = true;
    const elem = document.getElementById('home-map-container');
    elem?.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
  }

}
