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
import { MetricsComponent } from './metrics.component';
import { MaterialModule } from '../material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../../pipes/pipes.module';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { ComponentsModule } from '../../components/components.module';


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
    ToolbarComponent
  ],
  imports: [
    CommonModule,
    ComponentsModule,
    MetricsRoutingModule,
    ReactiveFormsModule,
    MaterialModule,
    PipesModule
  ]
})
export class MetricsModule { }
