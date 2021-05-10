import { Component, OnInit, Output, EventEmitter, Input, SimpleChange, OnDestroy } from '@angular/core';
import { WebsocketService } from '../../services/websocket.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { timer, Subscription } from 'rxjs';
import { ChatService } from './chat.service';
import { PublicService } from '../../modules/public/public.service';
import { LoginService } from '../../services/login.service';
import { User } from 'src/app/interfaces/user.interface';
import { chatSessionResponse, chatSession } from '../../interfaces/chat.session.interface';
import { ChatSession } from '../../../../../api/models/chat.session.model';

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
  escucharChat: Subscription;
  escucharChatInitialized: Subscription;
  escucharChatFinished: Subscription;
  chatSession: chatSession = null;
  client: User; // user 
  showSubjectForm = true;
  constructor(
    private wsService: WebsocketService,
    private snack: MatSnackBar,
    public chatService: ChatService,
    private publicService: PublicService,
    private loginService: LoginService
  ) { }



  ngOnInit(): void {


    if (localStorage.getItem('chatsession')) {
      this.chatSession = JSON.parse(localStorage.getItem('chatsession'));
    }
    if (localStorage.getItem('user')) {
      this.client = JSON.parse(localStorage.getItem('user'));
    }

    this.escucharChatInitialized = this.wsService.escucharChatInitialized().subscribe((data: any) => {
      this.chatSession.tm_init = data.tm_init;
      this.chatSession.id_assistant_socket = data.id_assistant_socket;
      this.chatSession.tx_assistant_name = data.tx_assistant_name;
      localStorage.setItem('chatsession', JSON.stringify(this.chatSession));
    })

    this.escucharChatFinished = this.wsService.escucharChatFinished().subscribe((data: any) => {
      this.endChatSession();
    })


    this.escucharChat = this.wsService.escucharChat().subscribe((msg: string) => {
      let message = {
        own: false,
        time: new Date(),
        message: msg,
        viewed: this.chatOpen ? true : false,
      }
      this.chatService.chatMessages.push(message);
      if (this.chatOpen) {
        this.scrollTop();
      } else {
        let numUnread = this.chatService.chatMessages.filter(message => message.viewed === false).length;
        this.unreadMessages.emit(numUnread);
      }
    })

  }

  ngOnChanges(changes: any) {
    this.showSubjectForm = true;

    if (localStorage.getItem('user')) {
      this.client = JSON.parse(localStorage.getItem('user'));
    }

    if (!this.client) {
      delete this.client;
      this.endChatSession();
    }

    this.chatOpen = changes.chatOpenStatus.currentValue;
    if (changes.chatOpenStatus.currentValue) {
      for (let message of this.chatService.chatMessages) {
        message.viewed = true;
      }
    }
  }


  submitSubject(text: HTMLTextAreaElement) {
    const idSession = this.chatSession._id;
    const txSubject = text.value;
    this.chatService.submitSubject(idSession, txSubject).subscribe((data: chatSessionResponse) => {
      if (data.ok) {
        this.chatSession = data.session;
        text.value = '';
        this.showSubjectForm = false;
      }
    })
  }

  startSession() {

    if (!this.client) {
      // client = user
      this.publicService.snack('Debe iniciar sesion', 3000);
      return;
    }

    const idSocket = this.wsService.idSocket;
    const idUser = this.client._id;

    this.chatService.chatRequest(idSocket, idUser).subscribe((data: chatSessionResponse) => {
      this.chatSession = data.session;
      localStorage.setItem('chatsession', JSON.stringify(this.chatSession));
      this.publicService.snack('Chat en desarrollo', 3000);
    }, () => {
      this.endChatSession();
      this.publicService.snack('Debe iniciar sesión', 3000);
    })
  }

  sendMessage(message: HTMLTextAreaElement, chatref: HTMLElement): void {

    if (!this.wsService.idSocket) {
      this.snack.open('Se perdió la conexión con el asistente.', 'ACEPTAR', { duration: 1000 });
      return;
    }

    if (message.value.length > 0) {
      this.chatService.chatMessages.push({
        own: true,
        time: new Date(),
        message: message.value,
        viewed: true
      });
      this.wsService.emit('chat-message', { to: this.chatSession.id_assistant_socket, msg: message.value });
      this.scrollTop();
      message.value = '';
      message.focus();
    }
  }

  endChatSession() {
    this.chatService.chatMessages = [];
    delete this.chatSession;
    if (localStorage.getItem('chatsession')) { localStorage.removeItem('chatsession'); }
  }

  scrollTop(): void {
    // espero 100ms por la demora del template en renderear los mensajes.
    this.timerSubscription = timer(100).subscribe(() => {
      const chatref = document.getElementById('chatmessages');
      chatref.scrollTop = chatref.scrollHeight - chatref.clientHeight;
    })
  }

  closeChatWindow() {
    this.toggleChat.emit(true);
  }

  endChat(): void {
    if (this.chatSession) {
      this.publicService.snack('Desesa finalizar el chat?', 3000, 'FINALIZAR').then(ok => {
        if (ok) {
          const idChat = this.chatSession._id;
          this.chatService.endChat(idChat).subscribe((data: chatSessionResponse) => {
            this.endChatSession();
            this.toggleChat.emit(true);
          })
        }
      })
    } else {
      this.toggleChat.emit(true);
    }
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) { this.timerSubscription.unsubscribe(); }
    if (this.escucharChat) { this.escucharChat.unsubscribe(); }
    if (this.escucharChatInitialized) { this.escucharChatInitialized.unsubscribe(); }
    if (this.escucharChatFinished) { this.escucharChatFinished.unsubscribe(); }

  }

}
