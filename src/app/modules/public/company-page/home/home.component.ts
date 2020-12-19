import { Component, OnInit } from '@angular/core';
import { PublicService } from '../../public.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment.prod';


interface sliderImage {
  image: string;
  thumbImage: string;
  alt: string;
  title: string;
}


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  images: sliderImage[] = [];
  // width 528: saturno-card 600px - 2x20px padding - mat-card padding 2x16 
  // [imageSize]="imageSize"
  imageSize = {width: 528, height: 200, space: 0};

  constructor(
    public publicService: PublicService,
    public router: Router
  ) { }

  ngOnInit(): void {
    // http://localhost:5000/image/5fdb897522c9fa13a0184a63/banner/1608297783103.png

    let idCompany = this.publicService.company._id;
    let url = environment.url + '/image/' + idCompany + '/banner/';

    this.publicService.company.tx_company_banners.forEach(img => {
      this.images.push({
        image: url + img,
        thumbImage: url + img,
        alt: '',
        title: ''
      })
    })
    console.log(this.images)
  }
  salir(): void {
    this.publicService.clearPublicSession();
    this.router.navigate(['/home'])
  }
}
