import { Component, OnInit } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PublicService } from './public.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-public',
  templateUrl: './public.component.html',
  styleUrls: ['./public.component.css']
})
export class PublicComponent implements OnInit {
  opened: boolean;
  unreadMessages: number;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private snack: MatSnackBar,
    public publicService: PublicService,
    public sharedService: SharedService
  ) { }

  ngOnInit(): void {

    if (this.publicService.ticket?.tm_end) { // si el ticket esta finalizado limpio la sesión
      this.publicService.clearPublicSession();
    }


    this.route.params.subscribe((data: any) => {

      if (data.company) {
        let txCompany = data.company;
        this.publicService.readCompany(txCompany).subscribe((resp: any) => {
          if (resp.ok) {
            localStorage.setItem('company', JSON.stringify(resp.company));
            this.publicService.company = resp.company;
            this.router.navigate(['/public/tickets'])
          }

        },
          (err) => {
            this.snack.open('No existe la empresa ingresada', 'Aceptar', { duration: 2000 });
            this.router.navigate(['/public'])
          }
        );
      }

    });

  }

  toggle(htmlRef: MatSidenav): void {
    htmlRef.toggle();
  }
}
