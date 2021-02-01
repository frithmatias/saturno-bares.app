import { Component, OnInit } from '@angular/core';
import { Ticket } from 'src/app/interfaces/ticket.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicService } from '../public.service';
import { TicketsResponse, TicketResponse } from '../../../interfaces/ticket.interface';
import { FormControl } from '@angular/forms';
import { outputResponse } from '../../../components/social/social.component';

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.css']
})
export class TicketsComponent implements OnInit {


  statusControl = new FormControl();

  statusList: any[] = [
    { tx_status: 'pending', tx_label: 'Pendientes' },
    { tx_status: 'scheduled', tx_label: 'Agendados' },
    { tx_status: 'queued', tx_label: 'En cola virtual' },
    { tx_status: 'assigned', tx_label: 'Asignados' },
    { tx_status: 'requested', tx_label: 'Requeridos' },
    { tx_status: 'provided', tx_label: 'Proveídos' },
    { tx_status: 'finished', tx_label: 'Finalizados' },
    { tx_status: 'cancelled', tx_label: 'Cancelados' },
  ];


  tickets: Ticket[] = [];
  ticketsFiltered: Ticket[] = [];
  ticket: Ticket;
  txPlatform: string;
  idUser: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public publicService: PublicService
  ) { }

  ngOnInit(): void {
    
    if (!this.statusControl.value) {
      this.statusControl.setValue(['pending', 'scheduled', 'queued', 'assigned', 'requested', 'provided'])
    }

    this.statusControl.valueChanges.subscribe(data => {
      this.ticketsFiltered = this.tickets.filter(ticket => data.includes(ticket.tx_status));
    })

    if(this.tickets.length === 0 && localStorage.getItem('tickets')){
      this.tickets = JSON.parse(localStorage.getItem('tickets'));
    }

    if(this.tickets.length > 0){
      const txPlatform = this.tickets[0].tx_platform;
      const idUser = this.tickets[0].id_user;
      this.getUserTickets(txPlatform, idUser); // update tickets
    }

  }

  getUserTickets(txPlatform: string, idUser: string): void {

    this.publicService.getUserTickets(txPlatform, idUser).subscribe((data: TicketsResponse) => {
      if (data.ok) {
        this.tickets = data.tickets.sort((b, a) => +new Date(a.tm_start) - +new Date(b.tm_start));
        console.table(this.tickets, ['tx_status', 'id_user', 'tx_platform', 'id_company.tx_company_name', 'tm_reserve', '_id'])
        this.ticketsFiltered = this.tickets.filter(ticket => this.statusControl.value.includes(ticket.tx_status));
        localStorage.setItem('tickets', JSON.stringify(data.tickets));
      }
    })
  }

  endTicket(ticket: Ticket): void {
    this.publicService.snack('Desea cancelar este ticket? perderá la reserva', 5000, 'SI, CANCELAR').then((cancellResponse) => {
      if (cancellResponse) {
        const idTicket = ticket._id;
        this.publicService.endTicket(idTicket).subscribe((resp: TicketResponse) => {
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


  socialResponse(response: outputResponse){
    const txPlatform = response.txPlatform;
    const idUser = response.idUser;
    this.getUserTickets(txPlatform, idUser);
  }
}
