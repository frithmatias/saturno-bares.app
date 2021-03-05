import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// routes
import { AdminRoutingModule } from './admin-routing.module';

// modules
import { ComponentsModule } from 'src/app/components/components.module';
import { MaterialModule } from 'src/app/modules/material.module';
import { QRCodeModule } from 'angularx-qrcode';
import { PipesModule } from 'src/app/pipes/pipes.module';

// components
import { AdminComponent } from './admin.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { TicketsComponent } from './tickets/tickets.component';

import { CompaniesComponent } from './settings/companies/companies.component';
import { CompanyCreateComponent } from './settings/companies/company-create/company-create.component';
import { TablesComponent } from './settings/tables/tables.component';
import { TableCreateComponent } from './settings/tables/table-create/table-create.component';
import { WaitersComponent } from './settings/waiters/waiters.component';
import { WaiterCreateComponent } from './settings/waiters/waiter-create/waiter-create.component';
import { SectionsComponent } from './settings/sections/sections.component';
import { SectionCreateComponent } from './settings/sections/section-create/section-create.component';
import { WizardComponent } from './wizard/wizard.component';
import { PollComponent } from './settings/poll/poll.component';
import { PollCreateComponent } from './settings/poll/poll-create/poll-create.component';
import { WebPageComponent } from './webpage/webpage.component';
import { SettingsComponent } from './settings/settings.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { PendingComponent } from './schedule/pending/pending.component';
import { BottomsheetComponent } from './schedule/bottomsheet/bottomsheet.component';
import { CalendarComponent } from './schedule/calendar/calendar.component';
import { ModulesComponent } from './settings/modules/modules.component';
import { MessageComponent } from './settings/message/message.component';
import { WorkingComponent } from './settings/working/working.component';

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
		ScheduleComponent,
		PendingComponent,
		BottomsheetComponent,
		CalendarComponent,
		ModulesComponent,
		MessageComponent,
		WorkingComponent,
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

