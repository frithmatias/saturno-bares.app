import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import * as moment from 'moment';
import { PublicService } from '../../../public/public.service';
import { AdminService } from '../../admin.service';
import { Settings } from 'src/app/interfaces/settings.interface';
import { SettingsResponse } from '../../../../interfaces/settings.interface';
import { IntervalToHmPipe } from '../../../../pipes/interval-to-hm.pipe';


interface interval {
interval?: number;
local_code?: number;
local_hr?: number;
local_min?: number;
local_str?: string;
mins?: number;
oclock?: boolean;
utc_code?: number;
utc_date?: Date;
utc_hr?: number;
utc_min?: number;
utc_str?: string;
}

// interval: 45
// local_code: 2230
// local_hr: 22
// local_min: 30
// local_str: "22:30"
// mins: 1350
// oclock: false
// utc_code: 130
// utc_date: Sat Mar 13 2021 22:30:00 GMT-0300 (hora estándar de Argentina) {}
// utc_hr: 1
// utc_min: 30
// utc_str: "01:30"

@Component({
  selector: 'app-working',
  templateUrl: './working.component.html',
  styleUrls: ['./working.component.css']
})
export class WorkingComponent implements OnInit {

  @Input() nomargin: boolean;
  @Input() nopadding: boolean;
  @Output() canContinue: EventEmitter<boolean> = new EventEmitter();

  saveDisabled = true;
  allIntervals: interval[] = [];
  allWeekDays: any[] = [];
  allSelected = false;
  lastDaySelected: number;
  lastIntervalSelected: number;

  constructor(
    public publicService: PublicService,
    public adminService: AdminService,
    private intervalToHm: IntervalToHmPipe
  ) { }

  ngOnInit(): void {
    // set all intervals 
    const intervals = [...Array(48).keys()]; // 0-23 
    const now = new Date();
    intervals.forEach(interval => {
      const int: interval = this.intervalToHm.transform(interval);
      this.allIntervals.push(int);
    })

    // set all days
    const days = [...Array(7).keys()]; // 0-6 
    days.forEach(day => {
      this.allWeekDays.push({ str: moment().day(day).format("dddd").toString(), int: day });
    })
    
  }

  selectAllWeekDays(interval: interval) {
    this.saveDisabled = false;
    this.canContinue.emit(false);


    if (interval.utc_code !== this.lastIntervalSelected) {
      if (this.publicService.settings.tm_working[0].includes(interval.utc_code)) {
        this.allSelected = true;
      } else {
        this.allSelected = false;
      }
    }

    if (this.allSelected === false) {
      this.lastIntervalSelected = interval.utc_code;
      this.allWeekDays.forEach(d => this.publicService.settings.tm_working[d.int].push(interval.utc_code));
      this.allSelected = true;
    } else {
      this.allWeekDays.forEach(d => this.publicService.settings.tm_working[d.int] = this.publicService.settings.tm_working[d.int].filter(i => i !== interval.utc_code));
      this.allSelected = false;
    }

  }

  selectAllIntervals(day: any) {
    this.saveDisabled = false;
    this.canContinue.emit(false);

    if (day.int !== this.lastDaySelected) {
      if (this.publicService.settings.tm_working[day.int].length === 24) {
        this.allSelected = true;
      } else {
        this.allSelected = false
      }
    }

    if (this.allSelected === false) {
      this.lastDaySelected = day.int;
      this.publicService.settings.tm_working[day.int] = [];
      this.allIntervals.forEach(i => this.publicService.settings.tm_working[day.int] = [...this.publicService.settings.tm_working[day.int], i.utc_code]);
      this.allSelected = true;
    } else {
      this.publicService.settings.tm_working[day.int] = [];
      this.allSelected = false;
    }
  }

  selectCell(interval: interval, day: any) {
    this.saveDisabled = false;
    this.canContinue.emit(false);
    this.publicService.settings.tm_working[day.int] = this.publicService.settings.tm_working[day.int]?.includes(interval.utc_code) ? this.publicService.settings.tm_working[day.int].filter(i => i !== interval.utc_code) : [...this.publicService.settings.tm_working[day.int], interval.utc_code];
  }

  updateSettings() {
    this.publicService.settings.tm_working = [...this.publicService.settings.tm_working];
    this.adminService.updateSettings(this.publicService.settings).subscribe((data: SettingsResponse) => {
      if (data.ok) {
        this.publicService.settings = Object.assign({}, data.settings);
        this.publicService.settings = data.settings;
        this.saveDisabled = true;
        this.canContinue.emit(true);
        this.publicService.snack(data.msg, 2000);
      }
    })
  }

}
