import { Component, Input, OnInit, Inject } from '@angular/core';
import { Ticket } from 'src/app/interfaces/ticket.interface';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-ticket-info',
  templateUrl: './ticket-info.component.html',
  styleUrls: ['./ticket-info.component.css']
})

export class TicketInfoComponent implements OnInit {
  ticket: Ticket;
  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: Ticket
   ) { this.ticket = data; }

  ngOnInit(): void {
  }

}
