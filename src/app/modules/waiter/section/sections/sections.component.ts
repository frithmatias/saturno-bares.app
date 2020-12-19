import { Component, OnInit, Input } from '@angular/core';
import { Section } from '../../../../interfaces/section.interface';
import { WaiterService } from '../../waiter.service';
import { LoginService } from 'src/app/services/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sections',
  templateUrl: './sections.component.html',
  styleUrls: ['./sections.component.css']
})
export class SectionsComponent implements OnInit {


  @Input() tablesDataBySection: any;
  @Input() ticketsDataBySection: any;

  displayedColumns: string[] = ['sector', 'mesas_ocupadas', 'mesas_disponibles', 'mesas_pausadas', 'turnos_requeridos', 'turnos_encolados'];

  section: Section;

  constructor(
    public loginService: LoginService,
    public waiterService: WaiterService
  ) { }

  ngOnInit(): void { }

}
