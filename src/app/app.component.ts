import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { PublicService } from './modules/public/public.service';
import { MatSidenav } from '@angular/material/sidenav';

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

  }

  ngOnInit(): void {
    this.router.events.pipe(
      filter(evento => evento instanceof NavigationEnd),
      // filter((evento: ActivationEnd) => evento.snapshot.firstChild === null),
      // map((evento: ActivationEnd) => evento.snapshot.data)
    ).subscribe((data: NavigationEnd) => {
      // https://localhost:4200/embed/pizzasjavascript
      this.publicService.urlModule = data.url.split('/')[1] || null; //embed
      this.publicService.urlComponent = data.url.split('/')[2] || null; //pizzasjavascript
    });
  }

  toggle(htmlRef: MatSidenav): void {
    htmlRef.toggle();
  }

}

