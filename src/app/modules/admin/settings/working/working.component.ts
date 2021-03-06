import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import * as moment from 'moment';
import { PublicService } from '../../../public/public.service';
import { AdminService } from '../../admin.service';
import { Settings } from 'src/app/interfaces/settings.interface';
import { SettingsResponse } from '../../../../interfaces/settings.interface';


interface interval {
  str: string;
  int: number;
  utc: number;
}

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

  ) { }

  ngOnInit(): void {
    // set all intervals 
    const intervals = [...Array(24).keys()]; // 0-23 
    const now = new Date();
    intervals.forEach(interval => {
      let utcHours = new Date(now.getFullYear(), now.getMonth(), now.getDate(), interval).getUTCHours();
      this.allIntervals.push({ str: interval.toString() + ':00', int: interval, utc: utcHours });
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

    if (interval.int !== this.lastIntervalSelected) {
      if (this.publicService.settings.tm_working[0].includes(interval.utc)) {
        this.allSelected = true;
      } else {
        this.allSelected = false;
      }
    }

    if (this.allSelected === false) {
      this.lastIntervalSelected = interval.int;
      this.allWeekDays.forEach(d => this.publicService.settings.tm_working[d.int].push(interval.utc));
      this.allSelected = true;
    } else {
      this.allWeekDays.forEach(d => this.publicService.settings.tm_working[d.int] = this.publicService.settings.tm_working[d.int].filter(i => i !== interval.utc));
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
      this.allIntervals.forEach(i => this.publicService.settings.tm_working[day.int] = [...this.publicService.settings.tm_working[day.int], i.utc]);
      this.allSelected = true;
    } else {
      this.publicService.settings.tm_working[day.int] = [];
      this.allSelected = false;
    }
  }

  selectCell(interval: interval, day: any) {
    this.saveDisabled = false;
    this.canContinue.emit(false);
    this.publicService.settings.tm_working[day.int] = this.publicService.settings.tm_working[day.int]?.includes(interval.utc) ? this.publicService.settings.tm_working[day.int].filter(i => i !== interval.utc) : [...this.publicService.settings.tm_working[day.int], interval.utc];
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
