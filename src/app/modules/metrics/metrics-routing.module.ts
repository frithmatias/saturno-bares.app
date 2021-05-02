import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// components
import { NopagefoundComponent } from '../../pages/nopagefound/nopagefound.component';
import { AtencionComponent } from './atencion/atencion.component';
import { CanceladosComponent } from './cancelados/cancelados.component';
import { OcioComponent } from './ocio/ocio.component';
import { PendientesComponent } from './pendientes/pendientes.component';
import { PuntualidadComponent } from './puntualidad/puntualidad.component';
import { SatisfaccionComponent } from './satisfaccion/satisfaccion.component';
import { VolumenComponent } from './volumen/volumen.component';

const metricsRoutes: Routes = [
  { path: 'atencion', component: AtencionComponent, data: { titulo: 'Atención' } },
  { path: 'cancelados', component: CanceladosComponent, data: { titulo: 'Cancelados' } },
  { path: 'ocio', component: OcioComponent, data: { titulo: 'Ocio' } },
  { path: 'pendientes', component: PendientesComponent, data: { titulo: 'Pendientes' } },
  { path: 'puntualidad', component: PuntualidadComponent, data: { titulo: 'Puntualidad' } },
  { path: 'satisfaccion', component: SatisfaccionComponent, data: { titulo: 'Satisfacción' } },
  { path: 'volumen', component: VolumenComponent, data: { titulo: 'Volúmen' } },

  { path: '**', component: NopagefoundComponent }
];


@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(metricsRoutes)],
  exports: [RouterModule]
})
export class MetricsRoutingModule { }
