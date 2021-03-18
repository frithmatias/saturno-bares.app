import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LoginService } from '../../services/login.service';

@Injectable({
	providedIn: 'root'
})
export class MetricsService {

	constructor(
		private http: HttpClient
	) { }

	getUserMetrics(fcSel: number, idUser: string): Observable<object> {
		let data = { fcSel, idUser };
		const url = environment.api + `/metrics/getusermetrics`;
		return this.http.post(url, data);
	}
	
	readTickets(idCompany: string): Observable<object> {
		if (!idCompany) { return; }
		const url = environment.api + '/metrics/readtickets/' + idCompany;
		return this.http.get(url);
	}
}
