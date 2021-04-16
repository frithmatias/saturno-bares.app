import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { PublicService } from 'src/app/modules/public/public.service';
import { filter } from 'rxjs/operators';
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
  constructor(
    public publicService: PublicService,
    public router: Router
  ) { }

  ngOnInit(): void {


    if(localStorage.getItem('customer')){
      this.publicService.customer = JSON.parse(localStorage.getItem('customer'));
    }
    this.router.events
      .pipe(filter(evento => evento instanceof NavigationEnd))
      .subscribe((data: NavigationEnd) => {
        this.url = data.url.split('/')[2]; // admin - waiter - (public path)
      });
  }

}
