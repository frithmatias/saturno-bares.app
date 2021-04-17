import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { PublicService } from './modules/public/public.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  opened: boolean;
  unreadMessages: number;
  url: string = '';

  constructor(
    public router: Router,
    public publicService: PublicService
  ) {
    // let hours = new Date().getHours();
    // const theme = (hours >= 6 && hours < 19) ? 'grey-orange.css' : 'dark-pink.css';
    // let cssLink = <HTMLLinkElement>document.getElementById('themeAsset');
    // cssLink.href = `../../../assets/css/themes/${theme}`;
  }

  ngOnInit(): void {
    this.router.events.pipe(
      filter(evento => evento instanceof NavigationEnd),
      // filter((evento: ActivationEnd) => evento.snapshot.firstChild === null),
      // map((evento: NavigationEnd ) => {evento})
    ).subscribe((data: NavigationEnd) => {
      
      this.publicService.urlModule = data.url.split('/')[1] || null; // admin - waiter - (public path)
      this.publicService.urlComponent = data.url.split('/')[2] || null; // admin - waiter - (public path)
      console.log('module:' + this.publicService.urlModule, 'component:' + this.publicService.urlComponent)
    });
  }
  

  
}

