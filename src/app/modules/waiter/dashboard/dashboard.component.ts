import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';

// libraries
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

// services
import { MetricsService } from '../../../modules/metrics/metrics.service';
import { LoginService } from '../../../services/login.service';

// interfaces
import { MetricResponse, Metrics, MetricsResponse } from '../../../interfaces/metric.interface';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  loading = false;
  metrics: Metrics = { total: 0, avg: 0, tickets: [] };
  date: Date = new Date();

  constructor(
    private MetricsService: MetricsService,
    private loginService: LoginService
  ) { }

  ngOnInit(): void {
    let hoy = new Date().setHours(0,0,0,0);
    this.getMetrics(hoy);
  }

  setDate(e: MatDatepickerInputEvent<Date>): void {
    let fcSel = + new Date(e.value);
    this.date = new Date(fcSel);
    this.getMetrics(fcSel);
  }

  getMetrics(fcSel: number) {
    this.loading = true;
    let idUser = this.loginService.user._id;
    this.MetricsService.getUserMetrics(fcSel, idUser).subscribe((data: MetricResponse) => {
      this.metrics = data.metric;
      this.loading = false;
    }, () => { this.loading = false; })
  }
}
