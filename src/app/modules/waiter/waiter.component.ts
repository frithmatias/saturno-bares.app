import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoginService } from 'src/app/services/login.service';
import { PublicService } from '../public/public.service';
import { Router } from '@angular/router';
import { MatDrawer } from '@angular/material/sidenav';
import { WebsocketService } from '../../services/websocket.service';
import { NotificationsResponse } from '../../interfaces/notification.interface';

@Component({
  selector: 'app-waiter',
  templateUrl: './waiter.component.html',
  styleUrls: ['./waiter.component.css']
})
export class WaiterComponent implements OnInit {

  updateUserSub: Subscription; // system messages for user updates
  idUser: string;
  
  constructor(
    public loginService: LoginService,
    private publicService: PublicService,
    private wsService: WebsocketService,
    private router: Router
  ) { }

  ngOnInit(): void {

    this.idUser = this.loginService.user._id;
    this.readNotifications(this.idUser);

    // subscription messages to admin for update user
    this.updateUserSub = this.wsService.updateUser().subscribe((data)=>{
      this.readNotifications(this.idUser);
     })  

  }

  readNotifications(idOwner: string){
    this.publicService.readNotifications(idOwner).subscribe((data: NotificationsResponse) => {
      // notifications for waiter (user)
      this.loginService.notifications = this.loginService.notifications.filter(notif => !notif.id_owner.includes(idOwner))
      this.loginService.notifications.push(...data.notifications);
    });
  }

  toggle(htmlRef: MatDrawer): void {
    htmlRef.toggle();
  }
  
  setTheme(theme: string){
    let cssLink = <HTMLLinkElement>document.getElementById('themeAsset');
    cssLink.href = `./assets/css/themes/${theme}`;
  }



}
