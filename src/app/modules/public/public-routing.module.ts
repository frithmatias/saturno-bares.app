import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NopagefoundComponent } from '../../pages/nopagefound/nopagefound.component';
import { PublicComponent } from './public.component';
import { CompanyPageComponent } from './company-page/company-page.component';
import { HomeComponent } from 'src/app/pages/home/home.component';
import { TicketsComponent } from './tickets/tickets.component';

const publicRoutes: Routes = [

  { path: 'companypage', component: CompanyPageComponent },
  { path: 'tickets/:txPlatform/:idUser', component: TicketsComponent },
	{ path: 'tickets', component: TicketsComponent },
  { path: '', component: HomeComponent },
  { path: ':txCompanyString', component: PublicComponent },
  { path: '**', component: NopagefoundComponent}
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(publicRoutes)], 
  exports: [RouterModule]
})
export class PublicRoutingModule { }
 