import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NopagefoundComponent } from '../../pages/nopagefound/nopagefound.component';
import { PublicComponent } from './public.component';
import { CompanyPageComponent } from './company-page/company-page.component';
import { HomeComponent } from 'src/app/pages/home/home.component';
import { TicketsComponent } from './tickets/tickets.component';
import { TicketComponent } from './ticket/ticket.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

const publicRoutes: Routes = [

  { path: 'companypage', component: CompanyPageComponent, data: { titulo: 'Página Web' } },
  { path: 'login', component: LoginComponent, data: { titulo: 'Login Cliente' } },
  { path: 'register', component: RegisterComponent, data: { titulo: 'Registro Cliente' } },
  { path: 'tickets', component: TicketsComponent, data: { titulo: 'Mis Reservas' } },
	{ path: 'ticket/:idTicket', component: TicketComponent, data: { titulo: 'Mi Reserva' } },
  { path: '', component: HomeComponent, data: { titulo: 'Inicio' } },
  { path: ':txCompanyString', component: PublicComponent },
  { path: '**', component: NopagefoundComponent}
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(publicRoutes)], 
  exports: [RouterModule]
})
export class PublicRoutingModule { }
 