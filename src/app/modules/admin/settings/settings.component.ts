import { Component, OnInit } from '@angular/core';
import { Settings } from 'src/app/interfaces/settings.interface';
import { LoginService } from '../../../services/login.service';
import { AdminService } from '../admin.service';
import { SettingsResponse } from '../../../interfaces/settings.interface';
import { PublicService } from '../../public/public.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  settings: Settings; // local settings before save (component)
  saveDisabled = true;
  txMessage: string = '';
  showQueueHelp = false;
  showSpmHelp = false;
  showScheduleHelp = false;
  
  constructor(
    public loginService: LoginService,
    public adminService: AdminService,
    public publicService: PublicService
  ) { }

  ngOnInit(): void {
    let idCompany = this.loginService.user.id_company._id;
    this.publicService.readSettings(idCompany).subscribe((data: SettingsResponse) => {
      this.publicService.settings = data.settings; // rompo la referencia la objeto original
      this.settings = data.settings;
    })
  }

  updateSettings() {
    this.adminService.updateSettings(this.settings).subscribe((data: SettingsResponse) => {
      if (data.ok) {
        this.settings = Object.assign({}, data.settings);
        this.publicService.settings = data.settings;
        this.saveDisabled = true;
        this.publicService.snack(data.msg, 2000);
      }
    })
  }

  check(item: string) {
    if (this.settings.bl_queue === false && item === 'queue') this.settings.bl_spm = false;
    if (this.settings.bl_spm === true && item === 'spm') this.settings.bl_queue = true;
    this.saveDisabled = false;
  }

  showHelp(item: string ){
    this.showQueueHelp = item === 'queue' ? !this.showQueueHelp : false;
    this.showSpmHelp = item === 'spm' ? !this.showSpmHelp : false;
    this.showScheduleHelp = item === 'schedule' ? !this.showScheduleHelp : false;
  }

  sendMessage() {
    let txMessage = this.txMessage;

    if (txMessage.length > 100) {
      this.publicService.snack('El mensaje no puede tener mas de 100 caracteres', 5000, 'Aceptar');
      return;
    }

    let idCompany = this.loginService.user.id_company._id;
    this.adminService.sendMessage(idCompany, txMessage).subscribe(data => {
      this.txMessage = '';
      this.publicService.snack('El mensaje fue enviado correctamente', 2000);
    })
  }
}
