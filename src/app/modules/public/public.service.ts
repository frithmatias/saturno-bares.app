import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Ticket } from '../../interfaces/ticket.interface';
import { Router } from '@angular/router';
import { Company } from '../../interfaces/company.interface';
import { environment } from '../../../environments/environment.prod';
import { Observable } from 'rxjs';
import { SkillsResponse } from '../../interfaces/skill.interface';

@Injectable({
  providedIn: 'root'
})
export class PublicService {

  company: Company;
  ticket: Ticket;

  tickets: Ticket[] = [];
  allMytickets: Ticket[] = [];

  chatMessages: {
    own: boolean,
    time: Date,
    message: string,
    viewed: boolean
  }[] = [];


  constructor(
    private http: HttpClient,
    private router: Router
  ) { 

    
  
		if (localStorage.getItem('company')) {
      this.company = JSON.parse(localStorage.getItem('company'));

      if (localStorage.getItem('ticket')) {
        this.ticket = JSON.parse(localStorage.getItem('ticket'));
        this.router.navigate(['/public/myticket']);
      } else {
        this.router.navigate(['/public/tickets']);
      }

    } 
    


  }


  // ========================================================
	// Public Methods
	// ========================================================
  
  findCompany(pattern: string): Observable<object> {
    return this.http.get(environment.url + '/c/findcompany/' + pattern);
  }

  readCompany(txPublicName: string): Observable<object> {
    return this.http.get(environment.url + '/c/readcompany/' + txPublicName);
  }

  readSkills(idCompany: string): Observable<SkillsResponse> {
    return this.http.get<SkillsResponse>(environment.url + '/s/readskills/' + idCompany);
  }

  createTicket(idSkill: string, idSocket: string, blPriority: boolean = false): Observable<object> {
    let data = { idSkill, idSocket, blPriority };
    return this.http.post(environment.url + '/t/createticket/', data);
  }

  getTickets(idCompany: string) {
    if (!idCompany) { return; }
    const url = environment.url + '/t/gettickets/' + idCompany;
    return this.http.get(url);
  }

  actualizarSocket(idTicket: string, oldSocket: string, newSocket: string): Observable<object> {
    const socketsData = { idTicket, oldSocket, newSocket };
    return this.http.put(environment.url + '/t/actualizarsocket', socketsData);
  }

  cancelTicket(idTicket: string) {
    return this.http.get(environment.url + '/t/cancelticket/' + idTicket);
  }

  sendScores(cdScores: any) {
    const url = environment.url + `/p/scores`;
    return this.http.post(url, cdScores);
  }

  sendContact(data: any) {
    const url = environment.url + `/p/contact`;
    return this.http.post(url, data);
  }

  drawerScrollTop(): void {
    let ref = document.getElementsByClassName('mat-drawer-content')[0];
    ref.scrollTop = 0;
  }

  clearPublicSession(): void {
    this.chatMessages = [];
    delete this.ticket;
    delete this.company;
    if (localStorage.getItem('ticket')) { localStorage.removeItem('ticket'); }
    if (localStorage.getItem('company')) { localStorage.removeItem('company'); }
  }

  clearPublicSessionComplete(): void {
    this.router.navigate(['/public']);
    this.allMytickets = null;
  }

}
