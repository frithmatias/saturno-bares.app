import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuperuserComponent } from './superuser.component';
import { MenuComponent } from './menu/menu.component';
import { SuperuserRoutingModule } from './superuser-routing.module';
import { HomeComponent } from './home/home.component';
import { MenuCreateFormComponent } from './menu/menu-create-form/menu-create-form.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialModule } from '../../modules/material.module';



@NgModule({
  declarations: [
    SuperuserComponent, 
    MenuComponent, 
    HomeComponent, 
    MenuCreateFormComponent,
    
  ],
  imports: [
    CommonModule,
    SuperuserRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule
  ]
})
export class SuperuserModule { }
