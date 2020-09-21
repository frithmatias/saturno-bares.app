import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// routes
import { AssistantRoutingModule } from './assistant-routing.module';

// modules
import { MaterialModule } from '../../modules/material.module';
import { PipesModule } from 'src/app/pipes/pipes.module';

// components
import { AssistantComponent } from './assistant.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DesktopComponent } from './desktop/desktop.component';


@NgModule({
  declarations: [
    AssistantComponent, 
    HomeComponent,
    DashboardComponent, 
    DesktopComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    MaterialModule,
    PipesModule,
    AssistantRoutingModule
  ],
  exports:[]
})
export class AssistantModule { }
