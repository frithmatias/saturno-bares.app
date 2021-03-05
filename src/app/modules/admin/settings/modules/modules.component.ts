import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { PublicService } from '../../../public/public.service';
import { LoginService } from '../../../../services/login.service';
import { SettingsResponse } from '../../../../interfaces/settings.interface';
import { AdminService } from '../../admin.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { HelpComponent } from '../../../../components/help/help.component';

@Component({
  selector: 'app-modules',
  templateUrl: './modules.component.html',
  styleUrls: ['./modules.component.css']
})
export class ModulesComponent implements OnInit {

  @Input() nomargin: boolean;
  @Input() nopadding: boolean;

  @Output() canContinue: EventEmitter<boolean> = new EventEmitter(); // wizard
  saveDisabled = true;

  constructor(
    public adminService: AdminService,
    public loginService: LoginService,
    public publicService: PublicService,
    private bottomSheet: MatBottomSheet
  ) { }

  ngOnInit(): void { }

  updateSettings() {
    this.adminService.updateSettings(this.publicService.settings).subscribe((data: SettingsResponse) => {
      if (data.ok) {
        this.publicService.settings = Object.assign({}, data.settings);
        this.publicService.settings = data.settings;
        this.saveDisabled = true;
        this.canContinue.emit(true);
        this.publicService.snack(data.msg, 2000);
      }
    })
  }

  check(item: string) {
    if (this.publicService.settings.bl_queue === false && item === 'queue') this.publicService.settings.bl_spm = false;
    if (this.publicService.settings.bl_spm === true && item === 'spm') this.publicService.settings.bl_queue = true;
    this.saveDisabled = false;
    this.canContinue.emit(false);
  }


  openBottomSheet = (idHelp: string): void => {
    this.bottomSheet.open(HelpComponent, { data: { idHelp } });
  }

}
