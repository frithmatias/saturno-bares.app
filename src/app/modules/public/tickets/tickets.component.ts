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


  statusControl = new FormControl();
  loading = false;

  statusList: any[] = [
    { tx_status: 'waiting', tx_label: 'Esperando Confirmación' },
    { tx_status: 'pending', tx_label: 'Pendientes' },
    { tx_status: 'scheduled', tx_label: 'Agendados' },
    { tx_status: 'queued', tx_label: 'En cola virtual' },
    { tx_status: 'assigned', tx_label: 'Asignados' },
    { tx_status: 'requested', tx_label: 'Requeridos' },
    { tx_status: 'provided', tx_label: 'Proveídos' },
    { tx_status: 'finished', tx_label: 'Finalizados' },
    { tx_status: 'cancelled', tx_label: 'Cancelados' },
  ];

  social: Social;
  tickets: Ticket[] = [];
  ticketsFiltered: Ticket[] = [];
  ticket: Ticket;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public publicService: PublicService
  ) { }

  ngOnInit(): void {

    // estados del select por defecto
    if (!this.statusControl.value) {
      this.statusControl.setValue(['waiting', 'pending', 'scheduled', 'queued', 'assigned', 'requested', 'provided', 'cancelled', 'finished'])
    }

    // si cambian los valores actualizo el array
    this.statusControl.valueChanges.subscribe(data => {
      this.ticketsFiltered = this.tickets.filter(ticket => data.includes(ticket.tx_status));
    })


    // Get social data
    if (this.tickets.length === 0 && localStorage.getItem('social')) {
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
    // si en la localstorage había un ticket 'waiting' lo extraigo para salvarlo 
    let waiting: Ticket[] = [];
    if (localStorage.getItem('tickets')) {
      waiting = JSON.parse(localStorage.getItem('tickets')).filter((ticket: Ticket) => ticket.tx_status === 'waiting');
    }

    this.loading = true;

    this.publicService.getUserTickets(txPlatform, idUser).subscribe((data: TicketsResponse) => {
      this.loading = false;
      if (data.ok) {
        this.tickets = data.tickets;
        if (waiting.length > 0) { this.tickets.push(...waiting); }
        this.tickets = this.tickets.sort((b, a) => +new Date(a.tm_start) - +new Date(b.tm_start));
        console.table(this.tickets, ['tx_status', 'id_user', 'tx_platform', 'id_company.tx_company_name', 'tm_reserve', '_id'])
        this.ticketsFiltered = this.tickets.filter(ticket => this.statusControl.value.includes(ticket.tx_status));
        localStorage.setItem('tickets', JSON.stringify(data.tickets));
      }
    }, (() => { this.loading = false; }))
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
              this.ticketsFiltered = tickets.filter(ticket => this.statusControl.value.includes(ticket.tx_status));
              this.router.navigate(['/home']);
              this.publicService.snack(`Gracias por avisarnos ${ticket.tx_name}, el ticket fué cancelado. Te esperamos pronto!.`, 5000);
            })
          }
        })
      }
    })
  }


  socialResponse(response: Social) {
    console.log(response)
    this.social = response;
    if (this.social.txPlatform && this.social.idUser) {
      this.getUserTickets(this.social.txPlatform, this.social.idUser); // update tickets
    }
  }
}
