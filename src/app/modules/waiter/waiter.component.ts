import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoginService } from 'src/app/services/login.service';
import { PublicService } from '../public/public.service';
import { Router } from '@angular/router';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
  selector: 'app-waiter',
  templateUrl: './waiter.component.html',
  styleUrls: ['./waiter.component.css']
})
export class WaiterComponent implements OnInit {
  userSubscription: Subscription;

  constructor(
    private loginService: LoginService,
    private router: Router
  ) { }

  ngOnInit(): void {



    this.userSubscription = this.loginService.user$.subscribe(user => {
      // if company changes set the theme
      if(user){
        const txTheme = user.id_company?.tx_theme;
        if(txTheme) this.setTheme(txTheme);
        this.router.navigate(['/waiter/home']);
      }
    })

  }

  toggle(htmlRef: MatDrawer): void {
    htmlRef.toggle();
  }
  
  setTheme(theme: string){
    let cssLink = <HTMLLinkElement>document.getElementById('themeAsset');
    cssLink.href = `./assets/css/themes/${theme}`;
  }



}
