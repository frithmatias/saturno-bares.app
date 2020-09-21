import { Injectable } from '@angular/core';
import { CanLoad } from '@angular/router';
import { LoginService } from '../services/login.service';


@Injectable({
  providedIn: 'root'
})
export class SuperuserGuard implements CanLoad {
	constructor(
		public loginService: LoginService,
	) { }

	canLoad() {
		if (this.loginService.user.tx_role = "SUPERUSER_ROLE") {
			return true;
		} else {
			return false;
		}
	}
}
