import { Injectable } from '@angular/core';
import { CanLoad } from '@angular/router';
import { LoginService } from '../services/login.service';

@Injectable()
export class AdminGuard implements CanLoad {

	constructor(
		public loginService: LoginService,
	) { }

	canLoad() {
		if (this.loginService.user.tx_role === 'ADMIN_ROLE') {
			return true;
		} else {
			this.loginService.logout();
			return false;
		}
	}

}
