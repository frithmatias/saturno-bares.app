import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PublicService } from 'src/app/modules/public/public.service';
import { environment } from 'src/environments/environment.prod';


@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {

  url: string = '';
  hiddenBadge: boolean;
  version = environment.version;
  publicHomePage: boolean;

  constructor(
    public publicService: PublicService,
    public router: Router
  ) { }

  ngOnInit(): void {

    // set flat toolbar with ngClass if url is /public/page
    this.publicHomePage = this.publicService.urlComponent === 'page' ? true : false;

    if (localStorage.getItem('customer')) {
      this.publicService.customer = JSON.parse(localStorage.getItem('customer'));
    }
  }

  salir() {
    this.publicService.clearPublicSession();
    this.router.navigate(['/home']);
  }

}
