import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { PublicService } from 'src/app/modules/public/public.service';
import { LoginService } from '../../../services/login.service';
import { WaiterService } from '../../waiter/waiter.service';
import { filter } from 'rxjs/operators';
import { environment } from 'src/environments/environment.prod';

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
  version = environment.version;

  constructor(
    public loginService: LoginService,
    public waiterService: WaiterService,
    public publicService: PublicService,
    public router: Router
  ) { }

  ngOnInit(): void { }

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

}
