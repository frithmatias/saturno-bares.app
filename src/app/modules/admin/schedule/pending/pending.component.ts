import { Component, OnInit, Input, SimpleChanges, SimpleChange, EventEmitter, Output } from '@angular/core';
import { Ticket } from 'src/app/interfaces/ticket.interface';
import { TicketResponse } from '../../../../interfaces/ticket.interface';
import { WaiterService } from '../../../waiter/waiter.service';
import { PublicService } from '../../../public/public.service';
import { trigger, state, transition, style, animate } from '@angular/animations';
import { MessageResponse } from '../../../../interfaces/messenger.interface';
import { avInterval, avTable } from '../../../../interfaces/availability.interface';

@Component({
  selector: 'app-pending',
  templateUrl: './pending.component.html',
  styleUrls: ['./pending.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class PendingComponent implements OnInit {

  @Input() availability: avInterval[];
  @Input() pending: Ticket[] = []
  @Output() pendingUpdated: EventEmitter<Ticket> = new EventEmitter();

  tablesAvailability: avTable[];
  displayedColumns: string[] = ['nmPersons', 'txName', 'tmIntervals'];
  showMessageForm = false;

  constructor(

    private waiterService: WaiterService,
    private publicService: PublicService
  ) { }

  ngOnInit(): void {

  }

  // ADD OR REMOVE TABLES FOR ASSIGNATION
  setReserve = (table: avTable, ticket: Ticket) => {
    if (ticket.cd_tables.includes(0)) { ticket.cd_tables = ticket.cd_tables.filter(table => table !== 0); }
    ticket.cd_tables = ticket.cd_tables.includes(table.nmTable)
      ? ticket.cd_tables.filter((numtable) => numtable !== table.nmTable)
      : [...ticket.cd_tables, table.nmTable];
  };

  sendMessage = (ticket: Ticket) => {
    if (ticket.bl_contingent) {
      // Enviar por canal de validación
      return;
    }
  }

  // ASSIGN TABLES
  assignTablesPending = (ticket: Ticket) => {
    let blPriority = ticket.bl_priority;
    let blFirst = false;
    let idTicket = ticket._id;
    let cdTables = ticket.cd_tables;

    this.waiterService.assignTablesPending(idTicket, blPriority, blFirst, cdTables).subscribe((resp: TicketResponse) => {
      if (resp.ok) {
        this.pending = this.pending.filter(ticket => ticket._id !== resp.ticket._id);
        this.pendingUpdated.emit(resp.ticket);
      } else {
        this.publicService.snack('Error al asignar las mesas!', 2000);
      }
    },
      () => {
        this.publicService.snack('Error al asignar las mesas!', 2000);
      }
    );
  };

  endTicket = (ticket: Ticket) => {
    if (!ticket) {
      this.publicService.snack('Seleccione una mesa primero', 3000);
    }
    const idTicket = ticket._id;
    const reqBy = 'client'; // cancelled (not finished)
    if (this.pending) {
      this.publicService.snack(`Querés finalizar el ticket de ${ticket.tx_name}?`, 5000, 'Si, finalizar').then(() => {

        this.publicService.endTicket(idTicket, reqBy).subscribe((resp: TicketResponse) => {
          if (resp.ok) {
            this.pending = this.pending.filter(thisTicket => thisTicket._id !== ticket._id);
            this.pendingUpdated.emit(resp.ticket);
          }
        });

      });
    }
  };

  getIntervalAvailability(pending: Ticket): void {

    const interval = this.availability.find((av: avInterval) =>
      new Date(av.interval).getTime() === new Date(pending.tm_intervals[0]).getTime()
    );

    if (!interval) {
      this.publicService.snack('El ticket pendiente está fuera del horario comercial', 5000);
      return;
    }

    this.tablesAvailability = interval.available;
  }

  messageResponse(response: MessageResponse) {
    this.publicService.snack(response.msg, 5000, 'Aceptar');
    this.showMessageForm = false;
  }
}



