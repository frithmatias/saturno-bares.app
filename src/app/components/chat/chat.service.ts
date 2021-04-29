import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { User } from 'src/app/interfaces/user.interface';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  chatMessages: {
    own: boolean,
    time: Date,
    message: string,
    viewed: boolean
  }[] = [];

  constructor(
    private http: HttpClient
  ) { }

  chatRequest(idSocket: string, idUser: string) {
    const data = { idSocket, idUser }
    const url = environment.api + '/chat/chatrequest';
    return this.http.post(url, data);
  }

  endChat(idSession: string) {
    const url = environment.api + '/chat/endsession/' + idSession;
    return this.http.get(url);
  }

  submitSubject(idSession: string, txSubject: string) {
    const data = { idSession, txSubject }
    const url = environment.api + '/chat/submitsubject/';
    return this.http.post(url, data);
  }
}
