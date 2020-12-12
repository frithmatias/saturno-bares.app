import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SearchComponent } from './search/search.component';
import { NopagefoundComponent } from '../../pages/nopagefound/nopagefound.component';
import { PublicComponent } from './public.component';
import { MyticketComponent } from './myticket/myticket.component';
import { CompanyPageComponent } from './company-page/company-page.component';

const publicRoutes: Routes = [
  { path: 'companypage', component: CompanyPageComponent },
	{ path: 'myticket', component: MyticketComponent },
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
 