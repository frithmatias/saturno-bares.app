import { Component, OnInit, Input } from '@angular/core';
import { LoginService } from '../../../services/login.service';
import { PublicService } from '../../../modules/public/public.service';
import { Router } from '@angular/router';
import { AdminService } from '../../../modules/admin/admin.service';
import { WaiterService } from '../../../modules/waiter/waiter.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  @Input() showname: boolean = false;

  login: string; // si no esta logueado define el tipo company ó public según la página en la que se encuentra <app-user>
  role: string; // si esta logueado define user o customer, si ingresó desde el login público o comercio
  showlogin: boolean;

  constructor(
    public loginService: LoginService,
    private adminService: AdminService,
    public waiterService: WaiterService,
    public publicService: PublicService,
    public router: Router
  ) { }

  ngOnInit(): void {


    if (localStorage.getItem('role')) {
      this.loginService.role = localStorage.getItem('role'); // customer || user
    }

    this.login = ['public', 'embed'].includes(this.publicService.urlModule) ? 'public' : 'company';

    // muestro el login si no se corresponde el tipo con el rol del usuario 
    // si debe mostrarse el login tipo company y usuario se logueó como customer 
    // o si debe mostrarse el login tipo public y el usuario se logueó como user 
    this.showlogin = !this.loginService.role || ((this.login === 'company' && this.loginService.role === 'customer') || (this.login === 'public' && this.loginService.role === 'user')) ? true : false;

  }


  logout() {
    this.publicService.logout();
    this.waiterService.logout();
    this.adminService.logout();
    this.loginService.logout();
  }

}
