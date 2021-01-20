import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// routes
import { AdminRoutingModule } from './admin-routing.module';

// modules
import { ComponentsModule } from '../../components/components.module';
import { MaterialModule } from '../../modules/material.module';
import { QRCodeModule } from 'angularx-qrcode';
import { PipesModule } from 'src/app/pipes/pipes.module';

// components
import { AdminComponent } from './admin.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { TicketsComponent } from './tickets/tickets.component';

import { CompaniesComponent } from './companies/companies.component';
import { CompanyCreateComponent } from './companies/company-create/company-create.component';
import { TablesComponent } from './tables/tables.component';
import { TableCreateComponent } from './tables/table-create/table-create.component';
import { WaitersComponent } from './waiters/waiters.component';
import { WaiterCreateComponent } from './waiters/waiter-create/waiter-create.component';
import { SectionsComponent } from './sections/sections.component';
import { SectionCreateComponent } from './sections/section-create/section-create.component';
import { WizardComponent } from './wizard/wizard.component';
import { PollComponent } from './poll/poll.component';
import { PollCreateComponent } from './poll/poll-create/poll-create.component';
import { WebPageComponent } from './webpage/webpage.component';
import { SettingsComponent } from './settings/settings.component';
import { ScheduleComponent } from './schedule/schedule.component';

@NgModule({
	declarations: [
		AdminComponent,
		HomeComponent,
		DashboardComponent,
		ProfileComponent,
		TicketsComponent,
		
		CompaniesComponent,
		CompanyCreateComponent,
		
		SectionsComponent,
		SectionCreateComponent,
		
		TablesComponent,
		TableCreateComponent,
		
		WaitersComponent,
		WaiterCreateComponent,
		WizardComponent,
		PollComponent,
		PollCreateComponent,
		WebPageComponent,
		SettingsComponent,
		ScheduleComponent

	],
	imports: [
		CommonModule,
		ReactiveFormsModule,
		FormsModule,
		MaterialModule,
		ComponentsModule,
		AdminRoutingModule,
		PipesModule,
		QRCodeModule
	]
})
export class AdminModule { }

