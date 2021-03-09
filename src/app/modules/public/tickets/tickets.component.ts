import { Component, OnInit } from '@angular/core';
import { Ticket } from 'src/app/interfaces/ticket.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicService } from '../public.service';
import { TicketsResponse, TicketResponse } from '../../../interfaces/ticket.interface';
import { FormControl } from '@angular/forms';
import { Social } from '../../../components/social/social.component';
import { User } from 'src/app/interfaces/user.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { WebsocketService } from '../../../services/websocket.service';



@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.css']
})
export class TicketsComponent implements OnInit {

  loading = false;
  social: Social; // customer logged with social
  customer: User; // customer logged with email

  tickets: Ticket[] = [];
  ticketsActive: Ticket[] = [];
  ticketsInactive: Ticket[] = [];
  activeTickets = ['waiting', 'pending', 'scheduled', 'queued', 'requested', 'assigned', 'provided']; // terminated filtered in backend.
  updateTicketsSub: Subscription;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public publicService: PublicService,
    private websocketService: WebsocketService
  ) { }

  ngOnInit(): void {

    this.checkSession();

  }

  checkSession(){
        // Get social data
    
        if (localStorage.getItem('customer')) {
          this.customer = JSON.parse(localStorage.getItem('customer'));
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

  getUserTickets(txPlatform: string, txEmail: string): void {
    this.loading = true;

    this.publicService.getUserTickets(txPlatform, txEmail).subscribe((data: TicketsResponse) => {
      this.loading = false;
      if (data.ok) {
        this.tickets = data.tickets;

        // ------------------------
        // backup de tickes waiting en la localstorage
        if (localStorage.getItem('tickets')) {
          const waiting: Ticket[] = JSON.parse(localStorage.getItem('tickets')).filter((ticket: Ticket) => ticket.tx_status === 'waiting');
          if (waiting.length > 0) { this.tickets.push(...waiting); }
        }
        // ------------------------

        this.tickets = this.tickets.sort((b, a) => +new Date(a.tm_reserve) - +new Date(b.tm_reserve));
        this.ticketsActive = this.tickets.filter(ticket => this.activeTickets.includes(ticket.tx_status));
        this.ticketsInactive = this.tickets.filter(ticket => !this.activeTickets.includes(ticket.tx_status));
        localStorage.setItem('tickets', JSON.stringify(this.tickets));
        console.table(this.tickets, ['tx_status', 'id_company[tx_company_name]', 'id_user', 'tx_platform', 'id_company.tx_company_name', 'tm_reserve', '_id'])
      }
    }, () => { this.loading = false; })
  }

  endTicket(ticket: Ticket): void {
    this.publicService.snack('Desea cancelar este ticket? perderá la reserva', 5000, 'Si, Cancelar').then((cancellResponse) => {
      if (cancellResponse) {
        const idTicket = ticket._id;
        const reqBy = 'client';
        this.publicService.endTicket(idTicket, reqBy).subscribe((resp: TicketResponse) => {
          if (resp.ok) {
            // le 'inyecto' id_company debido a que la respuesta de endTicket no popula id_company
            resp.ticket.id_company = ticket.id_company;
            this.publicService.updateStorageTickets(resp.ticket).then((tickets: Ticket[]) => {
              this.tickets = tickets;
              this.router.navigate(['/home']);
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
          this.tickets = tickets;
          this.tickets = this.tickets.sort((b, a) => +new Date(a.tm_reserve) - +new Date(b.tm_reserve));
          this.ticketsActive = this.tickets.filter(ticket => this.activeTickets.includes(ticket.tx_status));
          this.ticketsInactive = this.tickets.filter(ticket => !this.activeTickets.includes(ticket.tx_status));
          this.publicService.snack(data.msg, 5000, 'Aceptar');
        })
      } else {
        // elimino de mis tickets el ticket waiting que expiró
        this.publicService.updateStorageTickets(data.ticket).then((tickets: Ticket[]) => {
          this.tickets = tickets;
          this.ticketsActive = this.tickets.filter(ticket => this.activeTickets.includes(ticket.tx_status));
          this.ticketsInactive = this.tickets.filter(ticket => !this.activeTickets.includes(ticket.tx_status));

        })
        this.publicService.snack(data.msg, 5000, 'Aceptar');
      }
    }, (err: HttpErrorResponse) => {
      // elimino de mis tickets el ticket waiting que expiró
      this.publicService.updateStorageTickets(err.error.ticket).then((tickets: Ticket[]) => {
        this.tickets = tickets;
        this.ticketsActive = this.tickets.filter(ticket => this.activeTickets.includes(ticket.tx_status));
        this.ticketsInactive = this.tickets.filter(ticket => !this.activeTickets.includes(ticket.tx_status));
      })
      this.publicService.snack(err.error.msg, 5000, 'Aceptar');
    });
  }

}
