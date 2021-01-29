import { Component, OnInit, Input, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, AsyncValidatorFn, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

import { WebsocketService } from '../../../../services/websocket.service';
import { PublicService } from '../../public.service';

import { Section } from 'src/app/interfaces/section.interface';
import { TicketResponse, Ticket, TicketsResponse } from '../../../../interfaces/ticket.interface';
import { SectionsResponse } from '../../../../interfaces/section.interface';

import Swal from 'sweetalert2';
import { Company } from '../../../../interfaces/company.interface';
import { Subscription } from 'rxjs';

declare const gapi: any;


@Component({
  selector: 'app-ticket-create',
  templateUrl: './ticket-create.component.html',
  styleUrls: ['./ticket-create.component.css']
})
export class TicketCreateComponent implements OnInit {

  @Input() company: Company;
  @ViewChild('validateTicketGoogle') gButton: any;

  loading: boolean = false;
  sections: Section[] = [];
  ticket: Ticket = null;
  tickets: Ticket[] = [];
  ticketForm: FormGroup;
  minDate: Date;
  maxDate: Date;
  availability: any[] = [];
  availableTables: number[];
  updateTicketsSub: Subscription;
  auth2: any; // info de google con el token
  validateResponse: String;
  tellUserNotAvailable = false;
  showRequestTable = false;

  constructor(
    private wsService: WebsocketService,
    public publicService: PublicService,
    private router: Router
  ) {

    const currentYear = new Date().getFullYear();
    this.minDate = new Date(currentYear - 20, 0, 1);
    this.maxDate = new Date(currentYear + 1, 11, 31);

  }

  ngOnInit(): void {

    this.googleInit();



    if (!this.company) {
      this.publicService.snack('Por favor elegí un bar primero.', 2000);
      this.router.navigate(['/public']);
    } else {
      let idCompany = this.company._id;
      this.wsService.emit('enterCompany', idCompany);
      this.loading = true;
      this.publicService.readSections(idCompany).subscribe((data: SectionsResponse) => {
        this.loading = false;
        this.sections = data.sections;
      })
    }

    if (this.tickets.length === 0 && localStorage.getItem('tickets')) {
      this.tickets = JSON.parse(localStorage.getItem('tickets'));
    }

    console.table(this.tickets, ['tx_status', 'id_user', 'tx_platform', 'id_company.tx_company_name', '_id'])

    if (this.tickets.length > 0) {

      // obtengo si existe, el ticket activo
      const inactiveTickets = ['finished', 'cancelled', 'terminated']; // terminated filtered in backend.
      this.ticket = this.tickets.find(ticket => ticket.id_company._id === this.company._id && !inactiveTickets.includes(ticket.tx_status));

      // si existe ticket activo busco en la bd la última actualización de ESE ticket y lo actualizo en la local storage
      if (this.ticket) {
        this.publicService.getTicket(this.ticket._id).subscribe((data: TicketResponse) => {
          //IMPORTANTE: actualizo SÓLO el ticket activo, porque si tengo un ticket 'waiting' mi lista mas actualizada la tengo en la local storage
          this.ticket = data.ticket;
          this.publicService.updateStorageTickets(this.ticket).then((tickets: Ticket[]) => {
            this.tickets = tickets;
          })
        })
      }

    }

    this.updateTicketsSub = this.wsService.updateTicket().subscribe((ticket: Ticket) => {
      // id_company en el metodo provide() del backend NO viene populado
      ticket.id_company = this.ticket.id_company;
      this.ticket = ticket;
      this.publicService.updateStorageTickets(ticket);
    });

    this.ticketForm = new FormGroup({
      txName: new FormControl('', [Validators.required, Validators.maxLength(30)]),
      nmPersons: new FormControl('', [Validators.required, Validators.min(1), Validators.max(1000)]),
      idSection: new FormControl('', [Validators.required]),
      txWhen: new FormControl(''),
      dtReserve: new FormControl({ value: '', disabled: true }, [Validators.required]),
      tmReserve: new FormControl({ value: '', disabled: true }, [Validators.required]),
      cdTables: new FormControl({ value: '', disabled: true }, [Validators.required]),
    });


    // PERSONS CHANGE 
    this.ticketForm.controls.idSection.valueChanges.subscribe(data => {

      const nmPersons = this.ticketForm.controls.nmPersons.value;
      const idSection = this.ticketForm.controls.idSection.value;
      const dtReserve = this.ticketForm.controls.dtReserve.value;
      if (nmPersons && idSection && dtReserve) {
        this.readAvailability(nmPersons, idSection, dtReserve);
      }

      this.ticketForm.controls.tmReserve.reset();
      this.ticketForm.controls.cdTables.reset();
    })

    // SECTION CHANGE 
    this.ticketForm.controls.nmPersons.valueChanges.subscribe(data => {
      const nmPersons = this.ticketForm.controls.nmPersons.value;
      const idSection = this.ticketForm.controls.idSection.value;
      const dtReserve = this.ticketForm.controls.dtReserve.value;
      if (nmPersons && idSection && dtReserve) {
        this.readAvailability(nmPersons, idSection, dtReserve);
      }

      this.ticketForm.controls.tmReserve.reset();
      this.ticketForm.controls.cdTables.reset();
    })

    // WHEN CHANGE
    this.ticketForm.controls.txWhen.valueChanges.subscribe(data => {
      if (data === 'otrodia') {
        this.ticketForm.controls.dtReserve.enable();
      }
      if (data === 'ahora') {
        this.ticketForm.controls.dtReserve.reset();
        this.ticketForm.controls.tmReserve.reset();
        this.ticketForm.controls.cdTables.reset();
        this.ticketForm.controls.dtReserve.disable();
        this.ticketForm.controls.tmReserve.disable();
        this.ticketForm.controls.cdTables.disable();

      }
    })

    // DATE CHANGE
    this.ticketForm.controls.dtReserve.valueChanges.subscribe(data => {
      if (data) {
        const nmPersons = this.ticketForm.controls.nmPersons.value;
        const idSection = this.ticketForm.controls.idSection.value;
        const dtReserve = this.ticketForm.controls.dtReserve.value;
        if (nmPersons && idSection && dtReserve) {
          this.readAvailability(nmPersons, idSection, dtReserve);
        }
        this.ticketForm.controls.tmReserve.enable();

      }
    })

    // TIME CHANGE
    this.ticketForm.controls.tmReserve.valueChanges.subscribe(data => {
      if (data) {
        this.ticketForm.controls.cdTables.enable();
      }
    })

  }

  // ==========================================================
  // VALIDATE TICKET WITH GOOGLE
  // ==========================================================

  googleInit() {
    gapi.load('auth2', () => {
      this.auth2 = gapi.auth2.init({
        client_id: environment.gapi_uid,
        cookiepolicy: 'single_host_origin',
        scope: 'profile email'
      });
      this.attachSignin(this.gButton?._elementRef.nativeElement);
    });
  }

  attachSignin(element: HTMLButtonElement) {
    this.auth2.attachClickHandler(element, {}, googleUser => {
      const gtoken = googleUser.getAuthResponse().id_token;
      this.publicService.validateTicketGoogle(this.ticket._id, gtoken).subscribe((data: any) => {
        if (data.ok) {
          this.validateResponse = data.response;
        }
      });
    });
  }

  readAvailability(nmPersons: number, idSection: string, dtReserve: Date) {

    this.availability = [];
    this.ticketForm.controls.tmReserve.reset();

    this.publicService.readAvailability(nmPersons, idSection, dtReserve).subscribe((data: availabilityResponse) => {
      
      if (data.ok) { 
        // OK: TRUE -> Encontró mesas compatibles
        this.tellUserNotAvailable = false;
        data.availability.forEach(av => {

          av.interval = new Date(av.interval).getHours();

          if (av.tables.length > 0) {
            this.availability.push({ 
              disabled: false, 
              value: av.interval, 
              text: av.interval + ':00', 
              tables: av.tables 
            })
          } else {
            this.availability.push({ 
              disabled: true, 
              value: av.interval, 
              text: av.interval + ':00 No disponible', 
              tables: null
            })
          }
        })

      } else { 
        // OK: FALSE -> Solicitud de mesa, NO encontró mesas compatibles, el ticket quedará pending luego de confirmar. 
        this.tellUserNotAvailable = true;
        this.ticketForm.controls.cdTables.disable();
        data.availability.forEach(av => {
          this.availability.push({
            disabled: this.ticketForm.value.nmPersons > av.capacity,
            value: new Date(av.interval).getHours(),
            text: new Date(av.interval).getHours() + ':00 (' + av.capacity + ' Personas)',
            tables: [0]
          })
        })
      }

    })
  }

  createTicket(): void {

    if (this.ticketForm.invalid) {
      this.publicService.snack('Ingrese sector y cantidad de personas', 3000);
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
    let nmPersons = this.ticketForm.value.nmPersons;
    let idSection = this.ticketForm.value.idSection;

    let tmReserve = this.ticketForm.value.tmReserve || null;
    let dtReserve = this.ticketForm.value.dtReserve || null;

    let cdTables = this.ticketForm.value.cdTables; // 0 if not compatible tables
    this.loading = true;

    tmReserve = dtReserve ? new Date(dtReserve.getTime() + tmReserve * 60 * 60 * 1000) : null;

    this.publicService.createTicket(blContingent, idSocket, txName, nmPersons, idSection, tmReserve, cdTables).subscribe(
      (data: TicketResponse) => {
        if (data.ok) {
          this.loading = false;
          this.publicService.ticket = data.ticket;
          this.ticket = data.ticket;
          data.ticket.id_company = this.company;
          this.publicService.updateStorageTickets(data.ticket).then((tickets: Ticket[]) => {
            this.tickets = tickets;
          })
          // this.router.navigate(['/public/tickets']);
        }
      }, (err) => {
        this.loading = false;
        this.publicService.snack(err.error.msg, 5000)
      }
    );
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
  capacity: number;
}
