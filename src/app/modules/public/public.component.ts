import { Component, OnInit } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
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
    public publicService: PublicService
  ) { }

  ngOnInit(): void {



    // read company param
    this.route.params.subscribe((data: any) => {
      if (data.txCompanyString) {
        let txCompanyString = data.txCompanyString;
        this.publicService.readCompany(txCompanyString).subscribe((resp: CompanyResponse) => {
          if (resp.ok) {
            localStorage.setItem('company', JSON.stringify(resp.company));
            this.router.navigate(['/public/companypage'])
          } else {
            this.publicService.snack('No existe la empresa', 3000, 'Aceptar');
            this.router.navigate(['/home'])
          }
        },
          (err) => {
            this.publicService.snack('Error al buscar la empresa', 3000, 'Aceptar');
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
