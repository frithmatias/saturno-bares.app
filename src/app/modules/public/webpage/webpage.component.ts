import { Component, OnInit } from '@angular/core';
import { PublicService } from '../public.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Company, CompanyResponse } from 'src/app/interfaces/company.interface';
import { SettingsResponse } from '../../../interfaces/settings.interface';

@Component({
	selector: 'app-webpage',
	templateUrl: './webpage.component.html',
	styleUrls: ['./webpage.component.css']
})
export class WebPageComponent implements OnInit {
	company: Company;
	pageSection: string = 'home';
	companyString: string;
	// width 528: page-container 600px - 2x20px padding - mat-card padding 2x16 
	// [imageSize]="imageSize"
	imageSize = { width: '100%', height: 200, space: 0 };
	constructor(
		public publicService: PublicService,
		private router: Router,
		private route: ActivatedRoute
	) { }
	async ngOnInit(): Promise<any> {

		this.route.params.subscribe((data: any) => {
			this.pageSection = data.section || 'home';
			this.companyString = data.txCompanyString;
		});

		await this.getCompanyInfo(this.companyString).then(company => {
			this.publicService.company = company;
			this.company = company;
			if (company.tx_theme) {
				let cssLink = <HTMLLinkElement>document.getElementById('themeAsset');
				cssLink.href = `./assets/css/themes/${company.tx_theme}`;
			}
			const idCompany = company._id;
			this.publicService.readSettings(idCompany).subscribe((data: SettingsResponse) => {
				this.publicService.settings = data.settings; // rompo la referencia la objeto original
			})
		}).catch(() => {
			this.router.navigate(['/home'])
		})
	}

	async getCompanyInfo(companyString: string): Promise<Company | null> {
		return new Promise((resolve, reject) => {
			let txCompanyString = companyString;
			this.publicService.readCompany(txCompanyString).subscribe((resp: CompanyResponse) => {
				if (resp.ok) {
					localStorage.setItem('company', JSON.stringify(resp.company));
					resolve(resp.company)
				} else {
					this.publicService.snack('No existe la empresa', 3000, 'Aceptar');
					reject(null);
				}
			},
				(err) => {
					this.publicService.snack('Error al buscar la empresa', 3000, 'Aceptar');
					reject(null);
				}
			);
		})

	}

}

