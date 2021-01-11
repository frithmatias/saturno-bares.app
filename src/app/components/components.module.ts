import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../modules/material.module';
import { PipesModule } from 'src/app/pipes/pipes.module';

import { ToolbarComponent } from './toolbar/toolbar.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { ChatComponent } from './chat/chat.component';
import { RouterModule } from '@angular/router';
import { SearchComponent } from './toolbar/search/search.component';
import { MapComponent } from './map/map.component';
import { UploaderComponent } from './uploader/uploader.component';
import { UploaderDirective } from './uploader/uploader.directive';
import { ButtonComponent } from './button/button.component';
import { BottomsheetComponent } from './bottomsheet/bottomsheet.component';

@NgModule({
  declarations: [
    ToolbarComponent,
    SidenavComponent,
    ChatComponent,
    SearchComponent,
    MapComponent,
    UploaderComponent,
    UploaderDirective,
    ButtonComponent,
    BottomsheetComponent
    
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
    ChatComponent,
    SearchComponent,
    MapComponent,
    UploaderComponent


  ]
})
export class ComponentsModule { }
