import { Component, OnInit, Input } from '@angular/core';
import { Table } from 'src/app/interfaces/table.interface';
import { IntervalToHmsPipe } from '../../../../pipes/interval-to-hms.pipe';
import { WaiterService } from '../../waiter.service';
import { LoginService } from '../../../../services/login.service';
import { SharedService } from '../../../../services/shared.service';
import { TicketResponse, Ticket } from '../../../../interfaces/ticket.interface';
import { sectionSession } from '../../../../../../../api/models/section.session.model';
import { TableResponse } from '../../../../interfaces/table.interface';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.css']
})
export class TablesComponent implements OnInit {
  listmode = false;
  
  tableSelected: string = ''; // reassign table
  blPriority = false;

  @Input() tables: Table[];
  @Input() busyTablesTimes: any;
  // tables

  table: Table;

  constructor(
    public loginService: LoginService,
    public waiterService: WaiterService,
    public sharedService: SharedService,
    private intervalToHmsPipe: IntervalToHmsPipe
    ) { }

  ngOnInit(): void {
        // listmode config
        let config = JSON.parse(localStorage.getItem('config'));
        this.listmode = config ? config.listmode : false;
  }


  // ========================================================
  // TABLE METHODS
  // ========================================================

  selectTable = (table: Table) => {
    this.table = table;
  };

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

  toggleTableStatus = (table: Table) => {
    if (table.tx_status === 'busy') return;
    let idTable = table._id;
    this.waiterService.toggleTableStatus(idTable).subscribe(
      (data: TableResponse) => {
        if (data.ok) {
          let tableToChangeStatus = this.tables.filter(
            (table) => table._id === data.table._id
          )[0];
          tableToChangeStatus.tx_status = data.table.tx_status;
          table.tx_status = data.table.tx_status;
        } else {
          this.sharedService.snack(data.msg, 2000);
        }
      }
    );
  };

  // ========================================================
  // TICKET METHODS
  // ========================================================

  releaseTicket = (ticket: Ticket) => {
    if (!ticket) {
      this.sharedService.snack('Error. No hay clientes en esta mesa.', 5000);
      return;
    }

    let snackMsg = 'Desea soltar el ticket y devolverlo a su estado anterior?';
    this.sharedService
      .snack(snackMsg, 5000, 'ACEPTAR')
      .then((resp: boolean) => {
        if (resp) {
          this.waiterService
            .releaseTicket(ticket)
            .subscribe((resp: TicketResponse) => {
              if (resp.ok) {
                this.waiterService.tickets = this.waiterService.tickets.filter(
                  (ticket) => ticket._id !== ticket._id
                );
                this.clearTicketSession(ticket);
              }
            });
        }
      });
  };

  reassignTicket = (ticket: Ticket) => {
    if (!ticket) {
      this.sharedService.snack('Error. No hay clientes en esta mesa.', 5000);
      return;
    }
    let snackMsg = 'Desea enviar el ticket al skill seleccionado?';
    this.sharedService
      .snack(snackMsg, 5000, 'ACEPTAR')
      .then((resp: boolean) => {
        if (resp) {
          let idTicket = ticket._id;
          let idSession = this.waiterService.sectionSelected;
          let blPriority = this.blPriority;
          if (idTicket && idSession) {
            this.waiterService
              .reassignTicket(idTicket, idSession, blPriority)
              .subscribe((resp: TicketResponse) => {
                if (resp.ok) {
                  this.blPriority = false;
                  this.clearTicketSession(ticket);
                }
              });
          }
        }
      });
  };

  endTicket = (ticket: Ticket) => {
    if (!ticket) {
      this.sharedService.snack('Seleccione una mesa primero', 3000);
    }
    let idTicket = ticket._id;
    if (this.waiterService.tickets) {
      let snackMsg = 'Desea finalizar el ticket actual?';
      this.sharedService
        .snack(snackMsg, 5000, 'ACEPTAR')
        .then((resp: boolean) => {
          if (resp) {
            this.waiterService
              .endTicket(idTicket)
              .subscribe((resp: TicketResponse) => {
                if (resp.ok) {
                  this.clearTicketSession(ticket);
                  this.clearTableSession(ticket);
                }
              });
          }
        });
    }
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

  clearTicketSession = (ticket: Ticket) => {
    // close ONE client session
    this.waiterService.tickets = this.waiterService.tickets.filter(
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
