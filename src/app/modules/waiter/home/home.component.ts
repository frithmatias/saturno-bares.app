import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { WaiterService } from '../../../modules/waiter/waiter.service';
import { LoginService } from '../../../services/login.service';
import { Section, SectionsResponse } from '../../../interfaces/section.interface';
import { SessionResponse, Session, SessionsResponse } from '../../../interfaces/session.interface';
import { PublicService } from '../../public/public.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  loading = false;
  sections: Section[] = [];
  sessions = new Map();
  userSubscription: Subscription;

  constructor(
    private router: Router,
    public loginService: LoginService,
    private waiterService: WaiterService,
    private publicService: PublicService,
  ) { }

  ngOnInit(): void {

    this.loading = true;

    if (this.loginService.user.id_company?._id) {
      let idCompany = this.loginService.user.id_company._id;
      this.readSections(idCompany);
      this.readSessions(idCompany);
    } else {
      this.publicService.snack('No tiene una empresa seleccionada', 5000);
      this.loading = false;
      return;
    }

    this.userSubscription = this.loginService.user$.subscribe(data => {
      if (data) {
        this.readSections(data.id_company._id);
        this.readSessions(data.id_company._id);
      }
    })
  }


  readSections(idCompany: string): void {
    this.publicService.readSections(idCompany).subscribe((data: SectionsResponse) => {
      if (data.ok) {
        this.sections = data.sections;
        this.publicService.sections = this.sections;
      } else {
        delete this.sections;
        delete this.publicService.sections;
      }
    },
      () => { this.loading = false; }, () => { this.loading = false; });
  }

  readSessions(idCompany: string): void {
    this.waiterService.readSessions(idCompany).subscribe((data: SessionsResponse) => {
      if (data.ok) {

        // pick my session
        let mySession = data.sessions.filter(session => session.id_waiter === this.loginService.user?._id);

        if (mySession.length > 0) {
          this.waiterService.session = mySession[0];
          localStorage.setItem('session', JSON.stringify(mySession[0]))
        };

        for (let sector of this.sections) {
          this.sessions.set(sector.tx_section, data.sessions.filter(session => session.id_section.tx_section === sector.tx_section).length)
        }

      } else {
        delete this.sessions;
      }
    },
      () => { this.loading = false; }, () => { this.loading = false; });
  }

  takeSection(section: Section): void {

    if (!section) {
      return;
    }

    if (this.waiterService.session) {
      this.router.navigate(['/waiter/section']);
      return;
    }

    let idSection = section._id;
    let idWaiter = this.loginService.user._id;

    this.waiterService.takeSection(idSection, idWaiter).subscribe((data: SessionResponse) => {
      this.publicService.snack(data.msg, 2000);
      if (data.ok) {
        this.waiterService.session = data.session;
        localStorage.setItem('session', JSON.stringify(data.session));
        this.router.navigate(['/waiter/section']);
      } 
    }, () => { })
  }

  releaseSection(section: Section): void {
    this.loading = true;
    let idSection = section._id;
    let idWaiter = this.loginService.user._id;
    this.waiterService.releaseSection(idSection, idWaiter).subscribe((data: SessionResponse) => {
      if (data.ok) {
        let idCompany = this.loginService.user.id_company._id;
        this.readSessions(idCompany);
        this.waiterService.clearSectionSession();
      }
    })
  }

  ngOnDestroy(): void {
    if (this.userSubscription) { this.userSubscription.unsubscribe(); }
  }
}
