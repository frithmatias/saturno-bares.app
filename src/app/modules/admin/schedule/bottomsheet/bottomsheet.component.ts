import { Inject } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { avTable } from '../../../../interfaces/availability.interface';
import { Ticket, TicketResponse } from '../../../../interfaces/ticket.interface';
import { PublicService } from '../../../public/public.service';
import { WaiterService } from '../../../waiter/waiter.service';

@Component({
  selector: 'app-bottomsheet',
  templateUrl: './bottomsheet.component.html',
  styleUrls: ['./bottomsheet.component.css']
})
export class BottomsheetComponent implements OnInit {

  table: avTable;

  nmTable: number;
  nmTablePersons: number;
  nmTicketPersons: number;
  nmOccupation: number;
  blContingent: boolean;
  blPriority: boolean;
  tmReserve: Date;
  tmStart: Date;
  txPlatform: string;
  idUser: string;
  txName: string;

  constructor(
    private bottomSheetRef: MatBottomSheetRef<BottomsheetComponent>,
    private publicService: PublicService,
    private waiterService: WaiterService,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: avTable
  ) {

    this.table = data;

    this.nmTable = data.nmTable;
    this.nmTablePersons = data.nmPersons;
    this.nmTicketPersons = data.ticketOwner.nm_persons;
    this.nmOccupation = Math.round(data.nmPersons / data.ticketOwner.nm_persons * 100);
    this.blContingent = data.ticketOwner.bl_contingent;
    this.blPriority = data.ticketOwner.bl_priority;
    this.tmReserve = data.ticketOwner.tm_reserve;
    this.tmStart = data.ticketOwner.tm_start;
    this.txPlatform = data.ticketOwner.tx_platform;
    this.idUser = data.ticketOwner.id_user;
    this.txName = data.ticketOwner.tx_name;

  }

  ngOnInit(): void { }

   // ASSIGN TABLES
   assignTablesPending = () => {
    let blPriority = this.table.ticketOwner.bl_priority;
    let blFirst = false;
    let idTicket = this.table.ticketOwner._id;
    let cdTables = [];

    this.waiterService.assignTablesPending(idTicket, blPriority, blFirst, cdTables).subscribe((resp: TicketResponse) => {
        if (resp.ok) {
          this.bottomSheetRef.dismiss({
            action: 'release', 
            tables: this.table.ticketOwner.cd_tables, 
            interval: new Date(this.table.ticketOwner.tm_reserve).getHours(),
            ticket: resp.ticket // updated ticket with no cdTables []
          });
        } else {
          this.publicService.snack('Error al asignar las mesas!', 2000);
        }
      },
      () => {
        this.publicService.snack('Error al asignar las mesas!', 2000);
      }
    );
  };

  endTicket = () => {
    const ticket = this.table.ticketOwner;

    if (!ticket) {
      this.publicService.snack('Seleccione una mesa primero', 3000);
    }

    const idTicket = ticket._id;
    const reqBy = 'client';
    this.publicService.snack('Desea cancelar el ticket actual?', 5000, 'Si, cancelar').then((ok: boolean) => {
      if (ok) {
        // publicService.endTicket() 
        // -> reqBy: 'waiter' -> tx_status: 'finished'
        // -> reqBy: 'client' -> tx_status: 'cancelled'
        this.publicService.endTicket(idTicket, reqBy).subscribe((resp: TicketResponse) => {
          if (resp.ok) {
            this.bottomSheetRef.dismiss({action: 'cancel', tables: resp.ticket.cd_tables});
          } else {
            this.publicService.snack('Error al asignar las mesas!', 2000);
          }
        });
      }
    });

  };


  sendMessage(){
    this.publicService.snack('Esta opción todavía no esta disponible.', 5000, 'Aceptar');
  }
}
