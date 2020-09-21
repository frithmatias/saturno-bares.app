import { Injectable } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor(
    private snack: MatSnackBar
  ) { }


  
	// ========================================================
	// Login Methods
	// ========================================================



	scrollTop() {
		document.body.scrollTop = 0; // Safari
		document.documentElement.scrollTop = 0; // Other
		document.getElementsByClassName('mat-drawer-content')[0].scrollTop = 0;

	}

	stepperGoBack(stepper: MatStepper) {
		stepper.previous();
	}

	stepperGoNext(stepper: MatStepper) {
		this.scrollTop();
		stepper.next();
	}

	stepperReset(stepper: MatStepper) {
		stepper.reset();
	}

	snackShow(msg: string, dur: number, button?: string): Promise<boolean> {
		return new Promise((resolve) => {
			this.snack.open(msg, button, { duration: dur }).afterDismissed().subscribe(data => {
				if (data.dismissedByAction) {
					resolve(true);
				} else {
					resolve(false);
				}
			})
		})
  }
  
}
