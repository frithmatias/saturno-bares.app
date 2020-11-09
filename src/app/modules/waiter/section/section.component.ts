import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';

// services
import { LoginService } from 'src/app/services/login.service';
import { WebsocketService } from '../../../services/websocket.service';
import { WaiterService } from '../waiter.service';
import { SharedService } from 'src/app/services/shared.service';

// interfaces
import {
  Ticket,
  TicketResponse,
  TicketsResponse,
} from '../../../interfaces/ticket.interface';
import {
  Table,
  TableResponse,
  TablesResponse,
} from '../../../interfaces/table.interface';
import {
  Section,
  SectionsResponse,
} from '../../../interfaces/section.interface';

// libraries
import { Subscription, Subject, interval } from 'rxjs';
import { IntervalToHmsPipe } from '../../../pipes/interval-to-hms.pipe';

const TABLE_TIME_OUT = 2; // 60 segundos
const TABLE_TIME_EXTRA = 5; // 120 segundos
export interface Tile {
  color: string;
  cols: number;
  rows: number;
  text: string;
}
@Component({
  selector: 'app-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.css'],
})
export class SectionComponent implements OnInit {
  loading = false;
  listmode = false;
  message: string = '';

  pendingBySection: any[] = [];

  // tickets
  tickets: Ticket[] = [];
  queued: Ticket[] = [];
  requested: Ticket[] = [];
  assigned: Ticket[] = [];
  waiting: Ticket[] = [];

  sections: Section[] = [];
  section: Section;

  tables: Table[] = [];
  table: Table;

  sectionSelected: string = ''; // reassign section
  tableSelected: string = ''; // reassign table
  blPriority = false;

  mytimer: number;
  busyTablesTimes = new Map(); // tables times

  private subjectUpdateTickets$ = new Subject();
  private subjectTurnoCancelado$ = new Subject();

  constructor(
    public loginService: LoginService,
    public waiterService: WaiterService,
    public sharedService: SharedService,
    private wsService: WebsocketService,
    private router: Router,
    private intervalToHmsPipe: IntervalToHmsPipe
  ) { }

  @HostListener('click', ['$event'])
  onClick(btn: MouseEvent) {
    // console.log('button', btn);
  }

  // ========================================================
  // NG LIFE CYCLES
  // ========================================================

  async ngOnInit() {
    if (!this.waiterService.section) {
      this.router.navigate(['/waiter/home']);
      return;
    }

    this.loading = true;

    // listmode config
    let config = JSON.parse(localStorage.getItem('config'));
    this.listmode = config ? config.listmode : false;

    // get sections
    this.sections = this.waiterService.sections;
    this.section = this.waiterService.section;

    // timers observer

    await this.readSectionTables().then(() => {
      let counter$ = interval(1000).subscribe((newsecond) => {
        let busyTables = this.tables.filter(table => table.tx_status === 'busy');
        newsecond = newsecond * 1000;
        for (let table of busyTables) {
          if (table.tx_status === 'busy') {
            this.busyTablesTimes.set(table.nm_table,
              {
                tm_provided: this.intervalToHmsPipe.transform(table.id_session.id_ticket.tm_provided),
                tm_call: this.intervalToHmsPipe.transform(table.id_session.id_ticket.tm_call),
              });
          }
        }
      });
    });

    await this.readTickets();

    this.requested = this.tickets.filter(
      (ticket) => ticket.tx_status === 'requested'
    );

    this.waiting = this.tickets.filter(
      (ticket) =>
        ticket.tx_status === 'queued' ||
        ticket.tx_status === 'assigned' ||
        (ticket.tx_status === 'finished' && ticket.tm_provided === null)
    );

    // hot subjects subscribe to socket.io listeners
    this.wsService.updateTicketsWaiters().subscribe(this.subjectUpdateTickets$);
    this.subjectUpdateTickets$.subscribe(async () => {
      await this.readSectionTables().then(() => {
        return;
      });
      await this.readTickets();
      this.requested = this.tickets.filter(
        (ticket) => ticket.tx_status === 'requested'
      );
      this.waiting = this.tickets.filter(
        (ticket) =>
          ticket.tx_status === 'queued' || ticket.tx_status === 'assigned'
      );
    });

    this.loading = false;
  }

  ngOnDestroy() {
    this.subjectUpdateTickets$.complete();
    this.subjectTurnoCancelado$.complete();
  }

  // ========================================================
  // READ METHODS
  // ========================================================

  readSectionTables = (): Promise<Table[]> => {
    return new Promise((resolve, reject) => {
      let idSection = this.waiterService.section._id;
      this.waiterService.readSectionTables(idSection).subscribe(
        (data: TablesResponse) => {
          if (data.ok) {
            this.tables = data.tables;
            localStorage.setItem('tables', JSON.stringify(data.tables));
            resolve();
          } else {
            reject([]);
          }
        },
        () => {
          if (localStorage.getItem('tables')) {
            localStorage.removeItem('tables');
          }
          reject([]);
        }
      );
    });
  };

  readTickets = (): Promise<Ticket[]> => {
    return new Promise((resolve, reject) => {
      let idCompany = this.loginService.user.id_company?._id;
      return this.waiterService
        .readTickets(idCompany)
        .subscribe((data: TicketsResponse) => {
          this.tickets = data.tickets.filter((ticket) => {
            return (
              ticket.id_section._id === this.waiterService.section._id &&
              ticket.tm_end === null
            );
          });

          if (this.tickets) {
            this.message = 'Tiene clientes en sus mesas';
            resolve(this.tickets);
          } else {
            delete this.tickets;
            reject([]);
          }

          const ticketsWaiting = this.tickets.filter(
            (ticket) => ticket.tm_provided === null && ticket.tm_end === null
          );
          const ticketsWaitingThisSection = this.tickets.filter(
            (ticket) =>
              ticket.tm_provided === null &&
              ticket.tm_end === null &&
              ticket.id_section._id === this.waiterService.section._id
          );

          if (ticketsWaitingThisSection.length > 0) {
            this.message = `Hay ${ticketsWaitingThisSection.length} clientes esparando una mesa.`;
          } else {
            this.message = `No hay solicitud de mesa para este sector.`;
          }
          this.pendingBySection = [];
          for (let section of this.sections) {
            this.pendingBySection.push({
              id: section._id,
              assigned: this.waiterService.section._id === section._id,
              section: section.tx_section,
              queued: ticketsWaiting.filter(
                (ticket) =>
                  ticket.id_section._id === section._id &&
                  ticket.tm_end === null &&
                  ticket.tx_status === 'queued'
              ).length,
              requested: ticketsWaiting.filter(
                (ticket) =>
                  ticket.id_section._id === section._id &&
                  ticket.tm_end === null &&
                  ticket.tx_status === 'requested'
              ).length,
            });
          }
          this.loading = false;
        });
    });
  };

  // ========================================================
  // SESSION METHODS
  // ========================================================

  clearTicketSession = (ticket: Ticket) => {
    // close ONE client session
    this.tickets = this.tickets.filter(
      (thisTicket) => thisTicket._id !== ticket._id
    );
    this.waiterService.chatMessages = this.waiterService.chatMessages.filter(
      (message) => message.id_ticket !== ticket._id
    );

    this.readTickets();
  };

  clearTableSession = (ticket: Ticket) => {
    let table = this.tables.filter(
      (table) => table.id_session?.id_ticket._id === ticket._id
    )[0];
    table.tx_status = 'paused';
    table.id_session = null;
  };

  clearSectionSession = () => {
    delete this.waiterService.section;
    if (localStorage.getItem('section')) {
      localStorage.removeItem('section');
    }
    if (localStorage.getItem('tables')) {
      localStorage.removeItem('tables');
    }
    this.router.navigate(['waiter/home']);
  };

  // ========================================================
  // SECTION METHODS
  // ========================================================

  releaseSection = () => {
    if (this.tickets.length > 0) {
      this.message = 'No puede cerrar la sesión tiene mesas ocupadas.';
      this.sharedService.snack(this.message, 5000);
      return;
    }

    let idSection = this.waiterService.section._id;
    this.waiterService
      .releaseSection(idSection)
      .subscribe((data: TableResponse) => {
        if (data.ok) {
          this.clearSectionSession();
        }
      });
  };

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
      },
      () => {
        // on error update all sliders stats
        this.readSectionTables();
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
                this.tickets = this.tickets.filter(
                  (ticket) => ticket._id !== ticket._id
                );
                this.clearTicketSession(ticket);
                this.message = resp.msg;
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
          let idSession = this.sectionSelected;
          let blPriority = this.blPriority;
          if (idTicket && idSession) {
            this.waiterService
              .reassignTicket(idTicket, idSession, blPriority)
              .subscribe((resp: TicketResponse) => {
                if (resp.ok) {
                  this.blPriority = false;
                  this.clearTicketSession(ticket);
                  this.message = resp.msg;
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
    if (this.tickets) {
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
                  this.message = resp.msg;
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
          this.message = resp.msg;
        }
      });
  };

  setListMode = () => {
    let config = JSON.parse(localStorage.getItem('config'));
    config.listmode = !this.listmode;
    localStorage.setItem('config', JSON.stringify(config));
  };
}
