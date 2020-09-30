import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// routes
import { WaiterRoutingModule } from './waiter-routing.module';

// modules
import { MaterialModule } from '../material.module';
import { PipesModule } from 'src/app/pipes/pipes.module';

// components
import { WaiterComponent } from './waiter.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SectionComponent } from './section/section.component';


@NgModule({
  declarations: [
    WaiterComponent, 
    HomeComponent,
    DashboardComponent, 
    SectionComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    MaterialModule,
    PipesModule,
    WaiterRoutingModule
  ],
  exports:[]
})
export class WaiterModule { }
