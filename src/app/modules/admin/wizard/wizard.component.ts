import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../admin.service';
import { MatStepper } from '@angular/material/stepper';
import { SharedService } from '../../../services/shared.service';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { LoginService } from '../../../services/login.service';


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
  
  constructor(
    private router: Router,
    public loginService: LoginService,
    public adminService: AdminService,
		public sharedService: SharedService
  ) { }

  ngOnInit(): void {}

  endWizard() {
		this.router.navigate(['/admin/home']);
  }

  scrollTop() {
		document.body.scrollTop = 0; // Safari
		document.documentElement.scrollTop = 0; // Other
	}

	stepperGoBack(stepper: MatStepper) {
		stepper.previous();
	}

	stepperGoNext(stepper: MatStepper) {

		if (this.adminService.companies?.length === 0) {
			this.sharedService.snack('Para continuar tenés que crear un comercio primero', 5000);
			return;
		}

		if (!this.loginService.user?.id_company?._id) {
			this.sharedService.snack('Seleccioná una empresa desde el menú para continuar.', 5000);
			return;
		}

		this.scrollTop();
		stepper.next();
	}
}
