import { Component, OnInit, ViewChild } from '@angular/core';
import { MatStepper } from '@angular/material/stepper/stepper';
import { LoginService } from 'src/app/services/login.service';
import { AdminService } from '../admin.service';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

	@ViewChild('stepper') stepper: MatStepper;
	publicURL: string;

	constructor(
		public loginService: LoginService,
		public adminService: AdminService
	) { }
	ngOnInit() { }
}
