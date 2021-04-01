import { Component, OnInit } from '@angular/core';
import { PublicService } from '../public.service';
import { Router } from '@angular/router';
import { Company } from 'src/app/interfaces/company.interface';
import { SettingsResponse } from '../../../interfaces/settings.interface';

@Component({
	selector: 'app-company-page',
	templateUrl: './company-page.component.html',
	styleUrls: ['./company-page.component.css']
})
export class CompanyPageComponent implements OnInit {
	company: Company;
	// width 528: page-container 600px - 2x20px padding - mat-card padding 2x16 
	// [imageSize]="imageSize"
	imageSize = { width: '100%', height: 200, space: 0 };
	constructor(
		public publicService: PublicService,
		private router: Router
	) { }
	ngOnInit(): void {

		if (!this.company && localStorage.getItem('company')) {
			this.company = JSON.parse(localStorage.getItem('company'));
		}

		if (!this.company) {
			this.publicService.clearPublicSession();
			this.router.navigate(['/home']);
			this.publicService.snack('Debe seleccionar un comercio primero.', 5000)
			return;
		}

		const idCompany = this.company._id;
		this.publicService.readSettings(idCompany).subscribe((data: SettingsResponse) => {
			this.publicService.settings = data.settings; // rompo la referencia la objeto original
		})

		if (this.company.tx_theme) {
			let cssLink = <HTMLLinkElement>document.getElementById('themeAsset');
			cssLink.href = `./assets/css/themes/${this.company.tx_theme}`;
		}

	}

}

