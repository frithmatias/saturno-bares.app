import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Company, CompaniesResponse } from '../../../interfaces/company.interface';
import { PublicService } from 'src/app/modules/public/public.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  companies: Company[] = [];

  constructor(
    private router: Router,
    private publicService: PublicService,
    private sharedService: SharedService
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    let refInput = document.getElementById('inputCompany');
    refInput.focus();
  }

  findCompany(e: HTMLInputElement) {

    if (e.value.length > 1) {
      this.publicService.findCompany(e.value).subscribe((data: CompaniesResponse) => {
        if (data.ok) {
          this.companies = data.companies;
        } else {
          e.value = '';
          this.sharedService.snack('No existen resultados.', 2000, null);
        }
      }, () => {
        this.sharedService.snack('Error al obtener las empresas', 2000, null);
      })
      // this.router.navigate(['/public', e.value]);
    }
  }

  goToCompany(companySelected: Company): void {
    localStorage.setItem('company', JSON.stringify(companySelected));
    this.publicService.company = companySelected;
    this.router.navigate(['/public/', companySelected.tx_company_string]);
  }

  cleanInput(inputCompany) {
    inputCompany.value = null;
  }

  salir(): void {
    this.publicService.clearPublicSession();
    this.router.navigate(['/home'])
  }

}
