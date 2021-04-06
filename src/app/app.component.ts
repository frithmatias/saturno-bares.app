import { Component } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav/drawer';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  opened: boolean;
  unreadMessages: number;
  url: string = '';

  constructor(
    public router: Router
  ) {
    let hours = new Date().getHours();
    const theme = (hours >= 6 && hours < 19) ? 'grey-orange.css' : 'dark-pink.css';
    let cssLink = <HTMLLinkElement>document.getElementById('themeAsset');
    cssLink.href = `../../../assets/css/themes/${theme}`;
  }

  ngOnInit(): void {
    this.router.events.pipe(
      filter(evento => evento instanceof NavigationEnd),
      // filter((evento: ActivationEnd) => evento.snapshot.firstChild === null),
      // map((evento: NavigationEnd ) => {evento})
    ).subscribe((data: NavigationEnd) => {
      this.url = data.url.split('/')[1]; // admin - waiter - (public path)
    });
  }
  
  toggle(htmlRef: MatDrawer): void {
    htmlRef.toggle();
  }
  
}

