import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { WebsocketService } from 'src/app/services/websocket.service';
import { Ticket } from '../../../../../api/models/ticket.model';
import { MessengerService } from './messenger.service';
import { MessageResponse } from '../../interfaces/messenger.interface';

@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.css']
})
export class MessengerComponent implements OnInit {
  @Input() ticket: Ticket;
  @Output() messageResponse: EventEmitter<MessageResponse> = new EventEmitter();
  loading = false;

  constructor(
    private websocketService: WebsocketService,
    private messengerService: MessengerService
  ) { }

  ngOnInit(): void {
  }

  sendMessage(message: HTMLTextAreaElement): void {


    if (message.value.length > 0) {
      this.loading = true;
      this.messengerService.sendMail(this.ticket.tx_email, message.value).subscribe((data: MessageResponse) => {
        if(data.ok){
          this.loading = false;
          this.messageResponse.emit(data);
        }
      }, (() => this.loading = false))
      // const to: string = this.ticket.id_socket_waiter;
      // this.websocketService.emit('mensaje-privado', { to, msg: message.value });
      message.value = '';
      message.focus();

    }
  }
}
