import { Component, OnInit } from '@angular/core';
import { PublicService } from '../public.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Company } from 'src/app/interfaces/company.interface';
import { SharedService } from '../../../services/shared.service';

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
	imageSize = {width: '100%', height: 200, space: 0};
	constructor(
		public publicService: PublicService,
		public sharedService: SharedService,
		private router: Router
		) { }
	ngOnInit(): void {


		if (!this.company) {
			if (this.publicService.company) {
				this.company = this.publicService.company;
			} else {
				if (localStorage.getItem('company')) {
					this.company = JSON.parse(localStorage.getItem('company'));
				}
			}
		}

		if (!this.company) {
			this.publicService.clearPublicSession();
			this.router.navigate(['/home']);
			this.sharedService.snack('Debe seleccionar un comercio primero.', 5000)
			return;
		}
		

		let idCompany = this.publicService.company._id;
		let url = environment.api + '/image/' + idCompany + '/tx_company_banners/';

		this.publicService.company.tx_company_banners.forEach(img => {
		  this.images.push({
			image: url + img,
			thumbImage: url + img,
			alt: '',
			title: ''
		  })
		})
	 }

}

