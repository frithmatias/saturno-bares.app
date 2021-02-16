import { Component, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';
import { PublicService } from '../../public/public.service';
import { Table } from '../../../interfaces/table.interface';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Ticket } from 'src/app/interfaces/ticket.interface';
import { LoginService } from '../../../services/login.service';
import { availabilityResponse, availability } from '../../../interfaces/availability.interface';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit {
  
  
  scheduleForm: FormGroup;
  minDate: Date;
  maxDate: Date;
  
  availability: availability[] = [];
  tables: Table[] = [];
  pending: Ticket[] = [];
  idSection: string;
  dtSelected: Date;

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
        this.readAvailability(); // trae los tickets 'scheduled' y 'waiting' por intervalo
      }
    })
  }

  readAvailability() {

    this.availability = [];
    const nmPersons = 5000; // high value for availability response
    const idSection = this.scheduleForm.value.idSection;
    const dtSelected = this.scheduleForm.value.dtSelected;

    this.publicService.readPending(idSection, dtSelected).subscribe((data: any) => {
      this.pending = data.pending;
    })

    this.publicService.readAvailability(nmPersons, idSection, dtSelected).subscribe((data: availabilityResponse) => {
      this.availability = data.availability;
      // data.availability.map(av => {
      //   this.availability.push({ interval: new Date(av.interval).getHours(), tables: av.tables, capacity: av.capacity });
      // });
    })

  }





  pendingUpdated(pending: Ticket): void {
    this.publicService.snack(`Las mesas ${pending.cd_tables} fueron asignadas correctamente`, 2000, 'Aceptar');
    this.readAvailability(); // actualizo la disponibilidad
  }



}




