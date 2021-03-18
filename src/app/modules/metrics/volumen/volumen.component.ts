import { Component, OnInit } from '@angular/core';
import { MetricsService } from '../metrics.service';
import { LoginService } from '../../../services/login.service';
import { TicketsResponse } from '../../../interfaces/ticket.interface';
import { FormControl, FormGroup } from '@angular/forms';
import { Ticket } from 'src/app/interfaces/ticket.interface';

@Component({
  selector: 'app-volumen',
  templateUrl: './volumen.component.html',
  styleUrls: ['./volumen.component.css']
})
export class VolumenComponent implements OnInit {

  statusControl = new FormControl();
  statusList: any[] = [
    { tx_status: 'pending', tx_label: 'Pendientes' },
    { tx_status: 'scheduled', tx_label: 'Agendados' },
    { tx_status: 'queued', tx_label: 'En cola virtual' },
    { tx_status: 'assigned', tx_label: 'Asignados' },
    { tx_status: 'requested', tx_label: 'Requeridos' },
    { tx_status: 'provided', tx_label: 'Proveídos' },
    { tx_status: 'finished', tx_label: 'Finalizados' },
    { tx_status: 'cancelled', tx_label: 'Cancelados' },
  ];

  tickets: Ticket[] = [];
  ticketsFiltered: Ticket[] = [];
  
  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });
  

  constructor(
    private loginService: LoginService,
    private metricsService: MetricsService
  ) { }

  ngOnInit(): void {

    this.statusControl.valueChanges.subscribe(data => {
      this.ticketsFiltered = this.tickets.filter(ticket => data.includes(ticket.tx_status));
    })

    this.readTickets();
  }



  readTickets() {
    
    const idCompany = this.loginService.user.id_company._id;

    if(!idCompany) return;

    this.metricsService.readTickets(idCompany).subscribe((data: TicketsResponse) => {
      this.tickets = data.tickets;
    })

    let ahora = new Date();
    let ultimodia = new Date(ahora.getFullYear(), ahora.getMonth(), 0).getDate();

  }

}
