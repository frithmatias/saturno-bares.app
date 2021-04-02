import { Component, OnInit } from '@angular/core';
import { PublicService } from '../../modules/public/public.service';
import { Router } from '@angular/router';
import { CompaniesResponse } from '../../interfaces/company.interface';
import { Company } from 'src/app/interfaces/company.interface';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  companies: Company[] = [];
  companySelected: Company;

  constructor(
    private router: Router,
    private publicService: PublicService,
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    let refInput = document.getElementById('inputCompanyToolbar');
    refInput.focus();
  }

  findCompany(e: HTMLInputElement) {

    if (e.value.length > 1) {
      this.publicService.findCompany(e.value).subscribe((data: CompaniesResponse) => {
        if (data.ok) {
          this.companies = data.companies;
        } else {
          e.value = '';
          this.publicService.snack('No existen resultados.', 2000, null);
        }
      }, () => {
        this.publicService.snack('Error al obtener las empresas', 2000, null);
      })
    }
  }

  setCompany(e: any): void {
    this.companySelected = e;
    localStorage.setItem('company', JSON.stringify(e));
    this.router.navigate(['/public/page', e.tx_company_string, 'home']);
  }

  cleanInput(inputCompany) {
    inputCompany.value = null;
  }
}
