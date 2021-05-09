import { Component, Input, OnInit } from '@angular/core';
import { Notification } from '../../../interfaces/notification.interface';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {

  @Input() notifications: Notification[] = [];

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes){
    this.notifications = this.notifications.sort((b, a) => +new Date(a.tm_notification) - +new Date(b.tm_notification));
  }
}
