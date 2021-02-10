import { Component, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';
import { PublicService } from '../../public/public.service';
import { Table } from '../../../interfaces/table.interface';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Ticket } from 'src/app/interfaces/ticket.interface';
import { LoginService } from '../../../services/login.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { BottomsheetComponent } from './bottomsheet/bottomsheet.component';
import { avTable, availabilityResponse, availability } from '../../../interfaces/availability.interface';




@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit {

  tableSelected: avTable;
  tables: Table[];

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
    public loginService: LoginService,
    private bottomSheet: MatBottomSheet
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
      dtReserve: new FormControl(new Date(), [Validators.required])
    });

    this.scheduleForm.valueChanges.subscribe((data) => {
      if (data.idSection && data.dtReserve) {
        this.tables = this.adminService.tables.filter(table => table.id_section === data.idSection);
        this.readAvailability(); // trae los tickets 'scheduled' y 'waiting' por intervalo
      }
    })
  }



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
        this.availability.push({ interval: new Date(av.interval).getHours(), tables: av.tables, capacity: av.capacity });
      });
    })

  }

  showTable = (table: avTable): void => {
    this.tableSelected = table;
    this.bottomSheet.open(BottomsheetComponent, { data: table }).afterDismissed().subscribe((data: bottomSheetRelease) => {
      if (data?.tables){
        this.publicService.snack(`Las mesas ${data.tables} fueron liberadas correctamente`, 2000, 'Aceptar');
        this.readAvailability();
      }
    })
  }

  pendingUpdated(pending: Ticket): void {
    this.publicService.snack(`Las mesas ${pending.cd_tables} fueron asignadas correctamente`, 2000, 'Aceptar');
    this.readAvailability(); // actualizo la disponibilidad
  }
}




interface bottomSheetRelease {
  // update schedule
  action: string;
  tables: number[];
  interval: number;
  // push on pending tickets
  ticket: Ticket;
}

