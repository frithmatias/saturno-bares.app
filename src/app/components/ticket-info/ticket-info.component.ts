import { Component, Input, OnInit, Inject } from '@angular/core';
import { Ticket } from 'src/app/interfaces/ticket.interface';

@Component({
  selector: 'app-ticket-info',
  templateUrl: './ticket-info.component.html',
  styleUrls: ['./ticket-info.component.css']
})
export class TicketInfoComponent implements OnInit {
  @Input() ticket: Ticket;
  constructor( ) { }

  ngOnInit(): void {
  }

}
