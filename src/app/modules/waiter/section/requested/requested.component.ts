import { Component, OnInit, Input } from '@angular/core';
import { Ticket } from 'src/app/interfaces/ticket.interface';
import { Table } from 'src/app/interfaces/table.interface';
import { WaiterService } from '../../waiter.service';
import { SharedService } from '../../../../services/shared.service';
import { TicketResponse } from '../../../../interfaces/ticket.interface';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-requested',
  templateUrl: './requested.component.html',
  styleUrls: ['./requested.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class RequestedComponent implements OnInit {

  @Input() requested: Ticket[];
  @Input() tables: Table[];

  displayedColumns: string[] = ['id_position', 'tx_persons', 'tx_status', 'tx_section'];

  assignWithPriority: boolean = false;

  constructor(
    public sharedService: SharedService,
    public waiterService: WaiterService
  ) { }

  ngOnInit(): void { }


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
            'Las mesas fueron asignadas con exito!',
            2000
          );
        } else {
          this.sharedService.snack('Error al asignar las mesas!', 2000);
        }
      },
      () => {
        this.sharedService.snack('Error al asignar las mesas!', 2000);
      }
    );
  };

}
