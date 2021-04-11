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
    this.router.events
    .pipe(filter(evento => evento instanceof NavigationEnd))
    .subscribe((data: NavigationEnd) => {
      this.url = data.url.split('/')[1]; // admin - waiter - (public path)
    });
  }

  scrollToElement(): void {
    // browser autorizado para preguntar posición al usuario
    // todo: re-inicializar el componente mapa mediante en home mediante directiva para preguntar posición al usuario. 
    this.publicService.canAksPositionUser = true;
    const elem = document.getElementById('home-map-container');
    elem?.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });

  }

}
