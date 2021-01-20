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
  constructor(public loginService: LoginService) {}
  toggle(htmlRef: MatDrawer ): void {
    htmlRef.toggle();
  }
}

