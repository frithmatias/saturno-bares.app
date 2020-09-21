import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/interfaces/user.interface';
import { Subscription } from 'rxjs';
import { PublicService } from 'src/app/modules/public/public.service';
import { LoginService } from '../../services/login.service';
import { AssistantService } from '../../modules/assistant/assistant.service';

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
  user: User;
  userSuscription: Subscription;
  constructor(
    public loginService: LoginService,
    public assistantService: AssistantService,
    public publicService: PublicService,
    public router: Router
    ) { }

  ngOnInit(): void { 
    this.user = this.loginService.user;
    this.userSuscription = this.loginService.user$.subscribe(data => {
      this.user = data;
    })
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

  ngOnDestroy(): void {
    this.userSuscription.unsubscribe();
  }
}
