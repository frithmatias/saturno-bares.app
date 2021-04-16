import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Table } from 'src/app/interfaces/table.interface';
import { WaiterService } from '../../waiter.service';
import { LoginService } from '../../../../services/login.service';
import { TicketResponse, Ticket } from '../../../../interfaces/ticket.interface';
import { TableResponse } from '../../../../interfaces/table.interface';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { PublicService } from '../../../public/public.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { TicketInfoComponent } from '../../../../components/ticket-info/ticket-info.component';

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
  @Output() updateTables = new EventEmitter();
  @Input() tables: Table[] = [];
  @Input() tickets: Ticket[] = [];
  @Input() busyTablesTimes: any;

  displayedColumns: string[] = ['estado', 'mesa', 'capacidad', 'ticket', 'ocupacion', 'tp', 'ta'];
  listmode = false;
  table: Table;
  toggling: string = null;

  constructor(
    public loginService: LoginService,
    public waiterService: WaiterService,
    public publicService: PublicService,
    private bottomSheet: MatBottomSheet

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

    this.toggling = table._id;
    const idTable = table._id;
    const actualStatus = table.tx_status;
    this.waiterService.toggleTableStatus(idTable, actualStatus).subscribe(
      (data: TableResponse) => {
        this.toggling = null;
      },
      () => {
        // on error update all tables (ie other waiter change table status)
        this.toggling = null;
        this.updateTables.emit();
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

  resetTable = (table: Table) => {

    if (!table) {
      this.publicService.snack('Seleccione una mesa primero', 3000);
    }

    const idTable = table._id;
    this.publicService.snack('Desea resetear la mesa? Si tiene un ticket adjunto se perderá.', 5000, 'Aceptar').then(() => {
      this.waiterService.resetTable(idTable).subscribe((resp: TableResponse) => {
        if (resp.ok) {
          this.table.tx_status = 'paused';
          this.table.id_session = null;
        }
      });

    });

  };

  initTables = (table: Table) => {

    // TODO
    // Las mesas deben poder inicializarse si: 
    // 1. esta en estado WAITING 
    // 2. está en estado RESERVED <-
    // Si está en estado RESERVED, hay que inicializar la sesión de la mesa (que lo hace SPM automáticamente al aprovisionar) 
    // asegurandose de que TODAS las mesas en el ticket estén reservadas y estén reservadas para ese ticket.

    if (!table) {
      this.publicService.snack('Seleccione una mesa primero', 3000);
    }

    if (!table.id_session) {
      this.publicService.snack('Esta mesa no tiene una sesión iniciada todavía', 3000);
      return;
    }

    const idTables = table.id_session.id_tables;
    this.publicService.snack('¿El cliente ya está en la mesa?', 5000, 'SI, INICIAR').then(() => {

      this.waiterService.initTables(idTables).subscribe((resp: TableResponse) => {
        if (resp.ok) {
          this.table.tx_status = 'busy'
        }
      });

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
      .then(() => {

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

      });
  };

  endTicket = (ticket: Ticket) => {
    if (!ticket) {
      this.publicService.snack('Seleccione una mesa primero', 3000);
    }

    const idTicket = ticket._id;
    const reqBy = 'waiter';
    if (this.tickets) {
      this.publicService.snack('Desea finalizar el ticket actual?', 5000, 'Aceptar').then(() => {

        this.publicService.endTicket(idTicket, reqBy).subscribe((resp: TicketResponse) => {
          if (resp.ok) {
            this.clearTicketSession(ticket);
            this.clearTableSession(ticket);
          }
        });

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

  openSheetTicketInfo(ticket: Ticket) {
    if (!ticket) { return; }
    this.bottomSheet.open(TicketInfoComponent, { data: ticket });
  }

}
