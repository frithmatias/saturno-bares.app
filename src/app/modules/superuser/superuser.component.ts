import { Component, OnInit } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
  selector: 'app-superuser',
  templateUrl: './superuser.component.html',
  styleUrls: ['./superuser.component.css']
})
export class SuperuserComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  toggle(htmlRef: MatDrawer): void {
    htmlRef.toggle();
  }
  

}
