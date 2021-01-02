import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, Validators, FormControl, FormGroupDirective } from '@angular/forms';
import { SharedService } from 'src/app/services/shared.service';
import { AdminService } from '../admin.service';
import { Company } from 'src/app/interfaces/company.interface';
import { LoginService } from '../../../services/login.service';
import { CompanyResponse } from '../../../interfaces/company.interface';

@Component({
  selector: 'app-webpage',
  templateUrl: './webpage.component.html',
  styleUrls: ['./webpage.component.css']
})
export class WebPageComponent implements OnInit {

  @Input() nomargin: boolean;
  @Input() nopadding: boolean;

  formWebPage: FormGroup;
  webpageEdit: false;
  header = {
    logo:
    {
      icon: 'mdi mdi-image',
      title: 'Subi el logo de tu comercio',
      subtitle: 'Subí el logo de tu comercio. El formato deseable es cuadrado con fondo transparante.'
    },
    banners: {
      icon: 'mdi mdi-image',
      title: 'Subir fotos de tu comercio',
      subtitle: 'Subí fotos de tu comercio. Estas imagenes se verán en la web page. La relación deseable es 5:2 y el tamaño del canvas es de 500px x 200px.'
    }
  }

  constructor(
    private sharedService: SharedService,
    public loginService: LoginService,
    public adminService: AdminService
  ) { }

  ngOnInit(): void {

    this.formWebPage = new FormGroup({
      txEmail: new FormControl(this.loginService.user.id_company?.tx_email),
      txWhatsapp: new FormControl(this.loginService.user.id_company?.tx_whatsapp),
      txFacebook: new FormControl(this.loginService.user.id_company?.tx_facebook),
      txTwitter: new FormControl(this.loginService.user.id_company?.tx_twitter),
      txInstagram: new FormControl(this.loginService.user.id_company?.tx_instagram),
      txWelcome: new FormControl(this.loginService.user.id_company?.tx_company_welcome, Validators.required)
    })

  }


  sendWebPage(formDirective: FormGroupDirective) {
    if (this.formWebPage.invalid) return;

    let idCompany = this.loginService.user.id_company._id;
    let data = { 
      txEmail: this.formWebPage.value.txEmail, 
      txWhatsapp: this.formWebPage.value.txWhatsapp, 
      txFacebook: this.formWebPage.value.txFacebook, 
      txTwitter: this.formWebPage.value.txTwitter, 
      txInstagram: this.formWebPage.value.txInstagram, 
      txWelcome: this.formWebPage.value.txWelcome };
    this.adminService.updateWebPage(data, idCompany).subscribe((data: CompanyResponse) => {
      if(data.ok){
        this.loginService.user.id_company = data.company;
        this.loginService.pushUser(this.loginService.user);
        this.sharedService.snack('Los datos fueron guradados correctamente', 3000);
      } 
    })
  }

  resetForm(formDirective: FormGroupDirective) {
    this.webpageEdit = null;
    this.formWebPage.enable();
    this.formWebPage.reset();
    formDirective.resetForm();
    this.sharedService.scrollTop();
  }

  dataUpdated(dataUpdated: any): void {
    this.loginService.pushUser(this.loginService.user)
  }

}
