import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../admin.service';
import { MatStepper } from '@angular/material/stepper';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { LoginService } from '../../../services/login.service';
import { PublicService } from '../../public/public.service';

@Component({
	selector: 'app-wizard',
	templateUrl: './wizard.component.html',
	styleUrls: ['./wizard.component.css'],
	providers: [{
		provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false }
	}]
})
export class WizardComponent implements OnInit {


	activateSectorExplanation = false;
	activateTableExplanation = false;
	activateWaiterExplanation = false;
	canContinueValue = true;

	constructor(
		private router: Router,
		public loginService: LoginService,
		public adminService: AdminService,
		public publicService: PublicService,
	) { }

	ngOnInit(): void {}

	endWizard() {
		this.router.navigate(['/admin/home']);
	}

	stepperGoBack(stepper: MatStepper) {
		stepper.previous();
	}

	stepperGoNext(stepper: MatStepper) {

		if (this.adminService.companies?.length === 0) {
			this.publicService.snack('Para continuar tenés que crear un comercio primero', 5000);
			return;
		}

		if (!this.loginService.user?.id_company?._id) {
			this.publicService.snack('Seleccioná una empresa desde el menú para continuar.', 5000);
			return;
		}

		this.publicService.scrollTop();
		stepper.next();
	}

	canContinue(canContinue: boolean){
		this.canContinueValue = canContinue;
	}
}
