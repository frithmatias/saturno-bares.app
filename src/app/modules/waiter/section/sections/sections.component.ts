import { Component, OnInit, Input } from '@angular/core';
import { Section } from '../../../../interfaces/section.interface';
import { WaiterService } from '../../waiter.service';
import { Table } from '../../../../interfaces/table.interface';
import { LoginService } from 'src/app/services/login.service';
import { Router } from '@angular/router';
import { SessionResponse } from '../../../../interfaces/session.interface';

@Component({
  selector: 'app-sections',
  templateUrl: './sections.component.html',
  styleUrls: ['./sections.component.css']
})
export class SectionsComponent implements OnInit {


  @Input() tablesDataBySection: any;
  @Input() ticketsDataBySection: any;

  section: Section;

  constructor(
    public loginService: LoginService,
    public waiterService: WaiterService,
    private router: Router
  ) { }

  ngOnInit(): void {}

  // ========================================================
  // SECTION METHODS
  // ========================================================

  releaseSection = () => {

    let idSection = this.waiterService.session.id_section._id;
    let idWaiter = this.loginService.user._id;

    this.waiterService
      .releaseSection(idSection, idWaiter)
      .subscribe((data: SessionResponse) => {
        if (data.ok) {
          this.waiterService.clearSectionSession();
          this.router.navigate(['waiter/home']);
        }
      });
  };
}
