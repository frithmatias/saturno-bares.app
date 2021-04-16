import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';
import { AdminService } from '../admin.service';
import { PublicService } from '../../public/public.service';
import { Subscription } from 'rxjs';
import { User } from '../../../interfaces/user.interface';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
	widget: string;
	publicURL: string;
	user$: Subscription;
	user: User;
	constructor(
		public loginService: LoginService,
		public adminService: AdminService,
		public publicService: PublicService,
	) { }


	ngOnInit() {
		this.user = this.loginService.user;
		this.user$ = this.loginService.user$.subscribe((user: User) => {
			this.user = user;
			this.widget = `<iframe
src="https://saturno.fun/ticketform/${this.user.id_company?.tx_company_string}" 
width="100%" 
height="400px" 
frameborder="0">
</iframe>`;
			console.log(this.user)
		})

		this.widget = `<iframe
src="https://saturno.fun/ticketform/${this.user.id_company?.tx_company_string}" 
width="100%" 
height="400px" 
frameborder="0">
</iframe>`;
	}

	ngOnDestroy() {
		this.user$.unsubscribe();
	}
}
