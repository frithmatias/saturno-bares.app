import { Component, OnInit } from '@angular/core';
import { Ticket } from 'src/app/interfaces/ticket.interface';
import { Router } from '@angular/router';
import { PublicService } from '../public.service';
import { TicketsResponse, TicketResponse } from '../../../interfaces/ticket.interface';
import { User } from 'src/app/interfaces/user.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { WebsocketService } from '../../../services/websocket.service';
import { DateToStringPipe } from '../../../pipes/date-to-string.pipe';
import { CapitalizarPipe } from '../../../pipes/capitalizar.pipe';



@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.css']
})
export class TicketsComponent implements OnInit {

  loading = false;
  customer: User; // customer logged with email

  tickets: Ticket[] = [];
  ticketsRunning: Ticket[] = [];
  ticketsActive: Ticket[] = [];
  ticketsInactive: Ticket[] = [];
  ticketsAll: Ticket[] = [];
  activeTickets = ['waiting', 'pending', 'scheduled', 'queued', 'requested', 'assigned', 'provided']; // terminated filtered in backend.

  updateTicketsSub: Subscription;


  constructor(
    private router: Router,
    public publicService: PublicService,
    private websocketService: WebsocketService,
    private dateToString: DateToStringPipe,
    private capitalizar: CapitalizarPipe
  ) { }

  ngOnInit(): void {

    this.checkSession();

  }

  checkSession() {

    if (localStorage.getItem('customer')) {
      this.customer = JSON.parse(localStorage.getItem('customer'));
      this.publicService.customer = this.customer;
      const txPlatform = this.customer.tx_platform;
      const txEmail = this.customer.tx_email;
      if (txPlatform && txEmail) {
        this.getUserTickets(txPlatform, txEmail); // update tickets
      }
    }

    if (!this.customer) {
      this.router.navigate(['/public/login']);
    }
  }

  updateTickets(tickets: Ticket[]) {
    this.tickets = tickets;
    // ------------------------
    // backup de tickes waiting en la localstorage
    if (localStorage.getItem('tickets')) {
      const waiting: Ticket[] = JSON.parse(localStorage.getItem('tickets')).filter((ticket: Ticket) => ticket.tx_status === 'waiting');
      if (waiting.length > 0) { this.tickets.push(...waiting); }
    }
    // ------------------------
    this.tickets = this.tickets.sort((b, a) => +new Date(a.tm_intervals[0]) - +new Date(b.tm_intervals[0]));

    this.ticketsRunning = this.tickets.filter(ticket => ticket.tx_status === 'provided');
    this.ticketsActive = this.tickets.filter(ticket => this.activeTickets.includes(ticket.tx_status));
    this.ticketsInactive = this.tickets.filter(ticket => !this.activeTickets.includes(ticket.tx_status));
    this.ticketsAll = [...this.ticketsRunning, ...this.ticketsActive, ...this.ticketsInactive];

    // Entro a las empresas con tickets ACTIVOS (estudiar si es conveniente entrar sólo a empresas con tickets RUNNING)
    this.ticketsActive.forEach(ticket => {
      this.websocketService.emit('enterCompany', ticket.id_company._id);
    })

    localStorage.setItem('tickets', JSON.stringify(this.tickets));
  }

  getUserTickets(txPlatform: string, txEmail: string): void {
    this.loading = true;
    this.publicService.getUserTickets(txPlatform, txEmail).subscribe((data: TicketsResponse) => {
      this.loading = false;
      if (data.ok) {
        this.updateTickets(data.tickets);
      }
    }, () => { this.loading = false; })
  }

  endTicket(ticket: Ticket): void {
    this.publicService.snack('Querés cancelar este turno?', 5000, 'CANCELAR').then((ok) => {
      if (ok) {
        const idTicket = ticket._id;
        const reqBy = 'client';
        this.publicService.endTicket(idTicket, reqBy).subscribe((resp: TicketResponse) => {
          if (resp.ok) {
            // le 'inyecto' id_company debido a que la respuesta de endTicket no popula id_company
            resp.ticket.id_company = ticket.id_company;
            this.publicService.updateStorageTickets(resp.ticket).then((tickets: Ticket[]) => {
              this.updateTickets(tickets);
              this.publicService.snack(`El ticket fué cancelado, te esperamos pronto.`, 5000);
            })
          }
        })
      }
    })
  }

  validateTicket(ticket: Ticket) {

    if (!this.customer) {
      return;
    }

    const idTicket = ticket._id;

    this.publicService.validateTicket(idTicket).subscribe((data: TicketResponse) => {
      if (data.ok) {
        this.publicService.updateStorageTickets(data.ticket).then((tickets: Ticket[]) => {
          this.updateTickets(tickets);
          this.publicService.snack(data.msg, 5000, 'Aceptar');
        })
      } else {
        // elimino de mis tickets el ticket waiting que expiró
        this.publicService.updateStorageTickets(data.ticket).then((tickets: Ticket[]) => {
          this.updateTickets(tickets);
        })
        this.publicService.snack(data.msg, 5000, 'Aceptar');
      }
    }, (err: HttpErrorResponse) => {
      // elimino de mis tickets el ticket waiting que expiró
      this.publicService.updateStorageTickets(err.error.ticket).then((tickets: Ticket[]) => {
        this.updateTickets(tickets);
      })
      this.publicService.snack(err.error.msg, 5000, 'Aceptar');
    });
  }

  showReserveDate(date: Date) {
    this.publicService.snack(this.capitalizar.transform(this.dateToString.transform(date, 'full')), 5000);
  }

}
