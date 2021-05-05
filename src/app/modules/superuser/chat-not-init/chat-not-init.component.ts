import { Component, OnInit } from '@angular/core';
import { SuperuserService } from '../superuser.service';
import { chatSession, chatsSessionsResponse } from '../../../interfaces/chat.session.interface';
import { Subscription } from 'rxjs';
import { WebsocketService } from '../../../services/websocket.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { BsheetComponent } from './bsheet/bsheet.component';

@Component({
  selector: 'app-chat-not-init',
  templateUrl: './chat-not-init.component.html',
  styleUrls: ['./chat-not-init.component.css']
})
export class ChatNotInitComponent implements OnInit {

  chatsNotInit: chatSession[] = [];
  updateClientsListSub: Subscription;
  displayedColumns: string[] = ['tx_name', 'tm_start', 'tm_duration', 'bl_subject'];

  constructor(
    private wsService: WebsocketService,
    private superuserService: SuperuserService,
    private bottomSheet: MatBottomSheet

  ) { }

  ngOnInit(): void {
    this.updateClientsListSub = this.wsService.updateClientsList().subscribe(data => {
      // update on connect and disconnect 
      this.readChatsNotInit();
    })

    this.readChatsNotInit();

  }

  readChatsNotInit() {
    this.superuserService.readChatsNotInit().subscribe((data: chatsSessionsResponse) => {
      console.log(data)
      this.chatsNotInit = data.sessions;
    })
  }

  ngOnDestroy() {
    if (this.updateClientsListSub) { this.updateClientsListSub?.unsubscribe(); }
  }


  openBottomSheet(session: chatSession) {
    this.bottomSheet.open(BsheetComponent, { data: { session } }).afterDismissed().subscribe((data) => {
    })
  }

}
