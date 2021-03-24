import { Component, OnInit, OnDestroy } from '@angular/core';
import { AdminService } from '../admin.service';
import { PublicService } from '../../public/public.service';
import { Table } from '../../../interfaces/table.interface';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Ticket } from 'src/app/interfaces/ticket.interface';
import { LoginService } from '../../../services/login.service';
import { availabilityResponse, avInterval } from '../../../interfaces/availability.interface';
import { MatCalendarCellClassFunction } from '@angular/material/datepicker';
import { ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { WebsocketService } from '../../../services/websocket.service';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ScheduleComponent implements OnInit, OnDestroy {


  scheduleForm: FormGroup;
  minDate: Date;
  maxDate: Date;

  availability: avInterval[] = [];
  tables: Table[] = [];
  pendingMonth: Ticket[] = [];
  pendingDate: Ticket[] = [];
  pendingBySectionMap = new Map(); // pendings by sector
  pending: Ticket[] = [];
  idSection: string;
  dtSelected: Date;
  updateSub: Subscription;



  dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
    if (view === 'month') {
      const date = cellDate.getDate();
      return this.pendingMonth.filter(ticket => new Date(ticket.tm_intervals[0]).getDate() === date).length > 0 ? 'tickets-pending-class' : '';
    }
    return '';
  }

  constructor(
    public publicService: PublicService,
    public adminService: AdminService,
    public loginService: LoginService,
    public websocketService: WebsocketService
  ) { 
    const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1);
    // this.minDate = today;
    // this.maxDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); //30 days
  }

  myFilter = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    // Prevent Saturday and Sunday from being selected.
    // return day !== 0 && day !== 6;
    return true;
  }

  ngOnInit(): void {

    this.updateSub = this.websocketService.updateAdmin().subscribe(async () => {
      await this.readAvailability();
    });


    this.scheduleForm = new FormGroup({
      idSection: new FormControl('', [Validators.required]),
      dtSelected: new FormControl('', [Validators.required])
    });

    this.scheduleForm.valueChanges.subscribe((data) => {
      this.idSection = data.idSection;
      this.dtSelected = data.dtSelected;

      if(this.dtSelected){
        this.filterPendingsDate();
      }

      if (this.idSection && this.dtSelected) {
        this.tables = this.adminService.tables.filter(table => table.id_section === data.idSection);
        this.filterPendingsDateSector();
        this.readAvailability(); // trae los tickets 'scheduled' y 'waiting' por intervalo
      }
    })


    this.readPendingsMonth();

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

  readPendingsMonth() {

    if(!this.loginService.user){
      return;
    }
    const idCompany = this.loginService.user.id_company._id;
    const idYear = new Date().getFullYear();
    const idMonth = new Date().getMonth();
    this.adminService.readPending(idCompany, idYear, idMonth).subscribe((data: any) => {
      this.pendingMonth = data.pending;
      this.filterPendingsDateSector();
      this.filterPendingsDate();
    })
  }

  filterPendingsDate(){
    // pendinetes del día seleccionado
    this.pending = this.pendingMonth.filter(ticket => {
      return new Date(ticket.tm_intervals[0]).getDate() === new Date(this.dtSelected).getDate();
    });
    this.adminService.sections.forEach(section => {
      this.pendingBySectionMap.set(section.tx_section, this.pending.filter(pending => pending.id_section.tx_section === section.tx_section).length);
    })
  }

  filterPendingsDateSector() {
    // pendinetes del día seleccionado y el sector seleccionado
    this.pending = this.pendingMonth.filter(ticket => {
      return new Date(ticket.tm_intervals[0]).getDate() === new Date(this.dtSelected).getDate() && ticket.id_section._id === this.idSection;
    });
  }

  pendingUpdated(pending: Ticket): void {
    this.readAvailability(); // actualizo la disponibilidad
    this.readPendingsMonth();
  }

  ngOnDestroy() {
    this.updateSub?.unsubscribe();
  }

}




