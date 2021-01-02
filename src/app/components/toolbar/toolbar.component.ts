import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { Router } from '@angular/router';
import { PublicService } from 'src/app/modules/public/public.service';
import { LoginService } from '../../services/login.service';
import { WaiterService } from '../../modules/waiter/waiter.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
  @Output() toggleSideNav: EventEmitter<boolean> = new EventEmitter();
  @Output() toggleChat: EventEmitter<boolean> = new EventEmitter();
  @Input() unreadMessages: number;
  hiddenBadge: boolean;
  config: any = {};

  constructor(
    public loginService: LoginService,
    public waiterService: WaiterService,
    public publicService: PublicService,
    public router: Router
  ) { }

  ngOnInit(): void {

    if (localStorage.getItem('config')) {
      this.config = JSON.parse(localStorage.getItem('config'));
    }

    if (!this.config.theme) {
      let hours = new Date().getHours();

      if (hours >= 6 && hours < 20) {
        // light theme
        this.config.theme = 'deeppurple-amber.css'
      } else {
        // dark theme
        this.config.theme = 'pink-bluegrey.css';
      }

    }

    let cssLink = <HTMLLinkElement>document.getElementById('themeAsset');
    cssLink.href = `./assets/css/themes/${this.config.theme}`;

  }

  ngOnChanges(changes: any) {
    this.hiddenBadge = false;
  }

  toggle(component: string): void {
    switch (component) {
      case 'sidenav':
        this.toggleSideNav.emit(true);
        break;
      case 'chat':
        this.hiddenBadge = true;
        this.toggleChat.emit(true);
        break;
    }
  }


  changeTheme(theme: string): void {
    let cssLink = <HTMLLinkElement>document.getElementById('themeAsset');
    cssLink.href = `./assets/css/themes/${theme}`;

    if (localStorage.getItem('config')) {
      this.config = JSON.parse(localStorage.getItem('config'));
    }

    this.config.theme = theme;
    localStorage.setItem('config', JSON.stringify(this.config));
  }
}
