import { Component, OnInit } from '@angular/core';
import { Ticket } from 'src/app/interfaces/ticket.interface';
import { ActivatedRoute } from '@angular/router';
import { PublicService } from '../public.service';
import { TicketsResponse, TicketResponse } from '../../../interfaces/ticket.interface';
import { FormControl } from '@angular/forms';




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

    this.route.params.subscribe((data: any) => {
      if (data.txPlatform && data.idUser) {
        this.txPlatform = data.txPlatform;
        this.idUser = data.idUser;
        this.getUserTickets(data.txPlatform, data.idUser);
      }
    })



  }

  getUserTickets(txPlatform: string, idUser: string): void {
    this.publicService.getUserTickets(txPlatform, idUser).subscribe((data: TicketsResponse) => {
      if (data.ok) {
        this.tickets = data.tickets.sort((b,a) => +new Date(a.tm_start) - +new Date(b.tm_start) );
        console.log(this.tickets)
        this.ticketsFiltered = this.tickets.filter(ticket => this.statusControl.value.includes(ticket.tx_status));
        console.table(this.tickets, ['tx_status', 'tm_reserve'])
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
              console.table(this.tickets, ['tx_status', 'tm_reserve'])
              this.publicService.snack(`Gracias por avisarnos ${ticket.tx_name}, el ticket fué cancelado. Te esperamos pronto!.`, 5000);
            })
          }
        })
      }
    })
  }
}
