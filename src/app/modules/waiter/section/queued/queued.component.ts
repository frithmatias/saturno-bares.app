import { Component, OnInit, Input } from '@angular/core';
import { Ticket } from 'src/app/interfaces/ticket.interface';
import { Table } from 'src/app/interfaces/table.interface';
import { WaiterService } from '../../waiter.service';
import { TicketResponse } from '../../../../interfaces/ticket.interface';
import { SharedService } from '../../../../services/shared.service';
import { animate, state, style, transition, trigger } from '@angular/animations';


@Component({
  selector: 'app-queued',
  templateUrl: './queued.component.html',
  styleUrls: ['./queued.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class QueuedComponent implements OnInit {
  @Input() queued: Ticket[];
  @Input() tables: Table[];

  displayedColumns: string[] = ['id_position', 'tx_persons', 'tx_status', 'nombre', 'prioritario'];
  
  constructor(
    public sharedService: SharedService,
    public waiterService: WaiterService
  ) { }

  ngOnInit(): void {


   }

  // ADD OR REMOVE TABLES FOR ASSIGNATION
  setReserve = (table: Table, ticket: Ticket) => {
    ticket.cd_tables = ticket.cd_tables.includes(table.nm_table)
      ? ticket.cd_tables.filter((numtable) => numtable !== table.nm_table)
      : [...ticket.cd_tables, table.nm_table];
  };

  // ASSIGN TABLES
  assignTables = (ticket: Ticket) => {
    
    let activeQueue = this.queued.filter(ticket => ticket.tx_status === 'queued' || ticket.tx_status === 'assigned')
    
    let isFirst = activeQueue.length === 0 ? true : activeQueue[0]._id === ticket._id;
    let idTicket = ticket._id;
    let cdTables = ticket.cd_tables;
    let blPriority = ticket.bl_priority;
    
    this.waiterService.assignTables(isFirst, idTicket, cdTables, blPriority).subscribe(
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
