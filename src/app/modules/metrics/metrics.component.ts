import { Component, OnInit } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
  selector: 'app-metrics',
  templateUrl: './metrics.component.html',
  styleUrls: ['./metrics.component.css']
})
export class MetricsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  toggle(htmlRef: MatDrawer): void {
    htmlRef.toggle();
  }
  
}
