import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { MenuItem } from './superuser.interface';

@Injectable({
	providedIn: 'root'
})
export class SuperuserService {

	constructor(private http: HttpClient) { }

	readChatsRequests() {
		const url = environment.api + '/chat/readchatsrequests';
		return this.http.get(url);
	}

	initializeChatSession(idSession: string, idSocket: string) {
		const data = { idSession, idSocket };
		const url = environment.api + '/chat/initializesession/';
		return this.http.post(url, data);
	}

	endChat(idSession: string) {
		const url = environment.api + '/chat/endsession/' + idSession;
		return this.http.get(url);
	}

	createMenu(menu: MenuItem) {
		const url = environment.api + '/superuser/createmenu';
		return this.http.post(url, menu);
	}

	readMenus() {
		const url = environment.api + '/superuser/readmenu/';
		return this.http.get(url);
	}

	updateMenu(menu: MenuItem) {
		const url = environment.api + '/superuser/updatemenu';
		return this.http.post(url, menu);
	}

	deleteMenu(idMenu: string) {
		const url = environment.api + '/superuser/deletemenu/' + idMenu;
		return this.http.delete(url);
	}

}
