import { Component, OnInit, Input } from '@angular/core';
import { AdminService } from '../admin.service';
import { MatSnackBar, MatSnackBarDismiss } from '@angular/material/snack-bar';
import { Section, SectionResponse } from '../../../interfaces/section.interface';
import { Subscription } from 'rxjs';
import { LoginService } from '../../../services/login.service';

@Component({
  selector: 'app-sections',
  templateUrl: './sections.component.html',
  styleUrls: ['./sections.component.css']
})
export class SectionsComponent implements OnInit  {
  @Input() nomargin: boolean;
  @Input() nopadding: boolean;

  userSubscription: Subscription;

  constructor(
    public loginService: LoginService,
    public adminService: AdminService,
    private snack: MatSnackBar
  ) { }

  ngOnInit(): void {}

  deleteSection(section: Section): void {
    this.snack.open(`Desea eliminar el sector ${section.tx_section}`, 'ELIMINAR', { duration: 10000 }).afterDismissed().subscribe((data: MatSnackBarDismiss) => {
      if (data.dismissedByAction) {
        let idSection = section._id;
        this.adminService.deleteSection(idSection).subscribe((data: SectionResponse) => {
          this.snack.open(data.msg, null, { duration: 5000 });
          this.adminService.sections = this.adminService.sections.filter(section => section._id != idSection);
        },
          (err: SectionResponse) => {
            this.snack.open(err.msg, null, { duration: 5000 });
          }
        )
      }
    });
  }

  sectionCreated(section: Section): void {
    this.adminService.sections.push(section);
  }


}
