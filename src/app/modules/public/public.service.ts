import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Ticket } from '../../interfaces/ticket.interface';
import { Router } from '@angular/router';
import { Company } from '../../interfaces/company.interface';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { SectionsResponse } from '../../interfaces/section.interface';
import { FormControl } from '@angular/forms';
import { LocationsResponse, Location } from '../../interfaces/location.interface';
import { SharedService } from '../../services/shared.service';

@Injectable({
  providedIn: 'root'
})
export class PublicService {

  company: Company;
  ticket: Ticket;

  tickets: Ticket[] = [];

  chatMessages: {
    own: boolean,
    time: Date,
    message: string,
    viewed: boolean
  }[] = [];


  constructor(
    private sharedService: SharedService,
    private http: HttpClient,
    private router: Router
  ) {}

  buscarLocalidades(pattern): Promise<LocationsResponse> {
    return new Promise((resolve, reject) => {
      const regex = new RegExp(/^[a-z ñ0-9]+$/i);
      if (!regex.test(pattern) && pattern) {
        this.sharedService.snack('¡Ingrese sólo caracteres alfanuméricos!', 2000);
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

  readAvailableDates(nmPersons: number, idSection: string, dtReserve: Date): Observable<object> {
    let data = { nmPersons, idSection, dtReserve };
    return this.http.post(environment.api + '/t/readavailability/', data);
  }

  getUserTickets(txPlatform: string, idUser: string){
        if (!txPlatform || !idUser) { return; }
        
    const url = environment.api + '/t/readusertickets/' + txPlatform + '/' + idUser;
    return this.http.get(url);
  }

  createTicket(
    blContingent: boolean,
    idSocket: string,
    txName: string,
    nmPersons: number,
    idSection: string,
    nmPhone: number,
    txEamil: string,
    tmReserve: Date,
    cdTables: number): Observable<object> {
    let data = { blContingent, idSocket, txName, nmPersons, idSection, nmPhone, txEamil, tmReserve, cdTables };
    return this.http.post(environment.api + '/t/createticket/', data);
  }

  getTickets(idCompany: string) {
    if (!idCompany) { return; }
    const url = environment.api + '/t/readtickets/' + idCompany;
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
    return this.http.post(environment.api + '/t/endticket/', { idTicket });
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
    //delete this.ticket;
    delete this.company;
    //if (localStorage.getItem('ticket')) { localStorage.removeItem('ticket'); }
    if (localStorage.getItem('company')) { localStorage.removeItem('company'); }
    this.router.navigate(['/home']);
  }

}
