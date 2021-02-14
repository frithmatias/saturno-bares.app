import { Component, OnInit } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PublicService } from './public.service';
import { CompanyResponse } from '../../interfaces/company.interface';

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
    public publicService: PublicService
  ) { }

  ngOnInit(): void {

    this.route.params.subscribe((data: any) => {
      if (data.txCompanyString) {
        let txCompanyString = data.txCompanyString;
        this.publicService.readCompany(txCompanyString).subscribe((resp: CompanyResponse) => {
          if (resp.ok) {
            localStorage.setItem('company', JSON.stringify(resp.company));
            this.router.navigate(['/public/companypage'])
          } else {
            this.snack.open('No existe la empresa', 'Aceptar', { duration: 5000 });
            this.router.navigate(['/home'])
          }
        },
          (err) => {
            this.snack.open('Error al buscar la empresa', 'Aceptar', { duration: 2000 });
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
