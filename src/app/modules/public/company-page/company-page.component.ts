import { Component, OnInit } from '@angular/core';
import { PublicService } from '../public.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Company } from 'src/app/interfaces/company.interface';

interface sliderImage {
	image: string;
	thumbImage: string;
	alt: string;
	title: string;
}


@Component({
	selector: 'app-company-page',
	templateUrl: './company-page.component.html',
	styleUrls: ['./company-page.component.css']
})
export class CompanyPageComponent implements OnInit {
	images: sliderImage[] = [];
	company: Company;

	// width 528: saturno-container 600px - 2x20px padding - mat-card padding 2x16 
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


		let idCompany = this.company._id;
		let url = environment.api + '/image/' + idCompany + '/tx_company_banners/';

		this.company.tx_company_banners.forEach(img => {
			this.images.push({
				image: url + img,
				thumbImage: url + img,
				alt: '',
				title: ''
			})
		})
	}

}

