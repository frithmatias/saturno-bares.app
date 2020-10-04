import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from 'src/app/interfaces/user.interface';
import { Subscription } from 'rxjs';
import { WaiterService } from '../../../modules/waiter/waiter.service';
import { LoginService } from '../../../services/login.service';
import { SharedService } from 'src/app/services/shared.service';
import { SectionResponse, Section, SectionsResponse } from '../../../interfaces/section.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  loading = false;
  sections: Section[] = [];
  sectionsAvailable: Section[] = [];
  section: Section;
  userSuscription: Subscription
  user: User;
  constructor(
    private router: Router,
    public loginService: LoginService,
    private waiterService: WaiterService,
    private sharedService: SharedService,
    private snack: MatSnackBar
  ) { }

  ngOnInit(): void {

    this.loading = true;

    if (this.loginService.user.id_company?._id) {
      let idCompany = this.loginService.user.id_company._id;
      this.readSections(idCompany);
    } else {
      this.sharedService.snackShow('No tiene una empresa seleccionada', 5000);
      this.loading = false;
      return;
    }

    
    this.userSuscription = this.loginService.user$.subscribe(data => {
      if (data) {
        this.readSections(data.id_company._id);
      }
    })
  }

  takeSection(section: Section): void {

    if (!section) {
      return;
    }

    if(this.waiterService.section){
      this.router.navigate(['/waiter/section']);
      return;
    }

    let idSection = section._id;
    let idWaiter = this.loginService.user._id;

    this.waiterService.takeSection(idSection, idWaiter).subscribe((data: SectionResponse) => {
      this.snack.open(data.msg, null, { duration: 2000 });
      if (data.ok) {
        this.waiterService.section = data.section;
        localStorage.setItem('section', JSON.stringify(data.section));
        this.router.navigate(['/waiter/section']);
      } else {
        this.snack.open('No se pudo tomar un escritorio', null, { duration: 2000 });
      }
    })
  }

  readSections(idCompany: string): void {
    this.waiterService.readSections(idCompany).subscribe((data: SectionsResponse) => {
      if(data.ok){
        this.sections = data.sections;
        this.sectionsAvailable = this.sections.filter(section => section.id_session === null);
        this.section = this.sections.filter(section => section.id_session?.id_section === this.waiterService.section?._id && this.waiterService.section)[0]
      }

      if (this.section) {
        this.waiterService.section = this.section;
        localStorage.setItem('section', JSON.stringify(this.section));
      } else {
        delete this.waiterService.section;
        if (localStorage.getItem('section')) { localStorage.removeItem('section'); }
      }

    },
    ()=>{this.loading = false;},()=>{this.loading = false;});
  }

  releaseSection(section: Section): void {
    
    this.loading = true;

    let idSection = section._id;
    let idCompany = this.loginService.user.id_company._id;
    this.waiterService.releaseSection(idSection).subscribe(data => {
      this.readSections(idCompany);
      
    },
    ()=>{this.loading = false;},()=>{this.loading = false;})
  }

  ngOnDestroy(): void {
    if(this.userSuscription){this.userSuscription.unsubscribe();}
  }
}
