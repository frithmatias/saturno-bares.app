import { Component, OnInit, Input } from '@angular/core';
import { AdminService } from 'src/app/modules/admin/admin.service';
import { Section, SectionResponse } from 'src/app/interfaces/section.interface';
import { LoginService } from 'src/app/services/login.service';
import { MatTableDataSource } from '@angular/material/table';
import { PublicService } from 'src/app/modules/public/public.service';

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
  dataSource = new MatTableDataSource<Section>();

  constructor(
    public loginService: LoginService,
    public adminService: AdminService,
    private publicService: PublicService
  ) { }

  ngOnInit(): void { }

  deleteSection(section: Section): void {
    this.publicService.snack(`Desea eliminar el sector ${section.tx_section}`, 2000, 'Aceptar').then(ok => {
      if (ok) {
        let idSection = section._id;
        this.adminService.deleteSection(idSection).subscribe((data: SectionResponse) => {
          this.publicService.snack(data.msg, 1000);
          this.adminService.sections = this.adminService.sections.filter(section => section._id != idSection);
        },
          (err: SectionResponse) => {
            this.publicService.snack(err.msg, 3000);
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
