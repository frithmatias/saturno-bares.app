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
import { ContingencyTicketComponent } from '../../waiter/section/contingency-ticket/contingency-ticket.component';




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
      dtReserve: new FormControl('', [Validators.required])
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
      this.availability = data.availability;
      // data.availability.map(av => {
      //   this.availability.push({ interval: new Date(av.interval).getHours(), tables: av.tables, capacity: av.capacity });
      // });
    })

  }

  openBottomSheet = (table: avTable, availability: availability): void => {
    this.tableSelected = table;
    const idSection = this.scheduleForm.controls.idSection.value;

    // table.blReserved ? release : create;
    this.bottomSheet.open(BottomsheetComponent, { data: { table, availability, idSection } }).afterDismissed().subscribe((data: bottomSheetRelease) => {

      if (data?.action === 'create') {
        this.publicService.snack(`Las mesas ${data.ticket.cd_tables} fueron reservadas correctamente`, 3000, 'Aceptar');
        this.readAvailability();
      }

      if (data?.action === 'release') {
        this.publicService.snack(`Las mesas reservadas a ${data.ticket.tx_name} fueron liberadas correctamente`, 3000, 'Aceptar');
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

