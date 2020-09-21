import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatBadgeModule } from '@angular/material/badge';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio'; 
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
	declarations: [],
	imports: [
		MatStepperModule,
		CommonModule,
		MatToolbarModule,
		MatSidenavModule,
		MatIconModule,
		MatButtonModule,
		MatSnackBarModule,
		MatInputModule,
		MatBadgeModule,
		MatListModule,
		MatSelectModule,
		MatAutocompleteModule,
		MatMenuModule,
		MatSlideToggleModule,
		MatExpansionModule,
		MatCheckboxModule,
		MatRadioModule,
		MatDatepickerModule,
		MatNativeDateModule,
		MatProgressSpinnerModule
	],
	exports: [
		MatStepperModule,
		CommonModule,
		MatToolbarModule,
		MatSidenavModule,
		MatIconModule,
		MatButtonModule,
		MatSnackBarModule,
		MatInputModule,
		MatBadgeModule,
		MatListModule,
		MatSelectModule,
		MatAutocompleteModule,
		MatMenuModule,
		MatSlideToggleModule,
		MatExpansionModule,
		MatCheckboxModule,
		MatRadioModule,
		MatDatepickerModule,
		MatNativeDateModule,
		MatProgressSpinnerModule
	]
})
export class MaterialModule { }
