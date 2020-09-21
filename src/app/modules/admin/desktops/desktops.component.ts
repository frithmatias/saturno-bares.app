import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { AdminService } from '../../../modules/admin/admin.service';
import { MatSnackBar, MatSnackBarDismiss } from '@angular/material/snack-bar';
import { Desktop, DesktopsResponse, DesktopResponse } from '../../../interfaces/desktop.interface';
import { User } from 'src/app/interfaces/user.interface';
import { Subscription } from 'rxjs';
import { LoginService } from '../../../services/login.service';

@Component({
  selector: 'app-desktops',
  templateUrl: './desktops.component.html',
  styleUrls: ['./desktops.component.css']
})
export class DesktopsComponent implements OnInit, OnDestroy {
  @Input() nomargin: boolean;
  @Input() nopadding: boolean;
  desktops: Desktop[];
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
        this.readDesktops(idCompany);
      }

      this.userSubscription = this.loginService.user$.subscribe(data => {
        if (data) {
          this.user = data;
          if (data.id_company) { this.readDesktops(data.id_company._id); }
        }
      });

    }
  }

  editDesktop(idDesktop: string): void {

  }

  deleteDesktop(idDesktop: string): void {
    this.snack.open('Desea eliminar el escritorio?', 'ELIMINAR', { duration: 10000 }).afterDismissed().subscribe((data: MatSnackBarDismiss) => {
      if (data.dismissedByAction) {
        this.adminService.deleteDesktop(idDesktop).subscribe((data: DesktopResponse) => {
          this.snack.open(data.msg, null, { duration: 5000 });
          this.desktops = this.desktops.filter(desktop => desktop._id != idDesktop);
        },
          (err: DesktopResponse) => {
            this.snack.open(err.msg, null, { duration: 5000 });
          }
        )
      }
    });
  }

  desktopCreated(desktop: Desktop): void {
    this.desktops.push(desktop);
  }

  readDesktops(idCompany: string) {
    return new Promise((resolve, reject) => {
      this.adminService.readDesktops(idCompany).subscribe((data: DesktopsResponse) => {
        if(data.ok){
          this.desktops = data.desktops.filter(desktops => desktops.bl_generic === false); // filter default_desktop
          this.adminService.desktops = data.desktops;
          resolve(data.desktops);
        }
      });
    })
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }
}
