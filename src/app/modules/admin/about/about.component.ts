import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl, FormGroupDirective } from '@angular/forms';
import { SharedService } from 'src/app/services/shared.service';
import { AdminService } from '../admin.service';
import { Company } from 'src/app/interfaces/company.interface';
import { LoginService } from '../../../services/login.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  formAbout: FormGroup;
  aboutEdit: false;
  company: Company;

  constructor(
    private sharedService: SharedService,
    private loginService: LoginService,
    public adminService: AdminService
  ) { }

  ngOnInit(): void {
    
    this.company = this.loginService.user.id_company;

    this.formAbout = new FormGroup({
      txAbout: new FormControl('', Validators.required)
    })
  }


  sendAbout(formDirective: FormGroupDirective) {
    console.log(this.formAbout.value)
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
