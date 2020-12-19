import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// components
import { NopagefoundComponent } from '../../pages/nopagefound/nopagefound.component';
import { SectionComponent } from './section/section.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';

const waiterRoutes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'section', component: SectionComponent },
  { path: 'dashboard', component: DashboardComponent },
  
	{ path: '', redirectTo: '/waiter/home', pathMatch: 'full' },
  { path: '**', component: NopagefoundComponent}
];


@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(waiterRoutes)], 
  exports: [RouterModule]
})
export class WaiterRoutingModule { }
