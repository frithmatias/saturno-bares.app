import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { MenuItem } from './superuser.interface';

@Injectable({
	providedIn: 'root'
})
export class SuperuserService {

	constructor(private http: HttpClient) { }

	createMenu(menu: MenuItem) {
		const url = environment.url + '/superuser/createmenu';
		return this.http.post(url, menu);
	}

	readMenus() {
		const url = environment.url + '/superuser/readmenu/';
		return this.http.get(url);
	}

	updateMenu(menu: MenuItem) {
		const url = environment.url + '/superuser/updatemenu';
		return this.http.post(url, menu);
	}

	deleteMenu(idMenu: string) {
		const url = environment.url + '/superuser/deletemenu/' + idMenu;
		return this.http.delete(url);
	}

}
