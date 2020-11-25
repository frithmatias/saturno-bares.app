import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';

// services
import { LoginService } from 'src/app/services/login.service';
import { WebsocketService } from '../../../services/websocket.service';
import { WaiterService } from '../waiter.service';
import { SharedService } from 'src/app/services/shared.service';

// interfaces
import { Ticket, TicketsResponse, } from '../../../interfaces/ticket.interface';
import { Table, TablesResponse, } from '../../../interfaces/table.interface';
import { Section } from '../../../interfaces/section.interface';


// libraries
import { Subject, interval } from 'rxjs';
import { IntervalToHmsPipe } from '../../../pipes/interval-to-hms.pipe';
import { SessionResponse } from '../../../interfaces/session.interface';

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
  mytimer: number;

  // data for sections
  ticketsDataBySection = new Map();
  tablesDataBySection = new Map();

  // data for tables
  busyTablesTimes = new Map(); // tables times

  private subjectUpdateWaiters$ = new Subject();

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

  async ngOnInit() {

    if (!this.waiterService.session) {
      this.router.navigate(['/waiter/home']);
      return;
    }

    this.loading = true;

    // timers observer
    await this.readTables();
    await this.readTickets();
    this.wsService.updateWaiters().subscribe(this.subjectUpdateWaiters$);
    this.subjectUpdateWaiters$.subscribe(async () => {
      await this.readTables();
      await this.readTickets();
    });

    this.loading = false;
  }

  readTables = (): Promise<Table[]> => {
    return new Promise((resolve, reject) => {
      let idCompany = this.loginService.user.id_company._id;
      this.waiterService.readTables(idCompany).subscribe(
        (data: TablesResponse) => {
          if (data.ok) {
            this.waiterService.tables = data.tables.filter((table) => table.id_section === this.waiterService.session.id_section._id);

            // tables data for sections table
            for (let section of this.waiterService.sections) {
              this.tablesDataBySection.set(section.tx_section, {
                id: section._id,
                sectionselected: this.waiterService.session.id_section._id === section._id,
                busy: data.tables.filter((table) => table.id_section === section._id && table.tx_status === 'busy').length,
                idle: data.tables.filter((table) => table.id_section === section._id && table.tx_status === 'idle').length,
                paused: data.tables.filter((table) => table.id_section === section._id && table.tx_status === 'paused').length
              });
            }


            let counter$ = interval(1000).subscribe(() => {
              for (let table of this.waiterService.tables.filter((table) => table.id_section === this.waiterService.session?.id_section._id && table.tx_status === 'busy')) {
                if (table.id_session) {
                  this.busyTablesTimes.set(table.nm_table, {
                    tm_provided: this.intervalToHmsPipe.transform(table.id_session.id_ticket.tm_provided),
                    tm_call: this.intervalToHmsPipe.transform(table.id_session.id_ticket.tm_call),
                  });
                }
              }
            });

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
    return new Promise((resolve) => {
      let idCompany = this.loginService.user.id_company?._id;
      return this.waiterService
        .readTickets(idCompany)
        .subscribe((data: TicketsResponse) => {

          this.waiterService.tickets = data.tickets;

          // tickets data for sections table
          for (let section of this.waiterService.sections) {
            this.ticketsDataBySection.set(section.tx_section, {
              id: section._id,
              sectionselected: this.waiterService.session.id_section._id === section._id,
              queued: data.tickets.filter((ticket) =>
                ticket.id_section._id === section._id &&
                ticket.tm_end === null &&
                (ticket.tx_status === 'queued' || ticket.tx_status === 'assigned')).length,
              requested: data.tickets.filter((ticket) =>
                ticket.id_section._id === section._id &&
                ticket.tm_end === null &&
                ticket.tx_status === 'requested').length
            });
          }

          resolve(data.tickets);
          this.loading = false;
        });
    });
  };


  
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
  
  ngOnDestroy = (): void => {
    this.subjectUpdateWaiters$.complete();
  }

}
