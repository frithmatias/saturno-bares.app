import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NopagefoundComponent } from '../../pages/nopagefound/nopagefound.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DesktopsComponent } from './desktops/desktops.component';
import { AssistantsComponent } from './assistants/assistants.component';
import { SkillsComponent } from './skills/skills.component';
import { CompaniesComponent } from './companies/companies.component';
import { TicketsComponent } from './tickets/tickets.component';

const userRoutes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'companies', component: CompaniesComponent },
  { path: 'desktops', component: DesktopsComponent },
  { path: 'assistants', component: AssistantsComponent },
  { path: 'skills', component: SkillsComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'tickets', component: TicketsComponent },

	{ path: '', redirectTo: '/admin/home', pathMatch: 'full' },
  { path: '**', component: NopagefoundComponent}

];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(userRoutes)], 
  exports: [RouterModule]
})
export class AdminRoutingModule { }
