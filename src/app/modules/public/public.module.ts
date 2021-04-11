import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// routes
import { PublicRoutingModule } from './public-routing.module';

// modules
import { MaterialModule } from '../../modules/material.module';
import { ComponentsModule } from '../../components/components.module';
import { PipesModule } from 'src/app/pipes/pipes.module';

// components
import { PublicComponent } from './public.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { WebPageComponent } from './webpage/webpage.component';
import { HomeComponent } from './webpage/home/home.component';
import { MenuComponent } from './webpage/menu/menu.component';
import { TicketCreateComponent } from './webpage/ticket-create/ticket-create.component';
import { TicketsComponent } from './tickets/tickets.component';
import { TicketComponent } from './ticket/ticket.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';


@NgModule({
	declarations: [
		ToolbarComponent,
		PublicComponent,
		WebPageComponent,
		TicketCreateComponent,
		HomeComponent,
		MenuComponent,
		TicketComponent,
		TicketsComponent,
		LoginComponent,
		RegisterComponent,
	],
	imports: [
		CommonModule,
		ReactiveFormsModule,
		FormsModule,
		MaterialModule,
		ComponentsModule,
		PublicRoutingModule,
		PipesModule,
	]
})
export class PublicModule { }

