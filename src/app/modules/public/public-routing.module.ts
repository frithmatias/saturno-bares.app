import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TicketsComponent } from './tickets/tickets.component';
import { ScreenComponent } from './screen/screen.component';
import { SearchComponent } from './search/search.component';
import { NopagefoundComponent } from '../../pages/nopagefound/nopagefound.component';
import { PublicComponent } from './public.component';
import { MyticketComponent } from './myticket/myticket.component';

const publicRoutes: Routes = [
  { path: 'tickets', component: TicketsComponent },
	{ path: 'myticket', component: MyticketComponent },
  { path: 'screen', component: ScreenComponent },
  { path: '', component: SearchComponent },
  { path: ':company', component: PublicComponent },
  { path: '**', component: NopagefoundComponent}
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(publicRoutes)], 
  exports: [RouterModule]
})
export class PublicRoutingModule { }
