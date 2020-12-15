import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { WebsocketService } from '../../../../services/websocket.service';
import { PublicService } from '../../public.service';

import { Section } from 'src/app/interfaces/section.interface';
import { TicketResponse } from '../../../../interfaces/ticket.interface';
import { SectionsResponse } from '../../../../interfaces/section.interface';
import { SharedService } from 'src/app/services/shared.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {

  loading: boolean = false;
  sections: Section[] = [];
  ticketForm: FormGroup;

  constructor(
    private wsService: WebsocketService,
    public publicService: PublicService,
    public sharedService: SharedService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.ticketForm = new FormGroup({
      nmPersons: new FormControl('', [Validators.required]),
      idSection: new FormControl('', [Validators.required]),
    });

    if (this.publicService.ticket) {
      this.sharedService.snack('Ya tenés un turno!', 2000);
      this.router.navigate(['/public/myticket']);
    } else {
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
    }
  }

  createTicket(): void {

    if(this.ticketForm.invalid){
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

    this.loading = true;
    let idSocket = this.wsService.idSocket;
    let nmPersons = this.ticketForm.value.nmPersons;
    let idSection = this.ticketForm.value.idSection;

    this.loading = true;
    this.publicService.createTicket(idSocket, nmPersons, idSection).subscribe(
      (data: TicketResponse) => {
        if (data.ok) {
          this.loading = false;
          localStorage.setItem('ticket', JSON.stringify(data.ticket));
          this.publicService.ticket = data.ticket;
          this.router.navigate(['/public/myticket']);
        }
      }
    );
  }

  salir(): void {
    this.publicService.clearPublicSession();
    this.router.navigate(['/home'])
  }
}
