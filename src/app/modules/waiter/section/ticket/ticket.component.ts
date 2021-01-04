import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SharedService } from '../../../../services/shared.service';
import { WaiterService } from '../../waiter.service';
import { TicketResponse } from '../../../../interfaces/ticket.interface';
import { Ticket } from 'src/app/interfaces/ticket.interface';

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.css']
})
export class TicketComponent implements OnInit {

  ticket: Ticket;
  ticketForm: FormGroup;

  constructor(
    public sharedService: SharedService,
    public waiterService: WaiterService
  ) { }

  ngOnInit(): void {
    console.log(this)
    this.ticketForm = new FormGroup({
      txName: new FormControl('', [Validators.required]),
      nmPersons: new FormControl('', [Validators.required]),
      idSection: new FormControl('', [Validators.required]),
    });
  }
  createTicket(): void {

    if (this.ticketForm.invalid) {
      this.sharedService.snack('Ingrese sector y cantidad de personas', 3000);
      return;
    }

    let blContingent = true;
    let idSocket = null;
    let txName = this.ticketForm.value.txName;
    let nmPersons = this.ticketForm.value.nmPersons;
    let idSection = this.ticketForm.value.idSection;

    this.waiterService.createTicket(blContingent, idSocket, txName, nmPersons, idSection).subscribe(
      (data: TicketResponse) => {
        if (data.ok) {
          this.ticket = data.ticket;
          console.log(data.ticket)
        }
      }
    );
  }

}
