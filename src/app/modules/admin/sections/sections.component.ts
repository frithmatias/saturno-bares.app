import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { AdminService } from '../admin.service';
import { MatSnackBar, MatSnackBarDismiss } from '@angular/material/snack-bar';
import { Section, SectionsResponse, SectionResponse } from '../../../interfaces/section.interface';
import { User } from '../../../interfaces/user.interface';
import { Subscription } from 'rxjs';
import { LoginService } from '../../../services/login.service';

@Component({
  selector: 'app-sections',
  templateUrl: './sections.component.html',
  styleUrls: ['./sections.component.css']
})
export class SectionsComponent implements OnInit, OnDestroy {
  @Input() nomargin: boolean;
  @Input() nopadding: boolean;

  sections: Section[];
  user: User;
  userSubscription: Subscription;

  constructor(
    private adminService: AdminService,
    private loginService: LoginService,
    private snack: MatSnackBar
  ) { }

  ngOnInit(): void {

    if (this.loginService.user) {

      this.user = this.loginService.user;

      if (this.user.id_company) {
        let idCompany = this.user.id_company._id;
        this.readSections(idCompany);
      }

      this.userSubscription = this.loginService.user$.subscribe(data => {
        if (data) {
          this.user = data;
          if (data.id_company) { this.readSections(data.id_company._id); }
        }
      });

    }
  }

  editSection(idSection: string): void {

  }

  deleteSection(section: Section): void {
    this.snack.open(`Desea eliminar el sector ${section.tx_section}`, 'ELIMINAR', { duration: 10000 }).afterDismissed().subscribe((data: MatSnackBarDismiss) => {
      if (data.dismissedByAction) {
        let idSection = section._id;
        this.adminService.deleteSection(idSection).subscribe((data: SectionResponse) => {
          this.snack.open(data.msg, null, { duration: 5000 });
          this.sections = this.sections.filter(section => section._id != idSection);
        },
          (err: SectionResponse) => {
            this.snack.open(err.msg, null, { duration: 5000 });
          }
        )
      }
    });
  }

  sectionCreated(section: Section): void {
    this.sections.push(section);
  }

  readSections(idCompany: string) {
    return new Promise((resolve, reject) => {
      this.adminService.readSections(idCompany).subscribe((data: SectionsResponse) => {
        if(data.ok){
          this.sections = data.sections; // filter default_section
          this.adminService.sections = data.sections;
          resolve(data.sections);
        }
      });
    })
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }
}
