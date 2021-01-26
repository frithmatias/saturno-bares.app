import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Ticket } from '../../interfaces/ticket.interface';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { SectionsResponse } from '../../interfaces/section.interface';
import { LocationsResponse, Location } from '../../interfaces/location.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper } from '@angular/material/stepper';

@Injectable({
  providedIn: 'root'
})
export class PublicService {

  ticket: Ticket;
  tickets: Ticket[] = [];

  chatMessages: {
    own: boolean,
    time: Date,
    message: string,
    viewed: boolean
  }[] = [];


  constructor(
    private http: HttpClient,
    private router: Router,
		private _snack: MatSnackBar

  ) { }


  snack(msg: string, dur: number, button?: string): Promise<boolean> {
    return new Promise((resolve) => {
      this._snack.open(msg, button, { duration: dur }).afterDismissed().subscribe(data => {
        if (data.dismissedByAction) {
          resolve(true);
        } else {
          resolve(false);
        }
      })
    })
  }

  scrollTop() {
    document.body.scrollTop = 0; // Safari
    document.documentElement.scrollTop = 0; // Other
    document.getElementsByClassName('mat-drawer-content')[0].scrollTop = 0;

  }

  stepperGoBack(stepper: MatStepper) {
    stepper.previous();
  }

  stepperGoNext(stepper: MatStepper) {
    this.scrollTop();
    stepper.next();
  }

  stepperReset(stepper: MatStepper) {
    stepper.reset();
  }

  buscarLocalidades(pattern): Promise<LocationsResponse> {
    return new Promise((resolve, reject) => {
      const regex = new RegExp(/^[a-z ñ0-9]+$/i);
      if (!regex.test(pattern) && pattern) {
        this.snack('¡Ingrese sólo caracteres alfanuméricos!', 2000);
        reject();
        return;
      }

      const url = environment.api + '/p/locations/' + pattern;
      this.http.get(url).subscribe((resp: LocationsResponse) => {
        if (resp.ok) {
          resolve(resp);
          return resp;
        }
      });
    });
  }

  buscarBaresEnLocalidad(idLocation: string) {
    return this.http.get(environment.api + '/p/findinlocation/' + idLocation);
  }

  findCompany(pattern: string): Observable<object> {
    return this.http.get(environment.api + '/c/findcompany/' + pattern);
  }

  readCompany(txCompanyString: string): Observable<object> {
    return this.http.get(environment.api + '/c/readcompany/' + txCompanyString);
  }

  readSections(idCompany: string): Observable<SectionsResponse> {
    return this.http.get<SectionsResponse>(environment.api + '/section/readsections/' + idCompany);
  }

  readAvailability(nmPersons: number, idSection: string, dtReserve: Date): Observable<object> {
    let data = { nmPersons, idSection, dtReserve };
    return this.http.post(environment.api + '/t/readavailability/', data);
  }

  getUserTickets(txPlatform: string, idUser: string) {
    if (!txPlatform || !idUser) { return; }

    const url = environment.api + '/t/readusertickets/' + txPlatform + '/' + idUser;
    return this.http.get(url);
  }

  updateStorageTickets(ticket: Ticket): Promise<Ticket[]> {
    return new Promise((resolve) => {
      let tickets: Ticket[] = [];
      
      if (localStorage.getItem('tickets')) {
        tickets = JSON.parse(localStorage.getItem('tickets'));
        if (tickets.length > 0) {
          tickets = tickets.filter((tkt: Ticket) => tkt._id !== ticket._id); // quito el viejo 
        }
      }
      
      tickets.push(ticket); // agrego el nuevo
      localStorage.setItem('tickets', JSON.stringify(tickets));
      resolve(tickets);
    })
  }

  createTicket(
    blContingent: boolean,
    idSocket: string,
    txName: string,
    nmPersons: number,
    idSection: string,
    tmReserve: Date,
    cdTables: number): Observable<object> {
    let data = { blContingent, idSocket, txName, nmPersons, idSection, tmReserve, cdTables };
    return this.http.post(environment.api + '/t/createticket/', data);
  }

  // google and normal login
  validateTicketGoogle(idTicket: string, gtoken: string) {
    const api = '/t/validateticketgoogle';
    const data = { idTicket, gtoken };
    const url = environment.api + api;
    return this.http.post(url, data);
  }

  getTickets(idCompany: string) {
    if (!idCompany) { return; }
    const url = environment.api + '/t/readtickets/' + idCompany;
    return this.http.get(url);
  }

  getTicket(idTicket: string) {
    if (!idTicket) { return; }
    const url = environment.api + '/t/readticket/' + idTicket;
    return this.http.get(url);
  }


  actualizarSocket(idTicket: string, newSocket: string, isClient: boolean): Observable<object> {
    const socketsData = { idTicket, newSocket, isClient };
    return this.http.put(environment.api + '/t/actualizarsocket', socketsData);
  }

  callWaiter(idTicket: string, txCall: string) {
    return this.http.post(environment.api + '/t/callwaiter/', { idTicket, txCall });
  }

  endTicket(idTicket: string) {
    return this.http.post(environment.api + '/t/endticket/', { idTicket, reqBy: 'client' });
  }

  getScoreItems(idSection: string) {
    const url = environment.api + `/p/getscoreitems/` + idSection;
    return this.http.get(url);
  }

  sendScores(cdScores: any) {
    const url = environment.api + `/p/postscores`;
    return this.http.post(url, cdScores);
  }

  sendContact(data: any) {
    const url = environment.api + `/p/contact`;
    return this.http.post(url, data);
  }

  drawerScrollTop(): void {
    let ref = document.getElementsByClassName('mat-drawer-content')[0];
    ref.scrollTop = 0;
  }

  clearPublicSession(): void {
    this.chatMessages = [];
    delete this.tickets;
    // if (localStorage.getItem('tickets')) { localStorage.removeItem('tickets'); }
    if (localStorage.getItem('company')) { localStorage.removeItem('company'); }
    this.router.navigate(['/home']);
  }


}
