import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

// services
import { LoginService } from 'src/app/services/login.service';
import { WebsocketService } from '../../../services/websocket.service';
import { WaiterService } from '../waiter.service';

// interfaces
import { Ticket, TicketsResponse } from '../../../interfaces/ticket.interface';
import { Table, TablesResponse } from '../../../interfaces/table.interface';

// libraries
import { interval, Subscription } from 'rxjs';
import { DiffToHMSPipe } from '../../../pipes/diff-to-hms.pipe';
import { SessionResponse } from '../../../interfaces/session.interface';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { PublicService } from '../../public/public.service';
import { ContingencyTicketComponent } from './contingency-ticket/contingency-ticket.component';

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
export class SectionComponent implements OnInit, OnDestroy {

  loading = false;
  mytimer: number;

  // data for sections
  ticketsDataBySection = new Map();
  tablesDataBySection = new Map();

  // data for tables
  busyTablesTimes = new Map(); // tables times


  // data for queued and requested 
  tickets: Ticket[] = [];
  tables: Table[] = [];

  // data for requested
  requested: Ticket[] = [];

  //data for queued
  queued: Ticket[] = [];

  //data for contingent
  contingent: Ticket[] = [];
  updateSub: Subscription;

  constructor(
    public loginService: LoginService,
    public waiterService: WaiterService,
    public publicService: PublicService,
    private wsService: WebsocketService,
    private router: Router,
    private diffToHMSPipe: DiffToHMSPipe,
    private bottomSheet: MatBottomSheet
  ) { }

  @HostListener('click', ['$event'])
  onClick(btn: MouseEvent) {
  }

  async ngOnInit() {

    if (!this.waiterService.session) {
      this.router.navigate(['/waiter/home']);
      return;
    }

    this.loading = true;
    this.updateSub = this.wsService.updateWaiters().subscribe(async () => {
      await this.readTables();
      await this.readTickets();
    });

    await this.readTables();
    await this.readTickets();
    this.loading = false;
  }

  readTables = (): Promise<Table[]> => {
    return new Promise((resolve, reject) => {
      const idCompany = this.loginService.user.id_company._id;
      this.waiterService.readTables(idCompany).subscribe(
        (data: TablesResponse) => {
          if (data.ok) {

            this.tables = data.tables.filter((table) => table.id_section === this.waiterService.session.id_section._id);

            // tables data for sections table
            for (let section of this.publicService.sections) {
              this.tablesDataBySection.set(section.tx_section, {
                id: section._id,
                sectionselected: this.waiterService.session.id_section._id === section._id,
                busy: data.tables.filter((table) => table.id_section === section._id && table.id_session !== null).length, // busy && waiting
                idle: data.tables.filter((table) => table.id_section === section._id && table.tx_status === 'idle').length,
                paused: data.tables.filter((table) => table.id_section === section._id && table.tx_status === 'paused').length
              });
            }


            let counter$ = interval(1000).subscribe(() => {
              for (let table of this.tables.filter((table) => table.id_section === this.waiterService.session?.id_section._id && table.id_session !== null)) {
                if (table.id_session.id_ticket) {
                  this.busyTablesTimes.set(table.nm_table, {
                    tm_provided: this.diffToHMSPipe.transform(+ new Date(table.id_session.id_ticket.tm_provided)),
                    tm_call: this.diffToHMSPipe.transform(+ new Date(table.id_session.id_ticket.tm_call)),
                  });
                }
              }
            });

            localStorage.setItem('tables', JSON.stringify(data.tables));
            resolve([]);
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
    return new Promise((resolve) => {
      const idCompany = this.loginService.user.id_company?._id;
      return this.waiterService.readTickets(idCompany).subscribe((data: TicketsResponse) => {

        this.tickets = data.tickets;

        // for input queued child  
        this.queued = this.tickets.filter(ticket => ticket.id_section?._id === this.waiterService.session.id_section._id &&
          ticket.tm_end === null && (ticket.tx_status === 'queued' || ticket.tx_status === 'assigned' || ticket.tx_status === 'requested'))

        // for input sections child
        for (let section of this.publicService.sections) {
          this.ticketsDataBySection.set(section.tx_section, {
            id: section._id,

            sectionselected: this.waiterService.session.id_section._id === section._id,

            queued: data.tickets.filter((ticket) =>
              ticket.id_section?._id === section._id &&
              ticket.tm_end === null &&
              (ticket.tx_status === 'queued' || ticket.tx_status === 'assigned')).length,

            requested: data.tickets.filter((ticket) =>
              ticket.id_section?._id === section._id &&
              ticket.tm_end === null &&
              ticket.tx_status === 'requested').length,

          });
        }

        resolve(data.tickets);
        this.loading = false;
      });
    });
  };

  createTicket = (): void => {

    this.bottomSheet.open(ContingencyTicketComponent);

  }

  releaseSection = () => {

    let idSection = this.waiterService.session.id_section._id;
    let idWaiter = this.loginService.user._id;

    this.waiterService
      .releaseSection(idSection, idWaiter)
      .subscribe((data: SessionResponse) => {
        if (data.ok) {
          this.waiterService.clearSectionSession();
          this.router.navigate(['waiter/home']);
        }
      });
  };

  ngOnDestroy() {
    this.updateSub?.unsubscribe();
  }

}
