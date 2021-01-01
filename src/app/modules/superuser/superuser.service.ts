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
