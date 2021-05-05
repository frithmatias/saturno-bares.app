import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../modules/material.module';
import { PipesModule } from 'src/app/pipes/pipes.module';

import { UploaderDirective } from './uploader/uploader.directive';

import { SidenavComponent } from './sidenav/sidenav.component';
import { ChatComponent } from './chat/chat.component';
import { SearchComponent } from './search/search.component';
import { MapComponent } from './map/map.component';
import { UploaderComponent } from './uploader/uploader.component';
import { ButtonComponent } from './button/button.component';
import { BottomsheetComponent } from './bottomsheet/bottomsheet.component';
import { ThemeComponent } from './toolbar/theme/theme.component';
import { SocialComponent } from './social/social.component';
import { MessengerComponent } from './messenger/messenger.component';
import { SpinnerComponent } from './spinner/spinner.component';
import { HelpComponent } from './help/help.component';
import { TicketInfoComponent } from './ticket-info/ticket-info.component';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { UserimageComponent } from './toolbar/userimage/userimage.component';
import { NotificationsComponent } from './toolbar/notifications/notifications.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { MenuComponent } from './toolbar/menu/menu.component';

@NgModule({
  declarations: [
    SidenavComponent,
    ChatComponent,
    SearchComponent,
    MapComponent,
    UploaderComponent,
    UploaderDirective,
    ButtonComponent,
    BottomsheetComponent,
    ThemeComponent,
    SocialComponent,
    MessengerComponent,
    SpinnerComponent,
    HelpComponent,
    TicketInfoComponent,
    UserimageComponent,
    NotificationsComponent,
    ToolbarComponent,
    MenuComponent,
  ],
  imports: [
    RouterModule,
    CommonModule,
    MaterialModule,
    PipesModule
  ],
  providers: [
    { provide: MatBottomSheetRef, useValue: {} },
    { provide: MAT_BOTTOM_SHEET_DATA, useValue: {} }
  ],
  exports: [
    SidenavComponent,
    ChatComponent,
    SearchComponent,
    MapComponent,
    ButtonComponent,
    UploaderComponent,
    ThemeComponent,
    SocialComponent,
    MessengerComponent,
    SpinnerComponent,
    HelpComponent,
    TicketInfoComponent,
    UserimageComponent,
    ToolbarComponent

  ]
})
export class ComponentsModule { }
