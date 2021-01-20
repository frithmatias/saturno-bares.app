import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, AsyncValidatorFn, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';

import { WebsocketService } from '../../../../services/websocket.service';
import { PublicService } from '../../public.service';

import { Section } from 'src/app/interfaces/section.interface';
import { TicketResponse, Ticket } from '../../../../interfaces/ticket.interface';
import { SectionsResponse } from '../../../../interfaces/section.interface';
import { SharedService } from 'src/app/services/shared.service';

import Swal from 'sweetalert2';
import { Company } from '../../../../interfaces/company.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ticket-create',
  templateUrl: './ticket-create.component.html',
  styleUrls: ['./ticket-create.component.css']
})
export class TicketCreateComponent implements OnInit {
  loading: boolean = false;
  sections: Section[] = [];
  ticket: Ticket;
  ticketForm: FormGroup;
  minDate: Date;
  maxDate: Date;
  availability: any[] = [];
  availableTables: number[];
  updateSub: Subscription;

  constructor(
    private wsService: WebsocketService,
    public publicService: PublicService,
    public sharedService: SharedService,
    private router: Router
  ) {

    const currentYear = new Date().getFullYear();
    this.minDate = new Date(currentYear - 20, 0, 1);
    this.maxDate = new Date(currentYear + 1, 11, 31);

  }

  ngOnInit(): void {


    // after validate with telegram, whatsapp, or gmail, server send newTicket 
    this.updateSub = this.wsService.updatePrivate().subscribe((ticket: Ticket) => {
      this.sharedService.snack('TICKET ACUTALIZADO RECIBIDO', 10000)
      this.ticket = ticket;
      this.publicService.ticket = ticket;
      localStorage.setItem('ticket', JSON.stringify(ticket));
    });

    if (!this.ticket) {
      if (this.publicService.ticket) {
        this.ticket = this.publicService.ticket;
      } else {
        if (localStorage.getItem('ticket')) {
          this.ticket = JSON.parse(localStorage.getItem('ticket'));
        }
      }
    }

    if (!this.publicService.company) {
      this.sharedService.snack('Por favor elegí un bar primero.', 2000);
      this.router.navigate(['/public']);
    } else {
      let idCompany = this.publicService.company._id;
      this.wsService.emit('enterCompany', idCompany);
      this.loading = true;
      this.publicService.readSections(idCompany).subscribe((data: SectionsResponse) => {
        this.loading = false;
        this.sections = data.sections;
      })
    }






    this.ticketForm = new FormGroup({
      txName: new FormControl('', [Validators.required, Validators.maxLength(30)]),
      nmPersons: new FormControl('', [Validators.required, Validators.min(1), Validators.max(1000)]),
      idSection: new FormControl('', [Validators.required]),
      txWhen: new FormControl(''),
      txContact: new FormControl('', [Validators.required, Validators.maxLength(30)]),
      nmPhone: new FormControl('', [Validators.required, Validators.max(999999999999)]),
      txEmail: new FormControl('', [Validators.required, Validators.maxLength(30), Validators.email]),
      dtReserve: new FormControl({ value: '', disabled: true }, [Validators.required]),
      tmReserve: new FormControl({ value: '', disabled: true }, [Validators.required]),
      cdTables: new FormControl({ value: '', disabled: true }, [Validators.required]),

    });


    // TX_WHEN 
    this.ticketForm.controls.txWhen.valueChanges.subscribe(data => {
      if (data === 'ahora') {
        this.ticketForm.get('dtReserve').clearValidators();
        this.ticketForm.get('tmReserve').clearValidators();
        this.ticketForm.get('cdTables').clearValidators();
        this.ticketForm.get('txEmail').updateValueAndValidity();
      }
    })

    // TX_CONTACT: REMOVE REQUIRED VALIDATOR FROM TXEMAIL OR NMPHONE
    this.ticketForm.controls.txContact.valueChanges.subscribe(data => {
      if (data === 'whatsapp' || data === 'telegram') {
        this.ticketForm.get('txEmail').clearValidators();
        this.ticketForm.get('txEmail').updateValueAndValidity();
      }

      if (data === 'email') {
        this.ticketForm.get('nmPhone').clearValidators();
        this.ticketForm.get('nmPhone').updateValueAndValidity();
      }
    })

    // PERSONS CHANGE 
    this.ticketForm.controls.idSection.valueChanges.subscribe(data => {
      this.ticketForm.controls.dtReserve.reset();
      this.ticketForm.controls.tmReserve.reset();
      this.ticketForm.controls.cdTables.reset();
    })

    // SECTION CHANGE 
    this.ticketForm.controls.nmPersons.valueChanges.subscribe(data => {
      this.ticketForm.controls.dtReserve.reset();
      this.ticketForm.controls.tmReserve.reset();
      this.ticketForm.controls.cdTables.reset();
    })

    // DATE CHANGE
    this.ticketForm.controls.dtReserve.valueChanges.subscribe(data => {
      if (data) {
        this.ticketForm.controls.tmReserve.enable();
      }
    })

    // INTERVAL CHANGE
    this.ticketForm.controls.tmReserve.valueChanges.subscribe(data => {
      if (data) {
        this.ticketForm.controls.cdTables.enable();
      }
    })

    //FORM CHANGES
    this.ticketForm.valueChanges.subscribe(data => {
      if (data.txName && data.nmPersons && data.idSection) {
        this.ticketForm.controls.dtReserve.enable({ emitEvent: false });
      } else {
        this.ticketForm.controls.dtReserve.disable({ emitEvent: false });
        this.ticketForm.controls.tmReserve.disable({ emitEvent: false });
      }
    })



  }



  createTicket(): void {


    if (this.ticketForm.invalid) {
      this.sharedService.snack('Ingrese sector y cantidad de personas', 3000);
      return;
    }

    if (localStorage.getItem('user')) {
      Swal.fire({
        icon: 'error',
        title: 'Estás haciendo pruebas?',
        text: 'Estás en una página de acceso al público pero tenés una sesión de usuario activa. Para obtener un turno tenés cerrar la sesión de usuario o abrir una pestaña en modo incógnito.',
      })
      return;
    }

    let blContingent = false;
    let idSocket = this.wsService.idSocket;
    let txName = this.ticketForm.value.txName;
    let txContact = this.ticketForm.value.txContact;
    let nmPhone = this.ticketForm.value.nmPhone;
    let txEmail = this.ticketForm.value.txEmail;
    let nmPersons = this.ticketForm.value.nmPersons;
    let idSection = this.ticketForm.value.idSection;

    let tmReserve = this.ticketForm.value.tmReserve || null;
    let dtReserve = this.ticketForm.value.dtReserve || null;

    let cdTables = this.ticketForm.value.cdTables
    this.loading = true;

    tmReserve = new Date(dtReserve.getTime() + tmReserve * 60 * 60 * 1000);
    this.publicService.createTicket(blContingent, idSocket, txName, nmPersons, idSection, nmPhone, txEmail, tmReserve, cdTables).subscribe(
      (data: TicketResponse) => {
        if (data.ok) {
          this.loading = false;

          localStorage.setItem('ticket', JSON.stringify(data.ticket));
          this.publicService.ticket = data.ticket;
          this.ticket = data.ticket;
          // this.router.navigate(['/public/tickets']);
        }
      }, (err) => {
        this.loading = false;
        this.sharedService.snack(err.error.msg, 5000)
      }
    );
  }

  readAvailableTables(availableTables: number[]) {
    this.availableTables = availableTables;
  }

  readAvailableDates() {

    this.availability = [];
    this.ticketForm.controls.tmReserve.reset();

    let nmPersons = this.ticketForm.value.nmPersons;
    let idSection = this.ticketForm.value.idSection;
    let dtReserve = this.ticketForm.value.dtReserve;

    this.publicService.readAvailableDates(nmPersons, idSection, dtReserve).subscribe((data: availabilityResponse) => {
      if (data.ok) {

        // construct intervals available
        data.availability.forEach(av => {
          if (av.tables.length > 0) {
            this.availability.push({ disabled: false, value: av.interval, text: av.interval + ':00', tables: av.tables })
          } else {
            this.availability.push({ disabled: true, value: av.interval, text: av.interval + ':00 No disponible' })
          }
        })



      }
    })
  }

  salir(): void {
    this.publicService.clearPublicSession();
    this.router.navigate(['/home'])
  }
}

interface availabilityResponse {
  ok: boolean;
  msg: string;
  availability: availability[];
}

interface availability {
  interval: number;
  tables: number[];
}
