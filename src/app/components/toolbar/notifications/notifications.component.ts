import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Notification } from '../../../interfaces/notification.interface';
import { LoginService } from '../../../services/login.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {

  @Input() notifications: Notification[] = [];
  timerSub: Subscription;
  notificationsNotRead: Notification[];
  idUser: string;

  constructor(
    private loginService: LoginService
  ) { }

  ngOnInit(): void {

  }

  ngOnChanges(changes) {
    console.log(changes)
    this.idUser = this.loginService.user._id;
    this.notificationsNotRead = this.notifications.filter(notif => !notif.id_read.includes(this.idUser));
    this.notifications = this.notifications.sort((b, a) => +new Date(a.tm_notification) - +new Date(b.tm_notification));

  }

  menuOpened() {
    this.notificationsNotRead = this.notifications.filter(notif => !notif.id_read.includes(this.idUser));
    const idNotifications: string[] = [];

    for (let notif of this.notifications) {
      if (!notif.id_read.includes(this.idUser)) {
        idNotifications.push(notif._id);  // send idNotifications to db to update all as read
      }
    }

  }

  setReaded(notif: Notification) {
    notif.id_read.push(this.idUser); // readed
    this.loginService.updateNotificationRead(notif._id, this.idUser).subscribe(data => {
      this.notificationsNotRead = this.notifications.filter(notif => !notif.id_read.includes(this.idUser));
    })
  }

}
