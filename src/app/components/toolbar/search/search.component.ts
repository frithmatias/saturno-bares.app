import { Component, OnInit } from '@angular/core';
import { PublicService } from '../../../modules/public/public.service';
import { Router } from '@angular/router';
import { CompaniesResponse } from '../../../interfaces/company.interface';
import { Company } from 'src/app/interfaces/company.interface';
import { SharedService } from '../../../services/shared.service';

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
    private sharedService: SharedService
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
          this.sharedService.snackShow('No existen resultados.', 2000, null);
        }
      }, () => {
        this.sharedService.snackShow('Error al obtener las empresas', 2000, null);
      })
      // this.router.navigate(['/public', e.value]);
    }
  }

  setCompany(e: any): void {
    this.companySelected = e;
    this.goToCompany()
  }

  goToCompany(): void {
    if (this.companySelected) {
      localStorage.setItem('company', JSON.stringify(this.companySelected));
      this.publicService.company = this.companySelected;
      this.router.navigate(['/public/', this.companySelected.tx_public_name]);
    }
  }

  cleanInput(inputCompany) {
    inputCompany.value = null;
  }
}
