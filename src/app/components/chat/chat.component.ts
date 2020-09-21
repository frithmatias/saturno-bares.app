import { Component, OnInit, Output, EventEmitter, Input, SimpleChange, OnDestroy } from '@angular/core';
import { WebsocketService } from '../../services/websocket.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { timer, Subscription } from 'rxjs';
import { PublicService } from 'src/app/modules/public/public.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  @Input() chatOpenStatus: boolean;
  @Output() unreadMessages: EventEmitter<number> = new EventEmitter();
  @Output() toggleChat: EventEmitter<boolean> = new EventEmitter();
  chatOpen: boolean;
  timerSubscription: Subscription;
  escucharMensajesSub: Subscription;

  constructor(
    private wsService: WebsocketService, 
    private snack: MatSnackBar, 
    public publicService: PublicService
    ) { }

  ngOnChanges(changes: any) {
    this.chatOpen = changes.chatOpenStatus.currentValue;
    if(this.chatOpen){
      for(let message of this.publicService.chatMessages){
        message.viewed = true;
      }
    }
  }
  
  ngOnInit(): void {
    this.escucharMensajesSub = this.wsService.escucharMensajes().subscribe((data: any) => {
      let message = {
        own: false,
        time: new Date(),
        message: data.msg,
        viewed: this.chatOpen ? true : false,
      }
      this.publicService.chatMessages.push(message);
      if(!this.chatOpen){
        let numUnread = this.publicService.chatMessages.filter(message => message.viewed === false).length;
        this.unreadMessages.emit(numUnread);
      } else {
        this.scrollTop();
      }
    })
  }

  sendMessage(message: HTMLTextAreaElement, chatref: HTMLElement): void {
    if (!this.wsService.idSocket) {
      this.snack.open('Se perdió la conexión con el asistente.', 'ACEPTAR', { duration: 1000 });
      return;
    }

    if (message.value.length > 0) {
      this.publicService.chatMessages.push({
        own: true,
        time: new Date(),
        message: message.value,
        viewed: true
      });

      let to: string;
      if(this.publicService.ticket.id_socket === this.wsService.idSocket){
        to = this.publicService.ticket.id_socket_desk;
      } else {
        to = this.publicService.ticket.id_socket;
      } 
      this.wsService.emit('mensaje-privado', { to, msg: message.value });
      this.scrollTop();
      message.value = '';
      message.focus();
    }
  }

  scrollTop(): void {
    // espero 100ms por la demora del template en renderear los mensajes.
    this.timerSubscription = timer(100).subscribe(() => {
      const chatref = document.getElementById('chatmessages');
      chatref.scrollTop = chatref.scrollHeight - chatref.clientHeight;
    })
  }

  closeChat(): void {
    this.toggleChat.emit(true);
  }

  ngOnDestroy(): void {
    if(this.timerSubscription) {this.timerSubscription.unsubscribe();}
    if(this.escucharMensajesSub) {this.escucharMensajesSub.unsubscribe();}
  }

}
