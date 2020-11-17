import { Component, OnInit, Input } from '@angular/core';
import { Ticket } from 'src/app/interfaces/ticket.interface';
import { Table } from 'src/app/interfaces/table.interface';
import { WaiterService } from '../../waiter.service';
import { SharedService } from '../../../../services/shared.service';
import { TicketResponse } from '../../../../interfaces/ticket.interface';

@Component({
  selector: 'app-requested',
  templateUrl: './requested.component.html',
  styleUrls: ['./requested.component.css']
})
export class RequestedComponent implements OnInit {

  @Input() tickets: Ticket[];
  @Input() tables: Table[];
  assignWithPriority: boolean = false;

  requested: Ticket[];
  constructor(
    public sharedService: SharedService,
    public waiterService: WaiterService
  ) { }

  ngOnInit(): void {
    this.requested = this.tickets.filter(ticket => ticket.tx_status === 'requested');
  }


  setReserve = (table: Table, ticket: Ticket) => {
    ticket.cd_tables = ticket.cd_tables.includes(table.nm_table)
      ? ticket.cd_tables.filter((numtable) => numtable !== table.nm_table)
      : [...ticket.cd_tables, table.nm_table];
  };

  assignTables = (ticket: Ticket, blPriority: boolean) => {
    let idTicket = ticket._id;
    let cdTables = ticket.cd_tables;
    this.waiterService.assignTables(idTicket, cdTables, blPriority).subscribe(
      (resp: TicketResponse) => {
        if (resp.ok) {
          this.sharedService.snack(
            'Las mesas fueron reservadas con exito!',
            2000
          );
        } else {
          this.sharedService.snack('Error al reservar las mesas!', 2000);
        }
      },
      () => {
        this.sharedService.snack('Error al reservar las mesas!', 2000);
      }
    );
  };

}
