import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// routes
import { PublicRoutingModule } from './public-routing.module';

// modules
import { MaterialModule } from '../../modules/material.module';
import { ComponentsModule } from '../../components/components.module';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { NgImageSliderModule } from 'ng-image-slider';

// components
import { PublicComponent } from './public.component';
import { CompanyPageComponent } from './company-page/company-page.component';
import { HomeComponent } from './company-page/home/home.component';
import { MenuComponent } from './company-page/menu/menu.component';
import { TicketCreateComponent } from './company-page/ticket-create/ticket-create.component';
import { TicketsComponent } from './tickets/tickets.component';
import { TicketComponent } from './ticket/ticket.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';


@NgModule({
	declarations: [
		CompanyPageComponent,
		PublicComponent,
		TicketCreateComponent,
		HomeComponent,
		MenuComponent,
		TicketComponent,
		TicketsComponent,
		LoginComponent,
		RegisterComponent
	],
	imports: [
		CommonModule,
		ReactiveFormsModule,
		FormsModule,
		MaterialModule,
		ComponentsModule,
		PublicRoutingModule,
		PipesModule,
		NgImageSliderModule
	]
})
export class PublicModule { }

