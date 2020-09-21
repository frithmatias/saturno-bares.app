import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// ROUTES
import { AppRoutingModule } from './app-routing.module';

// SOCKET.IO 
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

// ENV
import { environment } from '../environments/environment';

// CONF
const config: SocketIoConfig = { url: environment.url, options: {} };


// COMPONENTS
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { ContactComponent } from './pages/contact/contact.component';
import { NopagefoundComponent } from './pages/nopagefound/nopagefound.component';

// MODULES
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from './modules/material.module';
import { ComponentsModule } from './components/components.module';

// GUARDS
import { AdminGuard } from './guards/admin.guard';
import { TokenGuard } from './guards/token.guard';
import { LoginGuard } from './guards/login.guard';

import { MAT_DATE_LOCALE } from '@angular/material/core';
import { HowWorksComponent } from './pages/how-works/how-works.component';
import { PricingComponent } from './pages/pricing/pricing.component';

@NgModule({
	declarations: [
		AppComponent,
		HomeComponent,
		RegisterComponent,
		LoginComponent,
		NopagefoundComponent,
		ContactComponent,
		HowWorksComponent,
		PricingComponent
	],
	imports: [
		MaterialModule,
		ComponentsModule,
		BrowserAnimationsModule,
		FormsModule,
		ReactiveFormsModule,
		HttpClientModule,
		AppRoutingModule,
		SocketIoModule.forRoot(config)
	],
	exports: [],
	providers: [
		AdminGuard,
		TokenGuard,
		LoginGuard,
		{provide: MAT_DATE_LOCALE, useValue: 'es'}
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
