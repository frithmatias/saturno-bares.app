
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { WaiterService } from '../../waiter.service';
import { TicketResponse } from '../../../../interfaces/ticket.interface';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { PublicService } from '../../../public/public.service';

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.css']
})
export class TicketComponent implements OnInit {

  ticketForm: FormGroup;

  constructor(
    public publicService: PublicService,
    public waiterService: WaiterService,
    private bottomSheetRef: MatBottomSheetRef<TicketComponent>
  ) { }

  ngOnInit(): void {
    this.ticketForm = new FormGroup({
      txName: new FormControl('', [Validators.required, Validators.maxLength(30)]),
      nmPersons: new FormControl('', [Validators.required, Validators.min(1), Validators.max(1000)]),
      idSection: new FormControl('', [Validators.required]),
    });
  }

  createTicket(): void {

    if (this.ticketForm.invalid) {
      this.publicService.snack('Ingrese sector y cantidad de personas', 3000);
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
          this.waiterService.contingentTicket = data.ticket;
          this.bottomSheetRef.dismiss();
        }
      }
    );
  }

}
