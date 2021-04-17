import { Component, OnInit } from '@angular/core';
import { PublicService } from '../public.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Company, CompanyResponse } from 'src/app/interfaces/company.interface';
import { SettingsResponse } from '../../../interfaces/settings.interface';
import { Settings } from 'src/app/interfaces/settings.interface';

@Component({
	selector: 'app-webpage',
	templateUrl: './webpage.component.html',
	styleUrls: ['./webpage.component.css']
})
export class WebPageComponent implements OnInit {
	company: Company;
	settings: Settings;
	pageSection: string = 'home';

	// width 528: page-container 600px - 2x20px padding - mat-card padding 2x16 
	// [imageSize]="imageSize"
	imageSize = { width: '100%', height: 200, space: 0 };
	constructor(
		public publicService: PublicService,
		private router: Router,
		private route: ActivatedRoute
	) { }


	ngOnInit() {

		this.route.params.subscribe((data: any) => {
			this.pageSection = data.section || 'home';
			this.publicService.readCompany(data.txCompanyString).toPromise().then((resp: CompanyResponse) => {
				
				localStorage.setItem('company', JSON.stringify(resp.company));
				this.company = resp.company;
				this.publicService.company = resp.company;
				if (resp.company.tx_theme) {
					let cssLink = <HTMLLinkElement>document.getElementById('themeAsset');
					cssLink.href = `./assets/css/themes/${resp.company.tx_theme}`;
				}

				const idCompany = resp.company._id;
				this.publicService.readSettings(idCompany).subscribe((data: SettingsResponse) => {
					this.settings = data.settings;
					this.publicService.settings = data.settings; 
				})

			}).catch(() => {
				this.router.navigate(['/home'])
			})

		});
	}
}

