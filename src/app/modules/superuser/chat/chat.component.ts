import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { WebsocketService } from '../../../services/websocket.service';
import { PublicService } from '../../public/public.service';
import { SuperuserService } from '../superuser.service';
import { chatsSessionsResponse, chatSession, chatSessionResponse } from '../../../interfaces/chat.session.interface';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {


  chatsSessions: chatSession[] = [];
  chatSession: chatSession; // chat session selected

  timerSubscription: Subscription;
  updateClientsListSub: Subscription;
  escucharChatFinished: Subscription;
  escucharChat: Subscription;

  chatMessages: {
    own: boolean,
    time: Date,
    message: string,
    viewed: boolean
  }[] = [];


  constructor(
    private wsService: WebsocketService,
    private publicService: PublicService,
    private superuserService: SuperuserService
  ) { }



  ngOnInit(): void {
    this.wsService.emit('enterCompany', 'superuser');

    this.updateClientsListSub = this.wsService.updateClientsList().subscribe(data => {
      // update on connect and disconnect 
      this.readChatsRequests();
    })

    this.escucharChatFinished = this.wsService.escucharChatFinished().subscribe((data: any) => {
      // other side cancel session
      this.readChatsRequests();
      delete this.chatSession;
      this.chatMessages = [];

    })

    this.escucharChat = this.wsService.escucharChat().subscribe((msg: string) => {

      let message = {
        own: false,
        time: new Date(),
        message: msg,
        viewed: true,
      }
      this.chatMessages.push(message);
      this.scrollTop();

    })

    this.readChatsRequests();
  }

  scrollTop(): void {
    // espero 100ms por la demora del template en renderear los mensajes.
    this.timerSubscription = timer(100).subscribe(() => {
      const chatref = document.getElementById('chatsuperuser');
      chatref.scrollTop = chatref.scrollHeight - chatref.clientHeight;
    })
  }

  readChatsRequests() {
    this.superuserService.readChatsRequests().subscribe((data: chatsSessionsResponse) => {
      this.chatsSessions = data.sessions;

      // si se recibe acutalizar la lista actualizo la sesión en curso si existiera
      if(this.chatSession){
        this.chatSession = this.chatsSessions.find(session => session._id === this.chatSession._id);
      }
    })
  }

  sendMessage(message: HTMLTextAreaElement, chatref: HTMLElement): void {

    if (!this.wsService.idSocket) {
      this.publicService.snack('Se perdió la conexión', 3000);
      return;
    }

    if (message.value.length > 0) {
      this.chatMessages.push({
        own: true,
        time: new Date(),
        message: message.value,
        viewed: true
      });

      this.wsService.emit('chat-message', { to: this.chatSession.id_user_socket, msg: message.value });
      this.scrollTop();
      message.value = '';
      message.focus();
    }


  }


  selectSession(session: chatSession) {
    this.chatSession = session;
  }

  initializeChatSession() {
    const idSession = this.chatSession._id;
    const idSocket = this.wsService.idSocket;
    this.superuserService.initializeChatSession(idSession, idSocket).subscribe((data: chatSessionResponse) => {
      if (data.ok) {
        this.chatSession = data.session;
        this.publicService.snack('Sesion inicializada correctamente', 2000);
      }
    })
  }

  endChat() {
    this.publicService.snack('Desesa finalizar el chat?', 3000, 'FINALIZAR').then(ok => {
      if (ok) {
        const idChat = this.chatSession._id;
        this.superuserService.endChat(idChat).subscribe((data: chatSessionResponse) => {
          this.chatMessages = [];
        })
      }
    })
  }

  ngOnDestroy() {
    if (this.timerSubscription) { this.timerSubscription.unsubscribe(); }
    if (this.escucharChat) { this.escucharChat.unsubscribe(); }
    if (this.updateClientsListSub) { this.updateClientsListSub?.unsubscribe(); }
    if (this.escucharChatFinished) { this.escucharChatFinished?.unsubscribe(); }

  }

}
