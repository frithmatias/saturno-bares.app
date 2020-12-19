import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, Validators, FormControl, FormGroupDirective } from '@angular/forms';
import { SharedService } from 'src/app/services/shared.service';
import { AdminService } from '../admin.service';
import { Company } from 'src/app/interfaces/company.interface';
import { LoginService } from '../../../services/login.service';
import { CompanyResponse } from '../../../interfaces/company.interface';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  @Input() nomargin: boolean;
  @Input() nopadding: boolean;

  formAbout: FormGroup;
  aboutEdit: false;
  company: Company;
  header = {
    logo:
    {
      icon: 'mdi mdi-image',
      title: 'Subi el logo',
      subtitle: 'Subí el logo de tu comercio. El formato deseable es cuadrado con fondo transparante.'
    },
    banners: {
      icon: 'mdi mdi-image',
      title: 'Subir Imagenes',
      subtitle: 'Subí fotos de tu comercio. Estas imagenes se verán en la web page. La relación deseable es 5:2 y el tamaño del canvas es de 500px x 200px.'
    }
  }

  constructor(
    private sharedService: SharedService,
    private loginService: LoginService,
    public adminService: AdminService
  ) { }

  ngOnInit(): void {

    this.company = this.loginService.user.id_company;

    this.formAbout = new FormGroup({
      txWelcome: new FormControl(this.company.tx_company_welcome, Validators.required)
    })
    console.log(this)
  }


  sendAbout(formDirective: FormGroupDirective) {
    if (this.formAbout.invalid) return;

    let idCompany = this.company._id;
    let data = { txWelcome: this.formAbout.value.txWelcome };
    this.adminService.updateAbout(data, idCompany).subscribe((data: CompanyResponse) => {
      if(data.ok){
        this.company = data.company;
        this.loginService.user.id_company = data.company;
        this.loginService.pushUser(this.loginService.user);
        this.sharedService.snack('Los datos fueron guradados correctamente', 3000);
      } else {
        console.log('asdfasd')
      }
    },(err)=>{
      console.log(err)
    })
  }

  resetForm(formDirective: FormGroupDirective) {
    this.aboutEdit = null;
    this.formAbout.enable();
    this.formAbout.reset();
    formDirective.resetForm();
    this.sharedService.scrollTop();
  }

  companyUpdated(company: Company): void {
    this.loginService.user.id_company = company;
    this.loginService.pushUser(this.loginService.user);
  }

}
