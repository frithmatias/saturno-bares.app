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
import { DashboardComponent } from './dashboard/dashboard.component';

const metricsRoutes: Routes = [
   { path: 'atencion', component: AtencionComponent },
   { path: 'cancelados', component: CanceladosComponent },
   { path: 'ocio', component: OcioComponent },
   { path: 'pendientes', component: PendientesComponent },
   { path: 'puntualidad', component: PuntualidadComponent },
   { path: 'satisfaccion', component: SatisfaccionComponent },
   { path: 'volumen', component: VolumenComponent },
   { path: 'dashboard', component: DashboardComponent },

	{ path: '', redirectTo: '/metrics/dashboard', pathMatch: 'full' },
  { path: '**', component: NopagefoundComponent}
];


@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(metricsRoutes)], 
  exports: [RouterModule]
})
export class MetricsRoutingModule { }
