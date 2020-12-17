import { Component, OnInit, OnDestroy, Input } from '@angular/core';

// libraries
import { MatSnackBar, MatSnackBarDismiss } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

// services
import { AdminService } from '../admin.service';
import { LoginService } from '../../../services/login.service';
import { SharedService } from '../../../services/shared.service';

// interfaces
import { User, UsersResponse, UserResponse } from '../../../interfaces/user.interface';

@Component({
  selector: 'app-waiters',
  templateUrl: './waiters.component.html',
  styleUrls: ['./waiters.component.css']
})
export class WaitersComponent implements OnInit, OnDestroy {
  @Input() nomargin: boolean;
  @Input() nopadding: boolean;

  displayedColumns: string[] = ['id_role', 'tx_name', '_id'];

  waiterCreate = false;
  waiterEdit: User | String;
  idWaiterUpdated: string;
  user: User;
  userSubscription: Subscription;

  constructor(
    public adminService: AdminService,
    public loginService: LoginService,
    private sharedService: SharedService,
    private snack: MatSnackBar
  ) { }

  ngOnInit(): void {
    if (this.loginService.user) {

      this.user = this.loginService.user;

      if (this.user.id_company) {
        let idCompany = this.user.id_company._id;
        this.readWaiters(idCompany);
      }

      this.userSubscription = this.loginService.user$.subscribe(data => {
        if (data) {
          this.user = data;
          if (data.id_company) { this.readWaiters(data.id_company._id); }
        }
      })
    }

  }


  editWaiter(waiter: User): void {
    this.waiterCreate = true;
    this.waiterEdit = waiter
  }

  // waiter was created or updated
  waiterUpdated(idWaiter: string): void {
    this.waiterCreate = false;
    this.idWaiterUpdated = idWaiter;
    this.readWaiters(this.loginService.user.id_company._id);
  }

  readWaiters(idCompany: string): void {
    this.adminService.readWaiters(idCompany).subscribe((data: UsersResponse) => {
      this.adminService.waiters = [...data.users];
    });
  }

  deleteWaiter(idWaiter: string): void {
    if (idWaiter === this.loginService.user._id) {
      this.sharedService.snack('No podés borrar tu propio usuario!', 2000);
      return;
    }
    this.snack.open('Desea eliminar el asistente?', 'ELIMINAR', { duration: 10000 }).afterDismissed().subscribe((data: MatSnackBarDismiss) => {
      if (data.dismissedByAction) {
        this.adminService.deleteWaiter(idWaiter).subscribe((data: UserResponse) => {
          this.waiterEdit = 'clear_form';
          this.snack.open(data.msg, null, { duration: 5000 });
          this.adminService.waiters = this.adminService.waiters.filter(waiter => waiter._id != idWaiter);
        },
          (err: UserResponse) => {
            this.snack.open(err.msg, null, { duration: 5000 });
          }
        )
      }
    })
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }
}
