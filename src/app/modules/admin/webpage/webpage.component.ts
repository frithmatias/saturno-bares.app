import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormControl, FormGroupDirective } from '@angular/forms';
import { AdminService } from '../admin.service';
import { LoginService } from '../../../services/login.service';
import { CompanyResponse, Cover, ReadCoversResponse } from '../../../interfaces/company.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { PublicService } from '../../public/public.service';
import { MatDialog } from '@angular/material/dialog';
import { CoverDialogComponent } from './cover-dialog/cover-dialog.component';
import { Subscription } from 'rxjs';
import { User } from 'src/app/interfaces/user.interface';

@Component({
  selector: 'app-webpage',
  templateUrl: './webpage.component.html',
  styleUrls: ['./webpage.component.css']
})
export class WebPageComponent implements OnInit, OnDestroy {

  loading = false;
  formWebPage: FormGroup;
  webpageEdit: false;
  header = {
    logo:
    {
      icon: 'mdi mdi-image',
      title: 'Logo',
      subtitle: null
    },
    cover: {
      icon: 'mdi mdi-image',
      title: 'Portada',
      subtitle: null
    }
  }

  userSubscription: Subscription;
  defaultCovers: Cover[];
  coverSelected: string;

  constructor(
    private publicService: PublicService,
    public loginService: LoginService,
    public adminService: AdminService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {

    this.formWebPage = new FormGroup({
      txEmail: new FormControl(this.loginService.user.id_company?.tx_email, Validators.maxLength(50)),
      txTelegram: new FormControl(this.loginService.user.id_company?.tx_telegram, Validators.maxLength(30)),
      txWhatsapp: new FormControl(this.loginService.user.id_company?.tx_whatsapp, Validators.maxLength(30)),
      txFacebook: new FormControl(this.loginService.user.id_company?.tx_facebook, Validators.maxLength(30)),
      txTwitter: new FormControl(this.loginService.user.id_company?.tx_twitter, Validators.maxLength(30)),
      txInstagram: new FormControl(this.loginService.user.id_company?.tx_instagram, Validators.maxLength(30)),
      txWelcome: new FormControl(this.loginService.user.id_company?.tx_company_welcome, [Validators.required, Validators.maxLength(1000)])
    })

    // obtengo las portadas predefinidas
    this.adminService.readCovers().subscribe((data: ReadCoversResponse) => {
      this.defaultCovers = data.covers;
    })

    // me suscribo al observable user para obtener los cambios de portada 
    this.userSubscription = this.loginService.user$.subscribe((user: User) => {
      if (user?._id) {
        this.coverSelected = this.loginService.user.id_company.tx_company_cover;
      }
    });

    this.coverSelected = this.loginService.user.id_company?.tx_company_cover || null;
  }


  sendWebPage(formDirective: FormGroupDirective) {
    if (this.formWebPage.invalid) return;

    let idCompany = this.loginService.user.id_company._id;
    let data = { 
      txEmail: this.formWebPage.value.txEmail, 
      txTelegram: this.formWebPage.value.txTelegram, 
      txWhatsapp: this.formWebPage.value.txWhatsapp, 
      txFacebook: this.formWebPage.value.txFacebook, 
      txTwitter: this.formWebPage.value.txTwitter, 
      txInstagram: this.formWebPage.value.txInstagram, 
      txWelcome: this.formWebPage.value.txWelcome 
    };

    this.loading = true;
    this.adminService.updateWebPage(data, idCompany).subscribe((data: CompanyResponse) => {
      this.loading = false;
      if(data.ok){
        this.loginService.user.id_company = data.company;
        this.loginService.pushUser(this.loginService.user);
        this.publicService.snack(data.msg, 3000);
      } 
    }, (err: HttpErrorResponse) => {
      this.loading = false;
      this.publicService.snack(err.error.msg, 3000);
    })
  }

  resetForm(formDirective: FormGroupDirective) {
    this.webpageEdit = null;
    this.formWebPage.enable();
    this.formWebPage.reset();
    formDirective.resetForm();
    this.publicService.scrollTop();
  }

  dataUpdated(dataUpdated: any): void {
    this.loginService.pushUser(this.loginService.user)
  }


  openDialog(cover: Cover){
    const dialogRef = this.dialog.open(CoverDialogComponent, {data: cover});
    dialogRef.afterClosed().subscribe(result => {
      
    });
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }


}
