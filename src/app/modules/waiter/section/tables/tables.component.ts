import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Table } from 'src/app/interfaces/table.interface';
import { IntervalToHmsPipe } from '../../../../pipes/interval-to-hms.pipe';
import { WaiterService } from '../../waiter.service';
import { LoginService } from '../../../../services/login.service';
import { TicketResponse, Ticket } from '../../../../interfaces/ticket.interface';
import { TableResponse } from '../../../../interfaces/table.interface';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { PublicService } from '../../../public/public.service';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class TablesComponent implements OnInit {

  @Input() tables: Table[] = [];
  @Input() tickets: Ticket[] = [];
  @Input() busyTablesTimes: any;

  displayedColumns: string[] = ['estado', 'mesa', 'capacidad', 'ticket', 'ocupacion', 'tp', 'ta'];
  listmode = false;
  table: Table;

  constructor(
    public loginService: LoginService,
    public waiterService: WaiterService,
    public publicService: PublicService,
    private intervalToHmsPipe: IntervalToHmsPipe
  ) { }

  ngOnInit(): void {
    // listmode config
    let config = JSON.parse(localStorage.getItem('config'));
    this.listmode = config ? config.listmode : false;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.tables && this.table) {
      this.table = changes.tables.currentValue.filter((table: Table) => this.table._id === table._id)[0];
    }

  }
  // ========================================================
  // TABLE METHODS
  // ========================================================

  selectTable = (table: Table) => {
    this.table = table;
  };

  setListMode = () => {

    if (localStorage.getItem('config')) {
      let config = JSON.parse(localStorage.getItem('config'));
      config.listmode = !this.listmode;
      localStorage.setItem('config', JSON.stringify(config));
    } else {
      let config = { listmode: true };
      localStorage.setItem('config', JSON.stringify(config));
    }

  };

  toggleTableStatus = (table: Table) => {

    if (table.tx_status === 'busy' || table.tx_status === 'reserved') return;
    let idTable = table._id;
    this.waiterService.toggleTableStatus(idTable).subscribe(
      (data: TableResponse) => {
        if (data.ok) {
          this.publicService.snack(data.msg, 5000);
        } else {
          this.publicService.snack(data.msg, 5000);
        }
      }
    );
  };
  
  attendedTicket = (idTicket: string) => {
    this.waiterService
      .attendedTicket(idTicket)
      .subscribe((resp: TicketResponse) => {
        if (resp.ok) {
          let table = this.tables.filter(
            (table) => table.id_session?.id_ticket._id === resp.ticket._id
          )[0];
          table.id_session.id_ticket.tx_call = null;
        }
      });
  };

  releaseTicket = (ticket: Ticket) => {
    if (!ticket) {
      this.publicService.snack('Error. No hay clientes en esta mesa.', 5000);
      return;
    }

    let snackMsg = 'Desea soltar el ticket y devolverlo a su estado anterior?';
    this.publicService
      .snack(snackMsg, 5000, 'ACEPTAR')
      .then((resp: boolean) => {
        if (resp) {
          this.waiterService
            .releaseTicket(ticket)
            .subscribe((resp: TicketResponse) => {
              if (resp.ok) {
                this.tickets = this.tickets.filter(
                  (ticket) => ticket._id !== ticket._id
                );
                this.clearTicketSession(ticket);
              }
            });
        }
      });
  };

  endTicket = (ticket: Ticket) => {
    if (!ticket) {
      this.publicService.snack('Seleccione una mesa primero', 3000);
    }
    let idTicket = ticket._id;
    if (this.tickets) {
      let snackMsg = 'Desea finalizar el ticket actual?';
      this.publicService
        .snack(snackMsg, 5000, 'ACEPTAR')
        .then((resp: boolean) => {
          if (resp) {
            this.waiterService.endTicket(idTicket).subscribe((resp: TicketResponse) => {
                if (resp.ok) {
                  this.clearTicketSession(ticket);
                  this.clearTableSession(ticket);
                }
              });
          }
        });
    }
  };


  clearTicketSession = (ticket: Ticket) => {
    this.tickets = this.tickets.filter(
      (thisTicket) => thisTicket._id !== ticket._id
    );
  };

  clearTableSession = (ticket: Ticket) => {
    let table = this.tables.filter(
      (table) => table.id_session?.id_ticket._id === ticket._id
    )[0];
    table.tx_status = 'paused';
    table.id_session = null;
  };


}
