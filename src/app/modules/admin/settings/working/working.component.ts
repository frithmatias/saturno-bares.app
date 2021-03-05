import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import * as moment from 'moment';
import { PublicService } from '../../../public/public.service';
import { AdminService } from '../../admin.service';
import { Settings } from 'src/app/interfaces/settings.interface';
import { SettingsResponse } from '../../../../interfaces/settings.interface';

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

  allIntervals: any[] = [];
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
    intervals.forEach(interval => {
      this.allIntervals.push({ str: interval.toString() + ':00', int: interval });
    })

    // set all days
    const days = [...Array(7).keys()]; // 0-6 
    days.forEach(day => {
      this.allWeekDays.push({ str: moment().day(day).format("dddd").toString(), int: day });
    })
        
  }

  selectAllWeekDays(interval: any) {
    this.saveDisabled = false;
    this.canContinue.emit(false);

    if (interval.int !== this.lastIntervalSelected) {
      if (this.publicService.settings.tm_working[0].includes(interval.int)) {
        this.allSelected = true;
      } else {
        this.allSelected = false;
      }
    }

    if (this.allSelected === false) {
      this.lastIntervalSelected = interval.int;
      this.allWeekDays.forEach(d => this.publicService.settings.tm_working[d.int].push(interval.int));
      this.allSelected = true;
    } else {
      this.allWeekDays.forEach(d => this.publicService.settings.tm_working[d.int] = this.publicService.settings.tm_working[d.int].filter(i => i !== interval.int));
      this.allSelected = false;
    }

  }

  selectAllIntervals(day: any) {
    this.saveDisabled = false;
    this.canContinue.emit(false);

    if (day.int !== this.lastDaySelected) {
      if (this.publicService.settings.tm_working[day.int].length === 48) {
        this.allSelected = true;
      } else {
        this.allSelected = false
      }
    }

    if (this.allSelected === false) {
      this.lastDaySelected = day.int;
      this.publicService.settings.tm_working[day.int] = [];
      this.allIntervals.forEach(i => this.publicService.settings.tm_working[day.int] = [...this.publicService.settings.tm_working[day.int], i.int]);
      this.allSelected = true;
    } else {
      this.publicService.settings.tm_working[day.int] = [];
      this.allSelected = false;
    }
  }

  selectCell(interval: any, day: any) {
    this.saveDisabled = false;
    this.canContinue.emit(false);
    this.publicService.settings.tm_working[day.int] = this.publicService.settings.tm_working[day.int]?.includes(interval.int) ? this.publicService.settings.tm_working[day.int].filter(i => i !== interval.int) : [...this.publicService.settings.tm_working[day.int], interval.int];
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
