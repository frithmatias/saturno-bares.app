import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// components
import { SuperuserComponent } from './modules/superuser/superuser.component';
import { MetricsComponent } from './modules/metrics/metrics.component';
import { AdminComponent } from './modules/admin/admin.component';
import { WaiterComponent } from './modules/waiter/waiter.component';
import { PublicComponent } from './modules/public/public.component';

// pages
import { HomeComponent } from './pages/home/home.component';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { NopagefoundComponent } from './pages/nopagefound/nopagefound.component';
import { ContactComponent } from './pages/contact/contact.component';
import { HowWorksComponent } from './pages/how-works/how-works.component';

// guards
import { LoginGuard } from './guards/login.guard';
import { TokenGuard } from './guards/token.guard';
import { AdminGuard } from './guards/admin.guard';
import { SuperuserGuard } from './guards/superuser.guard';
import { PricingComponent } from './pages/pricing/pricing.component';
import { VideoComponent } from './pages/video/video.component';


const appRoutes: Routes = [

	{ path: 'home', component: HomeComponent, data: {titulo: 'Inicio'} },
	{ path: 'login', component: LoginComponent, data: {titulo: 'Ingresar'} },
	{ path: 'register', component: RegisterComponent, data: {titulo: 'Registrarme'} },
	{ path: 'contact', component: ContactComponent, data: {titulo: 'Contacto'} },
	{ path: 'howworks', component: HowWorksComponent, data: {titulo: 'Como Funciona'} },
	{ path: 'pricing', component: PricingComponent, data: {titulo: 'Pricing'} },
	{ path: 'video', component: VideoComponent, data: {titulo: 'Video'} },


	{ path: 'public',
	  component: PublicComponent,
	  loadChildren: () => import('./modules/public/public.module').then((m) => m.PublicModule),
	  data: {titulo: 'Publico'}},
	
	{ path: 'waiter',
	  canLoad: [LoginGuard, TokenGuard],
	  component: WaiterComponent,
	  loadChildren: () => import('./modules/waiter/waiter.module').then((m) => m.WaiterModule),
	  data: {titulo: 'Camarero'}},
	
	{ path: 'admin',
	  canLoad: [LoginGuard, TokenGuard, AdminGuard],
	  component: AdminComponent,
	  loadChildren: () => import('./modules/admin/admin.module').then((m) => m.AdminModule),
	  data: {titulo: 'Admin'}},
	
	{ path: 'superuser',
	  canLoad: [LoginGuard, TokenGuard, SuperuserGuard],
	  component: SuperuserComponent,
	  loadChildren: () => import('./modules/superuser/superuser.module').then((m) => m.SuperuserModule),
	  data: {titulo: 'SuperUser'}},
	
	{ path: 'metrics',
	  canLoad: [LoginGuard, TokenGuard, AdminGuard ], //PlanBasicGuard
	  component: MetricsComponent,
	  loadChildren: () => import('./modules/metrics/metrics.module').then((m) => m.MetricsModule),
	  data: {titulo: 'Métricas'}},
	  
	{ path: '', redirectTo: '/home', pathMatch: 'full' },
	{ path: '**', component: NopagefoundComponent }
];

@NgModule({
	declarations: [],
	imports: [RouterModule.forRoot(appRoutes)],
	exports: [
		RouterModule
	]
})
export class AppRoutingModule { }
