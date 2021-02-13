import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../modules/material.module';
import { PipesModule } from 'src/app/pipes/pipes.module';

import { UploaderDirective } from './uploader/uploader.directive';

import { ToolbarComponent } from './toolbar/toolbar.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { ChatComponent } from './chat/chat.component';
import { SearchComponent } from './search/search.component';
import { MapComponent } from './map/map.component';
import { UploaderComponent } from './uploader/uploader.component';
import { ButtonComponent } from './button/button.component';
import { BottomsheetComponent } from './bottomsheet/bottomsheet.component';
import { ThemeComponent } from './theme/theme.component';
import { SocialComponent } from './social/social.component';

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
    BottomsheetComponent,
    ThemeComponent,
    SocialComponent
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
    ButtonComponent,
    UploaderComponent,
    ThemeComponent,
    SocialComponent
  ]
})
export class ComponentsModule { }
