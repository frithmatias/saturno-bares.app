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
import { SearchComponent } from './search/search.component';
import { MyticketComponent } from './myticket/myticket.component';
import { CompanyPageComponent } from './company-page/company-page.component';
import { HomeComponent } from './company-page/home/home.component';
import { MenuComponent } from './company-page/menu/menu.component';
import { TableComponent } from './company-page/table/table.component';


@NgModule({
	declarations: [
		CompanyPageComponent,
		PublicComponent,
		SearchComponent,
		MyticketComponent,
		HomeComponent,
		MenuComponent,
		TableComponent
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

