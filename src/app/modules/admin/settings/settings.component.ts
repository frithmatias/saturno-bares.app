import { Component, OnInit } from '@angular/core';
import { Settings } from 'src/app/interfaces/settings.interface';
import { LoginService } from '../../../services/login.service';
import { AdminService } from '../admin.service';
import { SettingsResponse } from '../../../interfaces/settings.interface';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  constructor(
    public loginService: LoginService,
    public adminService: AdminService,
    public sharedService: SharedService
  ) { }

  ngOnInit(): void {
    let idCompany = this.loginService.user.id_company._id;
    this.adminService.readSettings(idCompany);
  }

  updateSettings(){
    this.adminService.updateSettings(this.adminService.settings).subscribe((data: SettingsResponse) => {
      this.sharedService.snack(data.msg, 2000);
    })
  }

}
