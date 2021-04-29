import { Injectable } from '@angular/core';
import { CanLoad } from '@angular/router';
import { LoginService } from '../services/login.service';

@Injectable()
export class AdminGuard implements CanLoad {

	constructor(
		public loginService: LoginService,
	) { }

	canLoad() {
		if (['ADMIN_ROLE', 'SUPERUSER_ROLE'].includes(this.loginService.user.id_role)) {
			return true;
		} else {
			this.loginService.logout();
			return false;
		}
	}

}
