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

  settings: Settings; // local settings before save (component)
  blUpdated = false;
  blDisabled = true;
  txMessage: string = '';
  showHelp = false;
  
  constructor(
    public loginService: LoginService,
    public adminService: AdminService,
    public sharedService: SharedService
  ) { }

  ngOnInit(): void {
    let idCompany = this.loginService.user.id_company._id;
    this.adminService.readSettings(idCompany).then((data: SettingsResponse) => {
      this.settings = data.settings; // rompo la referencia la objeto original
    })
  }

  updateSettings() {
    this.blUpdated = false;
    this.adminService.updateSettings(this.settings).subscribe((data: SettingsResponse) => {
      if (data.ok) {

        this.settings = Object.assign({}, data.settings);
        this.adminService.settings = data.settings;
        this.blDisabled = true;
        this.blUpdated = true;
        this.sharedService.snack(data.msg, 2000);

      }
    })
  }

  check() {
    this.blDisabled = !this.settings.bl_spm_auto === this.adminService.settings.bl_spm_auto;
    this.blUpdated = false;
  }

  sendMessage() {
    let txMessage = this.txMessage;

    if (txMessage.length > 100) {
      this.sharedService.snack('El mensaje no puede contener mas de 100 caracteres', 5000, 'Aceptar');
      return;
    }

    let idCompany = this.loginService.user.id_company._id;
    this.adminService.sendMessage(idCompany, txMessage).subscribe(data => {
      this.txMessage = '';
      this.sharedService.snack('El mensaje fue enviado correctamente', 2000);
    })
  }
}
