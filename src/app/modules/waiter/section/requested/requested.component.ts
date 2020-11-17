import { Component, OnInit, Input } from '@angular/core';
import { Ticket } from 'src/app/interfaces/ticket.interface';

@Component({
  selector: 'app-requested',
  templateUrl: './requested.component.html',
  styleUrls: ['./requested.component.css']
})
export class RequestedComponent implements OnInit {

  @Input() tickets: Ticket[];
  requested: Ticket[];
  constructor() { }

  ngOnInit(): void {
    this.requested = this.tickets.filter(ticket => ticket.tx_status === 'requested');
  }

}
