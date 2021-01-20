import { Component, OnInit } from '@angular/core';
import { Ticket } from 'src/app/interfaces/ticket.interface';
import { ActivatedRoute } from '@angular/router';
import { PublicService } from '../public.service';
import { TicketsResponse } from '../../../interfaces/ticket.interface';

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.css']
})
export class TicketsComponent implements OnInit {

  tickets: Ticket[] = [];

  constructor(
    private route: ActivatedRoute,
    public publicService: PublicService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((data: any) => {
      if (data.txPlatform && data.idUser) {
        this.getUserTickets(data.txPlatform, data.idUser);
      }
    })
  }

  getUserTickets(txPlatform: string, idUser: string): void {
    this.publicService.getUserTickets(txPlatform, idUser).subscribe((data: TicketsResponse) => {
      if(data.ok){
        this.tickets = data.tickets;
      }
    })
  }


}
