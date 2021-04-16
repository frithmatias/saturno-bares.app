import { Component, OnInit, OnDestroy, Input } from '@angular/core';

import { Subscription } from 'rxjs';
import { AdminService } from 'src/app/modules/admin/admin.service';
import { LoginService } from 'src/app/services/login.service';
import { User, UsersResponse, UserResponse } from 'src/app/interfaces/user.interface';
import { PublicService } from 'src/app/modules/public/public.service';

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
    private publicService: PublicService
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
    let idCompany = this.loginService.user.id_company._id;
    this.readWaiters(idCompany);
  }

  readWaiters(idCompany: string): void {
    this.adminService.readWaiters(idCompany).subscribe((data: UsersResponse) => {
      this.adminService.waiters = [...data.users];
    });
  }

  deleteWaiter(waiter: User): void {

    let idWaiter = waiter._id;
    if (idWaiter === this.loginService.user._id) {
      this.publicService.snack('No podés borrar tu propio usuario!', 3000);
      return;
    }

    this.publicService.snack(`Desea eliminar el asistente ${waiter.tx_name}?`, 3000, 'Aceptar').then(() => {

      this.adminService.deleteWaiter(idWaiter).subscribe((data: UserResponse) => {
        this.waiterEdit = 'clear_form';
        this.publicService.snack(data.msg, 1000);
        this.adminService.waiters = this.adminService.waiters.filter(waiter => waiter._id != idWaiter);
      },
        (err: UserResponse) => {
          this.publicService.snack(err.msg, 3000)
        }
      )

    })
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }
}
