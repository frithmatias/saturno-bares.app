import { Component, OnInit } from '@angular/core';
import { Ticket } from 'src/app/interfaces/ticket.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicService } from '../public.service';
import { TicketsResponse, TicketResponse } from '../../../interfaces/ticket.interface';
import { FormControl } from '@angular/forms';
import { Social } from '../../../components/social/social.component';



@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.css']
})
export class TicketsComponent implements OnInit {

  loading = false;
  social: Social;
  tickets: Ticket[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public publicService: PublicService
  ) { }

  ngOnInit(): void {

    // Get social data
    if (localStorage.getItem('social')) {
      this.social = JSON.parse(localStorage.getItem('social'));
      const txPlatform = this.social.txPlatform;
      const idUser = this.social.idUser;
      if (txPlatform && idUser) {
        this.getUserTickets(txPlatform, idUser); // update tickets
      }
    }

  }

  getUserTickets(txPlatform: string, idUser: string): void {
    this.loading = true;
    this.publicService.getUserTickets(txPlatform, idUser).subscribe((data: TicketsResponse) => {
      this.loading = false;
      if (data.ok) {
        this.tickets = data.tickets;
        this.tickets = this.tickets.sort((b, a) => +new Date(a.tm_start) - +new Date(b.tm_start));
        localStorage.setItem('tickets', JSON.stringify(this.tickets));
        console.table(this.tickets, ['tx_status', 'id_user', 'tx_platform', 'id_company.tx_company_name', 'tm_reserve', '_id'])
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
              this.publicService.snack(`Gracias por avisarnos ${ticket.tx_name}, el ticket fué cancelado. Te esperamos pronto!.`, 5000);
            })
          }
        })
      }
    })
  }


  socialResponse(response: Social) {
    
    if (response === null) {
      if (localStorage.getItem('tickets')) { localStorage.removeItem('tickets'); }
      this.social = null;
      this.tickets = [];
      return;
    } else {
      this.social = response;
    }

    if (response.txPlatform && response.idUser) {
      this.getUserTickets(response.txPlatform, response.idUser); // update tickets
    }
  }
}
