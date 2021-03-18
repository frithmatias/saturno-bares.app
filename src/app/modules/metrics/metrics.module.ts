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
import { MaterialModule } from '../material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../../pipes/pipes.module';


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
    MetricsRoutingModule,
    ReactiveFormsModule,
    MaterialModule,
    PipesModule
  ]
})
export class MetricsModule { }
