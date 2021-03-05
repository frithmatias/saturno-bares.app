
import { Component, OnInit, Input } from '@angular/core';
import { Ticket } from 'src/app/interfaces/ticket.interface';
import { Table } from 'src/app/interfaces/table.interface';
import { WaiterService } from '../../waiter.service';
import { TicketResponse } from '../../../../interfaces/ticket.interface';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { PublicService } from '../../../public/public.service';


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

  displayedColumns: string[] = ['id_position', 'tx_persons', 'tx_status', 'nombre', 'prioritario', 'circuito'];

  constructor(
    public publicService: PublicService,
    public waiterService: WaiterService
  ) { }

  ngOnInit(): void { }

  // ADD OR REMOVE TABLES FOR ASSIGNATION
  setReserve = (table: Table, ticket: Ticket) => {
    ticket.cd_tables = ticket.cd_tables.includes(table.nm_table)
      ? ticket.cd_tables.filter((numtable) => numtable !== table.nm_table)
      : [...ticket.cd_tables, table.nm_table];
  };

  // ASSIGN TABLES
  assignTablesRequested = (ticket: Ticket) => {

    let activeQueue = this.queued.filter(ticket => ticket.tx_status === 'queued' || ticket.tx_status === 'assigned')

    let blPriority = ticket.bl_priority;
    // si el ticket viene de agenda y el waiter re-asigna mesas asignadas por admin, no debe tener en cuenta si es 
    // el primero, porque la provisión de un assignado de agenda la hace el cron a la hora exacta de la reserva.
    let blFirst = ticket.tm_reserve ? false: activeQueue.length === 0 ? true : activeQueue[0]._id === ticket._id;
    let idTicket = ticket._id;
    let cdTables = ticket.cd_tables;

    this.waiterService.assignTablesRequested(idTicket, blPriority, blFirst, cdTables).subscribe(
      (resp: TicketResponse) => {
        if (resp.ok) {
          this.publicService.snack(resp.msg, 5000);
        } else {
          this.publicService.snack('Error al asignar las mesas!', 2000);
        }
      },
      () => {
        this.publicService.snack('Error al asignar las mesas!', 2000);
      }
    );
  };

  sendMessage = (ticket: Ticket) => {

    if (ticket.bl_contingent) {
      // El ticket es de contingencia, no tiene asignado un socket
      return;
    }

  }

  endTicket = (ticket: Ticket) => {
    if (!ticket) {
      this.publicService.snack('Seleccione una mesa primero', 3000);
    }
    const idTicket = ticket._id;
    const reqBy = 'waiter';
    if (this.queued) {
      this.publicService.snack('Desea finalizar el ticket actual?', 5000, 'ACEPTAR').then((resp: boolean) => {
        if (resp) {
          this.publicService.endTicket(idTicket, reqBy).subscribe((resp: TicketResponse) => {
              if (resp.ok) {
                this.queued = this.queued.filter(thisTicket => thisTicket._id !== ticket._id);
              }
            });
        }
      });
    }
  };

}
