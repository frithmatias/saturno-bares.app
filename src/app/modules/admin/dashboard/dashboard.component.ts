import { Component, OnInit } from '@angular/core';
import moment from 'moment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    // this._adapter.setLocale('es');
  }

}
