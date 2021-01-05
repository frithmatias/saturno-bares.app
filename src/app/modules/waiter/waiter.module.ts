import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
import { QueuedComponent } from './section/queued/queued.component';
import { TablesComponent } from './section/tables/tables.component';
import { SectionsComponent } from './section/sections/sections.component';
import { ProfileComponent } from './profile/profile.component';
import { ComponentsModule } from '../../components/components.module';
import { TableInfoComponent } from './section/tables/table-info/table-info.component';
import { TicketComponent } from './section/ticket/ticket.component';



@NgModule({
  declarations: [
    WaiterComponent,
    HomeComponent,
    DashboardComponent,
    SectionComponent,
    QueuedComponent,
    TablesComponent,
    SectionsComponent,
    ProfileComponent,
    TableInfoComponent,
    TicketComponent
  ],
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    ComponentsModule,
    MaterialModule,
    PipesModule,
    WaiterRoutingModule
  ],
  exports: []
})
export class WaiterModule { }
