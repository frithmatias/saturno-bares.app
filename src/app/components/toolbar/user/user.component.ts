import { Component, OnInit, Input } from '@angular/core';
import { LoginService } from '../../../services/login.service';
import { User } from '../../../interfaces/user.interface';
import { PublicService } from '../../../modules/public/public.service';
import { Router } from '@angular/router';
import { AdminService } from '../../../modules/admin/admin.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  @Input() showname: boolean = false;
  user: User;
  login: string; // si no esta logueado define el tipo company ó public según la página en la que se encuentra <app-user>
  role: string; // si esta logueado define user o customer, si ingresó desde el login público o comercio
  showlogin: boolean;
  constructor(
    public loginService: LoginService,
    private adminService: AdminService,
    public publicService: PublicService,
    public router: Router
  ) { }

  ngOnInit(): void {

    if (this.loginService.user) {
      this.user = this.loginService.user;
      this.role = 'user';
    } else if (localStorage.getItem('user')) {
      this.user = JSON.parse(localStorage.getItem('user'));
      this.role = 'user';

    } else if (this.publicService.customer) {
      this.user = this.publicService.customer;
      this.role = 'customer';

    } else if (localStorage.getItem('customer')) {
      this.user = JSON.parse(localStorage.getItem('customer'))
      this.role = 'customer';

    }

    this.login = ['public', 'embed'].includes(this.publicService.urlModule) ? 'public' : 'company';
    
    // muestro el login si no se corresponde el tipo con el rol del usuario 
    // si debe mostrarse el login tipo company y usuario se logueó como customer 
    // o si debe mostrarse el login tipo public y el usuario se logueó como user 
    this.showlogin = !this.user || ((this.login==='company' && this.role === 'customer') || (this.login === 'public' && this.role === 'user')) ? true : false;

  }


  logout() {

    delete this.user;

    if (localStorage.getItem('customer')) {
      this.publicService.logout();
    }

    if (localStorage.getItem('user')) {

      this.adminService.companies = [];
      this.adminService.sections = [];
      this.adminService.sectionsMap.clear();
      this.adminService.tables = [];
      this.adminService.tablesSection = [];
      this.adminService.waiters = [];
      this.adminService.scoreItems = [];
      this.adminService.scoreItemsSection = [];

      this.loginService.logout();

      }

  }

}
