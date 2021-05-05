import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { LoginService } from '../../services/login.service';
import { PublicService } from '../../modules/public/public.service';
import { environment } from '../../../environments/environment.prod';
import { WaiterService } from '../../modules/waiter/waiter.service';
import { AdminService } from '../../modules/admin/admin.service';
import { CompanyResponse } from '../../interfaces/company.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {

  @Output() toggleSideNav: EventEmitter<boolean> = new EventEmitter();

  version = environment.version;
  publicHomePage: boolean;

  constructor(
    public adminService: AdminService,
    public waiterService: WaiterService,
    public loginService: LoginService,
    public publicService: PublicService,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.publicHomePage = this.publicService.urlComponent === 'page' ? true : false;
    if (localStorage.getItem('customer')) {
      this.publicService.customer = JSON.parse(localStorage.getItem('customer'));
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
      })
    }
  }

  scrollToElement(): void {
    // browser autorizado para preguntar posición al usuario
    this.publicService.canAksPositionUser = true;
    const elem = document.getElementById('home-map-container');
    elem?.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
  }


  salir() {
    this.publicService.clearPublicSession();
    this.router.navigate(['/home']);
  }

}
