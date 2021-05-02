import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuperuserComponent } from './superuser.component';
import { MenuComponent } from './menu/menu.component';
import { SuperuserRoutingModule } from './superuser-routing.module';
import { HomeComponent } from './home/home.component';
import { MenuCreateFormComponent } from './menu/menu-create-form/menu-create-form.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialModule } from '../../modules/material.module';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { ComponentsModule } from '../../components/components.module';
import { ChatComponent } from './chat/chat.component';
import { PipesModule } from '../../pipes/pipes.module';
import { ChatNotInitComponent } from './chat-not-init/chat-not-init.component';
import { BsheetComponent } from './chat-not-init/bsheet/bsheet.component';
import { CompaniesComponent } from './companies/companies.component';



@NgModule({
  declarations: [
    SuperuserComponent,
    ToolbarComponent,
    MenuComponent,
    HomeComponent,
    MenuCreateFormComponent,
    ChatComponent,
    ChatNotInitComponent,
    BsheetComponent,
    CompaniesComponent
  ],
  imports: [
    CommonModule,
    ComponentsModule,
    SuperuserRoutingModule,
    ReactiveFormsModule,
    PipesModule,
    FormsModule,
    MaterialModule
  ]
})
export class SuperuserModule { }
