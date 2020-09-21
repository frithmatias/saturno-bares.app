import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// components
import { NopagefoundComponent } from '../../pages/nopagefound/nopagefound.component';
import { DesktopComponent } from './desktop/desktop.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const assistantRoutes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'desktop', component: DesktopComponent },
  { path: 'dashboard', component: DashboardComponent },
  
	{ path: '', redirectTo: '/assistant/home', pathMatch: 'full' },
  { path: '**', component: NopagefoundComponent}
];


@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(assistantRoutes)], 
  exports: [RouterModule]
})
export class AssistantRoutingModule { }
