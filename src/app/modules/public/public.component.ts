import { Component, OnInit } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { PublicService } from './public.service';

@Component({
  selector: 'app-public',
  templateUrl: './public.component.html',
  styleUrls: ['./public.component.css']
})
export class PublicComponent implements OnInit {
  opened: boolean;
  unreadMessages: number;
  constructor(
    public publicService: PublicService
  ) { }

  ngOnInit(): void { }

  toggle(htmlRef: MatSidenav): void {
    htmlRef.toggle();
  }
}
