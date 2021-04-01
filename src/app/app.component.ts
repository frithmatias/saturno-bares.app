import { Component } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav/drawer';
import { LoginService } from './services/login.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  opened: boolean;
  unreadMessages: number;
  constructor(public loginService: LoginService) {
    // set day/night theme
    let hours = new Date().getHours();
    const theme = (hours >= 6 && hours < 20) ? 'light-blue.css' : 'dark-pink.css';
    let cssLink = <HTMLLinkElement>document.getElementById('themeAsset');
    cssLink.href = `./assets/css/themes/${theme}`;
  }

  toggle(htmlRef: MatDrawer): void {
    htmlRef.toggle();
  }
  
}

