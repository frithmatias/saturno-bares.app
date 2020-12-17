import { Component, OnInit } from '@angular/core';
import { PublicService } from '../public.service';

@Component({
	selector: 'app-company-page',
	templateUrl: './company-page.component.html',
	styleUrls: ['./company-page.component.css']
})
export class CompanyPageComponent implements OnInit {

	constructor(public publicService: PublicService) { }
	ngOnInit(): void { }

}

