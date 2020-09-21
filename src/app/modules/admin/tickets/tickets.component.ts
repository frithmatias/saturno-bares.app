import { Component, OnInit } from '@angular/core';
import { Ticket } from 'src/app/interfaces/ticket.interface';
import { TicketsResponse } from '../../../interfaces/ticket.interface';
import { LoginService } from '../../../services/login.service';
import { PublicService } from 'src/app/modules/public/public.service';

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.css']
})
export class TicketsComponent implements OnInit {

  tickets: Ticket[] = [];

  constructor(
    private loginService: LoginService,
    private publicService: PublicService 
  ) { }

  ngOnInit(): void {
    this.readTickets();
  }

  readTickets(): void {
    let idCompany = this.loginService.user.id_company?._id;
    this.publicService.getTickets(idCompany).subscribe((data: TicketsResponse) => {
      this.tickets = data.tickets;
    })
  }


}
