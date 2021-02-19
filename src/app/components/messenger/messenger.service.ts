import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessengerService {

  constructor(private http: HttpClient ) { }

  sendMail(txEmail: string, txMessage: string) : Observable<any> {
		const url = environment.api + '/m/sendmail';
    return this.http.post(url, {txEmail, txMessage});
  }


}
