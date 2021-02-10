import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// components
import { NopagefoundComponent } from '../../pages/nopagefound/nopagefound.component';
import { SectionComponent } from './section/section.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';

const waiterRoutes: Routes = [
  { path: 'home', component: HomeComponent, data: { titulo: 'Inicio' } },
  { path: 'profile', component: ProfileComponent, data: { titulo: 'Perfil' } },
  { path: 'section', component: SectionComponent, data: { titulo: 'Sector' } },
  { path: 'dashboard', component: DashboardComponent, data: { titulo: 'Dashboard' } },
  
	{ path: '', redirectTo: '/waiter/home', pathMatch: 'full' },
  { path: '**', component: NopagefoundComponent}
];


@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(waiterRoutes)], 
  exports: [RouterModule]
})
export class WaiterRoutingModule { }
