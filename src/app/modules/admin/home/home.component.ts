import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';
import { AdminService } from '../admin.service';
import { PublicService } from '../../public/public.service';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

	publicURL: string;
	constructor(
		public loginService: LoginService,
		public adminService: AdminService,
		public publicService: PublicService,
	) { }
	ngOnInit() { }

}
