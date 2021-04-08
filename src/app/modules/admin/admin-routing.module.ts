import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NopagefoundComponent } from 'src/app/pages/nopagefound/nopagefound.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TablesComponent } from './config/tables/tables.component';
import { WaitersComponent } from './config/waiters/waiters.component';
import { CompaniesComponent } from './config/companies/companies.component';
import { SectionsComponent } from './config/sections/sections.component';
import { WizardComponent } from './wizard/wizard.component';
import { PollComponent } from './config/poll/poll.component';
import { WebPageComponent } from './webpage/webpage.component';
import { ProfileComponent } from './profile/profile.component';
import { ConfigComponent } from './config/config.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { MessageComponent } from './config/message/message.component';
import { SettingsComponent } from './config/settings/settings.component';
import { WorkingComponent } from './config/working/working.component';

const userRoutes: Routes = [
  { path: 'home', component: HomeComponent, data: { titulo: 'Inicio' } },
  { path: 'config', component: ConfigComponent, data: { titulo: 'Configuraciones' } },
    { path: 'messages', component: MessageComponent, data: { titulo: 'Mensajes' } },
    { path: 'settings', component: SettingsComponent, data: { titulo: 'Ajustes' } },
    { path: 'working', component: WorkingComponent, data: { titulo: 'Horarios Hábiles' } },
    { path: 'companies', component: CompaniesComponent, data: { titulo: 'Comercios' } },
    { path: 'sections', component: SectionsComponent, data: { titulo: 'Sectores' } },
    { path: 'tables', component: TablesComponent, data: { titulo: 'Mesas' } },
    { path: 'poll', component: PollComponent, data: { titulo: 'Encuestas' } },
    { path: 'waiters', component: WaitersComponent, data: { titulo: 'Camareros' } },
  { path: 'schedule', component: ScheduleComponent, data: { titulo: 'Agenda' } },
  { path: 'profile', component: ProfileComponent, data: { titulo: 'Perfil' } },
  { path: 'wizard', component: WizardComponent, data: { titulo: 'Asistente' } },
  { path: 'webpage', component: WebPageComponent, data: { titulo: 'Página Web' } },
  { path: 'dashboard', component: DashboardComponent, data: { titulo: 'Dashboard' } },

  { path: '', redirectTo: '/admin/home', pathMatch: 'full' },
  { path: '**', component: NopagefoundComponent }

];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(userRoutes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
