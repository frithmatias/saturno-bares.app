import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// routes
import { MetricsRoutingModule } from './metrics-routing.module';

// components
import { OcioComponent } from './ocio/ocio.component';
import { PendientesComponent } from './pendientes/pendientes.component';
import { PuntualidadComponent } from './puntualidad/puntualidad.component';
import { CanceladosComponent } from './cancelados/cancelados.component';
import { VolumenComponent } from './volumen/volumen.component';
import { AtencionComponent } from './atencion/atencion.component';
import { SatisfaccionComponent } from './satisfaccion/satisfaccion.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MetricsComponent } from './metrics.component';


@NgModule({
  declarations: [
    MetricsComponent,
    OcioComponent, 
    PendientesComponent, 
    PuntualidadComponent, 
    CanceladosComponent, 
    VolumenComponent, 
    AtencionComponent, 
    SatisfaccionComponent, 
    DashboardComponent
  ],
  imports: [
    CommonModule,
    MetricsRoutingModule
  ]
})
export class MetricsModule { }
