import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NopagefoundComponent } from '../../pages/nopagefound/nopagefound.component';
import { MenuComponent } from './menu/menu.component';
import { HomeComponent } from './home/home.component';

const publicRoutes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'menu', component: MenuComponent },
  { path: '**', component: NopagefoundComponent}
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(publicRoutes)], 
  exports: [RouterModule]
})
export class SuperuserRoutingModule { }
