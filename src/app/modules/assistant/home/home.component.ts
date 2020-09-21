import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Desktop, DesktopsResponse, DesktopResponse } from 'src/app/interfaces/desktop.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from 'src/app/interfaces/user.interface';
import { Subscription } from 'rxjs';
import { AssistantService } from '../../../modules/assistant/assistant.service';
import { LoginService } from '../../../services/login.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  loading = false;
  desktops: Desktop[] = [];
  desktopsAvailable: Desktop[] = [];
  myDesktop: Desktop;
  userSuscription: Subscription
  user: User;
  constructor(
    private router: Router,
    public loginService: LoginService,
    private assistantService: AssistantService,
    private sharedService: SharedService,
    private snack: MatSnackBar
  ) { }

  ngOnInit(): void {

    this.loading = true;

    if (this.loginService.user.id_company?._id) {
      let idCompany = this.loginService.user.id_company._id;
      this.readDesktops(idCompany);
    } else {
      this.sharedService.snackShow('No tiene una empresa seleccionada', 5000);
      this.loading = false;
      return;
    }

    
    this.userSuscription = this.loginService.user$.subscribe(data => {
      if (data) {
        this.readDesktops(data.id_company._id);
      }
    })
  }

  takeDesktop(desktop: Desktop): void {

    if (!desktop) {
      return;
    }

    if(this.assistantService.desktop){
      this.router.navigate(['/assistant/desktop']);
      return;
    }

    let idDesktop = desktop._id;
    let idAssistant = this.loginService.user._id;

    this.assistantService.takeDesktop(idDesktop, idAssistant).subscribe((data: DesktopResponse) => {
      this.snack.open(data.msg, null, { duration: 2000 });
      if (data.ok) {
        this.assistantService.desktop = data.desktop;
        localStorage.setItem('desktop', JSON.stringify(data.desktop));
        this.router.navigate(['/assistant/desktop']);
      } else {
        this.snack.open('No se pudo tomar un escritorio', null, { duration: 2000 });
      }
    })
  }

  readDesktops(idCompany: string): void {
    this.assistantService.readDesktops(idCompany).subscribe((data: DesktopsResponse) => {

      if(data.ok){
        this.desktops = data.desktops;
        this.desktopsAvailable = this.desktops.filter(desktop => desktop.id_session === null);
        this.myDesktop = this.desktops.filter(desktop => desktop.id_session?.id_assistant._id === this.loginService.user._id)[0]
      }
      if (this.myDesktop) {
        this.assistantService.desktop = this.myDesktop;
        localStorage.setItem('desktop', JSON.stringify(this.myDesktop));
      } else {
        delete this.assistantService.desktop;
        if (localStorage.getItem('desktop')) { localStorage.removeItem('desktop'); }
      }

    },
    ()=>{this.loading = false;},()=>{this.loading = false;});
  }

  releaseDesktop(desktop: Desktop): void {
    
    this.loading = true;

    let idDesktop = desktop._id;
    let idCompany = this.loginService.user.id_company._id;
    this.assistantService.releaseDesktop(idDesktop).subscribe(data => {
      this.readDesktops(idCompany);
      
    },
    ()=>{this.loading = false;},()=>{this.loading = false;})
  }

  ngOnDestroy(): void {
    if(this.userSuscription){this.userSuscription.unsubscribe();}
  }
}
