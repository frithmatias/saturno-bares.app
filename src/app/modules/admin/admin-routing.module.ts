import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NopagefoundComponent } from 'src/app/pages/nopagefound/nopagefound.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TablesComponent } from './settings/tables/tables.component';
import { WaitersComponent } from './settings/waiters/waiters.component';
import { CompaniesComponent } from './settings/companies/companies.component';
import { TicketsComponent } from './tickets/tickets.component';
import { SectionsComponent } from './settings/sections/sections.component';
import { WizardComponent } from './wizard/wizard.component';
import { PollComponent } from './settings/poll/poll.component';
import { WebPageComponent } from './webpage/webpage.component';
import { ProfileComponent } from './profile/profile.component';
import { SettingsComponent } from './settings/settings.component';
import { ScheduleComponent } from './schedule/schedule.component';

const userRoutes: Routes = [
  { path: 'home', component: HomeComponent, data: { titulo: 'Inicio' } },
  { path: 'profile', component: ProfileComponent, data: { titulo: 'Perfil' } },
  { path: 'wizard', component: WizardComponent, data: { titulo: 'Asistente' } },
  { path: 'companies', component: CompaniesComponent, data: { titulo: 'Comercios' } },
  { path: 'sections', component: SectionsComponent, data: { titulo: 'Sectores' } },
  { path: 'tables', component: TablesComponent, data: { titulo: 'Mesas' } },
  { path: 'waiters', component: WaitersComponent, data: { titulo: 'Camareros' } },
  { path: 'poll', component: PollComponent, data: { titulo: 'Encuestas' } },
  { path: 'webpage', component: WebPageComponent, data: { titulo: 'Página Web' } },
  { path: 'dashboard', component: DashboardComponent, data: { titulo: 'Dashboard' } },
  { path: 'tickets', component: TicketsComponent, data: { titulo: 'Tickets' } },
  { path: 'settings', component: SettingsComponent, data: { titulo: 'Ajustes' } },
  { path: 'schedule', component: ScheduleComponent, data: { titulo: 'Agenda' } },

  { path: '', redirectTo: '/admin/home', pathMatch: 'full' },
  { path: '**', component: NopagefoundComponent }

];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(userRoutes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
