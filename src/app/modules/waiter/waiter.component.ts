import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoginService } from 'src/app/services/login.service';
import { MatDrawer } from '@angular/material/sidenav';
import { WebsocketService } from '../../services/websocket.service';
import { NotificationsResponse } from '../../interfaces/notification.interface';

@Component({
  selector: 'app-waiter',
  templateUrl: './waiter.component.html',
  styleUrls: ['./waiter.component.css']
})
export class WaiterComponent implements OnInit, OnDestroy {

  updateUserSub: Subscription; // system messages for user updates
  idUser: string;
  
  constructor(
    public loginService: LoginService,
    private wsService: WebsocketService
  ) { }

  ngOnInit(): void {

    const txTheme = this.loginService.user.id_company?.tx_theme;
    if (txTheme) this.setTheme(txTheme);
    
    this.idUser = this.loginService.user._id;
    this.readNotifications(this.idUser);

    // subscription messages to admin for update user
    this.updateUserSub = this.wsService.updateUser().subscribe((data)=>{
      this.readNotifications(this.idUser);
     })  

  }

  readNotifications(idOwner: string){
    this.loginService.readNotifications(idOwner).subscribe((data: NotificationsResponse) => {
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

  ngOnDestroy(): void {
    this.updateUserSub?.unsubscribe(); 
  }

}
