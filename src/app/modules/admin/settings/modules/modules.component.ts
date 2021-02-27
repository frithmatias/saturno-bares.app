import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from 'src/app/interfaces/settings.interface';
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

  settings: Settings; // local settings before save (component)
  userSubscription: Subscription;
  saveDisabled = true;

  constructor(
    public adminService: AdminService,
    public loginService: LoginService,
    public publicService: PublicService,
    private bottomSheet: MatBottomSheet
  ) { }

  ngOnInit(): void {

    let idCompany = this.loginService.user.id_company?._id;
    if (idCompany) this.readSettings(idCompany);
    this.userSubscription = this.loginService.user$.subscribe(user => {
      let idCompany = user?.id_company?._id;
      if (idCompany) {
        this.readSettings(idCompany);
      }
    });
  }

  readSettings(idCompany) {
    this.publicService.readSettings(idCompany).subscribe((data: SettingsResponse) => {
      this.publicService.settings = data.settings;
      this.settings = data.settings;
    });
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

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

	openBottomSheet = (idHelp: string): void => {
		this.bottomSheet.open(HelpComponent, { data: { idHelp } });
	}

}
