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
import { SearchComponent } from './search/search.component';
import { MyticketComponent } from './myticket/myticket.component';
import { TicketsComponent } from './tickets/tickets.component';
import { ScreenComponent } from './screen/screen.component';


@NgModule({
	declarations: [
		ScreenComponent,
		TicketsComponent,
		PublicComponent,
		SearchComponent,
		MyticketComponent
	],
	imports: [
		CommonModule,
		ReactiveFormsModule,
		FormsModule,
		MaterialModule,
		ComponentsModule,
		PublicRoutingModule,
		PipesModule
	]
})
export class PublicModule { }

