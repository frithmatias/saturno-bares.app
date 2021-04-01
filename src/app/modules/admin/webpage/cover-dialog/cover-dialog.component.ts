import { Component, Input, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Cover, CompanyResponse } from '../../../../interfaces/company.interface';
import { AdminService } from '../../admin.service';
import { PublicService } from '../../../public/public.service';
import { LoginService } from '../../../../services/login.service';

@Component({
  selector: 'app-cover-dialog',
  templateUrl: './cover-dialog.component.html',
  styleUrls: ['./cover-dialog.component.css']
})
export class CoverDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<CoverDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Cover,
    private adminService: AdminService,
    private publicService: PublicService,
    private loginService: LoginService
  ) { }

  ngOnInit(): void { }

  closeDialog() {
    this.dialogRef.close();
  }

  selectCover(cover: Cover) {
    const idCompany = this.loginService.user.id_company._id;
    const coverFilename = cover.filename;
    this.adminService.updateCover(idCompany, coverFilename).subscribe((data: CompanyResponse) => {
      this.publicService.snack(data.msg, 5000)
      if (data.ok) {
        this.loginService.user.id_company = data.company;
        this.loginService.pushUser(this.loginService.user);
      }
      this.dialogRef.close();
    })
  }
}
