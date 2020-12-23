import { Component, OnInit, Input } from '@angular/core';
import { AdminService } from '../admin.service';
import { Section, SectionResponse } from '../../../interfaces/section.interface';
import { Subscription } from 'rxjs';
import { LoginService } from '../../../services/login.service';
import { MatTableDataSource } from '@angular/material/table';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-sections',
  templateUrl: './sections.component.html',
  styleUrls: ['./sections.component.css']
})
export class SectionsComponent implements OnInit {

  @Input() nomargin: boolean;
  @Input() nopadding: boolean;

  displayedColumns: string[] = ['tx_section', '_id'];

  sectionCreate = false;
  userSubscription: Subscription;
  dataSource = new MatTableDataSource<Section>();

  constructor(
    public loginService: LoginService,
    public adminService: AdminService,
    private sharedService: SharedService
  ) { }

  ngOnInit(): void { }

  deleteSection(section: Section): void {
    this.sharedService.snack(`Desea eliminar el sector ${section.tx_section}`, 2000, 'Aceptar').then(ok => {
      if (ok) {
        let idSection = section._id;
        this.adminService.deleteSection(idSection).subscribe((data: SectionResponse) => {
          this.sharedService.snack(data.msg, 1000);
          this.adminService.sections = this.adminService.sections.filter(section => section._id != idSection);
        },
          (err: SectionResponse) => {
            this.sharedService.snack(err.msg, 3000);
          }
        )
      }
    })
  }

  sectionCreated(section: Section): void {
    this.adminService.sectionsMap.set(section._id, section.tx_section);
    this.adminService.sections = [section, ...this.adminService.sections];
  }


}
