import { Injectable } from '@angular/core';
import { CanLoad } from '@angular/router';
import { LoginService } from '../services/login.service';

@Injectable()
export class LoginGuard implements CanLoad {

	constructor(
		public LoginService: LoginService,
	) { }

	canLoad() {
		if (this.LoginService.user) {
			return true;
		} else {
			return false;
		}
	}
}
