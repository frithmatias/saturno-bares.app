import { Component, OnInit } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { PublicService } from '../../modules/public/public.service';

@Component({
	selector: 'app-how-works',
	templateUrl: './how-works.component.html',
	styleUrls: ['./how-works.component.css']
})
export class HowWorksComponent implements OnInit {

	constructor(private publicService: PublicService) { }

	ngOnInit(): void {
		this.publicService.scrollTop();
	}

	stepperGoBack(stepper: MatStepper) {
		this.publicService.scrollTop();
		stepper.previous();
	}

	stepperGoNext(stepper: MatStepper) {
		this.publicService.scrollTop();
		stepper.next();
	}

}
