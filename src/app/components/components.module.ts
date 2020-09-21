import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../modules/material.module';
import { PipesModule } from 'src/app/pipes/pipes.module';

import { ToolbarComponent } from './toolbar/toolbar.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { ChatComponent } from './chat/chat.component';
import { RouterModule } from '@angular/router';
import { SearchComponent } from './toolbar/search/search.component';

@NgModule({
  declarations: [
    ToolbarComponent,
    SidenavComponent,
    ChatComponent,
    SearchComponent
  ],
  imports: [
    RouterModule,
    CommonModule,
    MaterialModule,
    PipesModule
   ],
  exports: [
    ToolbarComponent,
    SidenavComponent,
    ChatComponent
  ]
})
export class ComponentsModule { }
