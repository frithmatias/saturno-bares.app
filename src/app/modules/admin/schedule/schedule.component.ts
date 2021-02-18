import { Component, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';
import { PublicService } from '../../public/public.service';
import { Table } from '../../../interfaces/table.interface';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Ticket } from 'src/app/interfaces/ticket.interface';
import { LoginService } from '../../../services/login.service';
import { availabilityResponse, availability } from '../../../interfaces/availability.interface';
import { MatCalendarCellClassFunction } from '@angular/material/datepicker';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ScheduleComponent implements OnInit {


  scheduleForm: FormGroup;
  minDate: Date;
  maxDate: Date;

  availability: availability[] = [];
  tables: Table[] = [];
  pendingMonth: Ticket[] = [];
  pending: Ticket[] = [];
  idSection: string;
  dtSelected: Date;

  dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
    if (view === 'month') {
      const date = cellDate.getDate();
      return this.pendingMonth.filter(ticket => new Date(ticket.tm_reserve).getDate() === date).length > 0 ? 'tickets-pending-class' : '';
    }
    return '';
  }

  constructor(
    public publicService: PublicService,
    public adminService: AdminService,
    public loginService: LoginService,
  ) { }

  myFilter = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    // Prevent Saturday and Sunday from being selected.
    // return day !== 0 && day !== 6;
    return true;
  }

  ngOnInit(): void {


    this.scheduleForm = new FormGroup({
      idSection: new FormControl('', [Validators.required]),
      dtSelected: new FormControl('', [Validators.required])
    });

    this.scheduleForm.valueChanges.subscribe((data) => {
      if (data.idSection && data.dtSelected) {
        this.tables = this.adminService.tables.filter(table => table.id_section === data.idSection);
        this.idSection = data.idSection;
        this.dtSelected = data.dtSelected;
        this.getPendingsThisDaySector();
        this.readAvailability(); // trae los tickets 'scheduled' y 'waiting' por intervalo
      }
    })


    this.readPendings();

  }

  readAvailability() {
    this.availability = [];
    const nmPersons = 5000; // high value for availability response
    const idSection = this.scheduleForm.value.idSection;
    const dtSelected = this.scheduleForm.value.dtSelected;
    this.publicService.readAvailability(nmPersons, idSection, dtSelected).subscribe((data: availabilityResponse) => {
      this.availability = data.availability;
      // data.availability.map(av => {
      //   this.availability.push({ interval: new Date(av.interval).getHours(), tables: av.tables, capacity: av.capacity });
      // });
    })

  }


  readPendings() {
    const idCompany = this.loginService.user.id_company._id;
    const idYear = new Date().getFullYear();
    const idMonth = new Date().getMonth();
    this.publicService.readPending(idCompany, idYear, idMonth).subscribe((data: any) => {
      this.pendingMonth = data.pending;
      this.getPendingsThisDaySector();
      })
  }

  getPendingsThisDaySector(){
    this.pending = this.pendingMonth.filter(ticket => {
      return new Date(ticket.tm_reserve).getDate() === new Date(this.dtSelected).getDate() && ticket.id_section._id === this.idSection;
    });

  }

  pendingUpdated(pending: Ticket): void {
    this.publicService.snack(`Las mesas ${pending.cd_tables} fueron asignadas correctamente`, 2000, 'Aceptar');
    this.readAvailability(); // actualizo la disponibilidad
    this.readPendings();
  }



}




