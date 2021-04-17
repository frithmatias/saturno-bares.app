import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// routes
import { AdminRoutingModule } from './admin-routing.module';

// modules
import { ComponentsModule } from 'src/app/components/components.module';
import { MaterialModule } from 'src/app/modules/material.module';
import { PipesModule } from 'src/app/pipes/pipes.module';

// components
import { AdminComponent } from './admin.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';

import { CompaniesComponent } from './config/companies/companies.component';
import { CompanyCreateComponent } from './config/companies/company-create/company-create.component';
import { TablesComponent } from './config/tables/tables.component';
import { TableCreateComponent } from './config/tables/table-create/table-create.component';
import { WaitersComponent } from './config/waiters/waiters.component';
import { WaiterCreateComponent } from './config/waiters/waiter-create/waiter-create.component';
import { SectionsComponent } from './config/sections/sections.component';
import { SectionCreateComponent } from './config/sections/section-create/section-create.component';
import { WizardComponent } from './wizard/wizard.component';
import { PollComponent } from './config/poll/poll.component';
import { PollCreateComponent } from './config/poll/poll-create/poll-create.component';
import { WebPageComponent } from './webpage/webpage.component';
import { ConfigComponent } from './config/config.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { PendingComponent } from './schedule/pending/pending.component';
import { BottomsheetComponent } from './schedule/bottomsheet/bottomsheet.component';
import { CalendarComponent } from './schedule/calendar/calendar.component';
import { SettingsComponent } from './config/settings/settings.component';
import { MessageComponent } from './config/message/message.component';
import { WorkingComponent } from './config/working/working.component';
import { CoverDialogComponent } from './webpage/cover-dialog/cover-dialog.component';
import { ClipboardModule } from '@angular/cdk/clipboard';


@NgModule({
	declarations: [
		AdminComponent,
		ToolbarComponent,
		HomeComponent,
		DashboardComponent,
		ProfileComponent,

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
		ConfigComponent,
		ScheduleComponent,
		PendingComponent,
		BottomsheetComponent,
		CalendarComponent,
		SettingsComponent,
		MessageComponent,
		WorkingComponent,
		CoverDialogComponent,
	],
	imports: [
		CommonModule,
		ReactiveFormsModule,
		FormsModule,
		MaterialModule,
		ComponentsModule,
		AdminRoutingModule,
		PipesModule,
		ClipboardModule
	]
})
export class AdminModule { }

