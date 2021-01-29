import { Component, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';
import { PublicService } from '../../public/public.service';
import { Table } from '../../../interfaces/table.interface';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Ticket } from 'src/app/interfaces/ticket.interface';
import { LoginService } from '../../../services/login.service';




@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit {

  table: Table;
  tables: Table[];

  availabilityGrid: availabilityCompatible[] | availability = [];
  idSection = new FormControl();
  dtReserve = new FormControl();


  scheduleForm: FormGroup;
  minDate: Date;
  maxDate: Date;

  availability: availability[] = [];
  pending: Ticket[] = [];


  constructor(
    public publicService: PublicService,
    public adminService: AdminService,
    public loginService: LoginService
  ) { }

  myFilter = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    // Prevent Saturday and Sunday from being selected.
    return day !== 0 && day !== 6;
  }

  ngOnInit(): void {


    this.scheduleForm = new FormGroup({
      idSection: new FormControl('', [Validators.required]),
      dtReserve: new FormControl(new Date(), [Validators.required])
    });

    this.scheduleForm.valueChanges.subscribe((data) => {
      if (data.idSection && data.dtReserve) {
        this.tables = this.adminService.tables.filter(table => table.id_section === data.idSection);
        this.readAvailability(); // trae los tickets 'scheduled' y 'waiting' por intervalo
      }
    })
  }

  selectTable = (table: Table) => {
    this.table = table;
  };

  readAvailability() {

    this.availability = [];
    const nmPersons = 5000; // high value for availability response
    const idSection = this.scheduleForm.value.idSection;
    const dtReserve = this.scheduleForm.value.dtReserve;

    this.publicService.readPending(idSection, dtReserve).subscribe((data: any) => {
      this.pending = data.pending;
    })

    this.publicService.readAvailability(nmPersons, idSection, dtReserve).subscribe((data: availabilityResponse) => {

      
      data.availability.map(av => {
        this.availability.push({interval: new Date(av.interval).getHours(), tables: av.tables, capacity: av.capacity});
      });

    })

  }


  pendingUpdated(pending: Ticket[]): void {
    this.pending = pending;
    this.readAvailability(); // actualizo la disponibilidad
  }
}


interface availabilityCompatible {
  interval: number;
  capacity: number;
  tables: number[]
}

interface availability {
  interval: number;
  capacity: number;
  tables: { nmTable: number, nmPersons: number }[];
}


interface availabilityResponse {
  ok: boolean;
  msg: string;
  availability: availability[];
}


