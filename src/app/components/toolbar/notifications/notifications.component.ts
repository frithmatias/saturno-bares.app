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

}
