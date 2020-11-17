import { Component, OnInit, Input } from '@angular/core';
import { Ticket } from 'src/app/interfaces/ticket.interface';

@Component({
  selector: 'app-queued',
  templateUrl: './queued.component.html',
  styleUrls: ['./queued.component.css']
})
export class QueuedComponent implements OnInit {
  @Input() tickets: Ticket[];
  waiting: Ticket[];
  constructor() { }

  ngOnInit(): void {
    this.waiting = this.tickets.filter(ticket => ticket.tx_status === 'queued' || ticket.tx_status === 'assigned');
  }

}
