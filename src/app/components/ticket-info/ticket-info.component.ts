import { Component, Input, OnInit, Inject } from '@angular/core';
import { Ticket } from 'src/app/interfaces/ticket.interface';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-ticket-info',
  templateUrl: './ticket-info.component.html',
  styleUrls: ['./ticket-info.component.css']
})

export class TicketInfoComponent implements OnInit {
  @Input() ticket: Ticket;
  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: Ticket
   ) { 
     
     // el componente ticket-info puede ser "inyectado" directamente en un bottomsheet o puede ser "consumido"
     // desde una vista con <app-ticket-info [ticket]="ticket">, en este caso la data del ticket se recibe desde @Input() ticket.
     this.ticket = this.ticket ? this.ticket : data; 

     }

  ngOnInit(): void { }

}
