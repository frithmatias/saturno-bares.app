import { Injectable } from '@angular/core';
import { CanLoad } from '@angular/router';
import { LoginService } from '../services/login.service';
import { PublicService } from '../modules/public/public.service';

@Injectable()
export class SuperGuard implements CanLoad {

  constructor(
    public loginService: LoginService,
    private publicService: PublicService
  ) { }

  async canLoad() {
    const resp: boolean = await this.check();
    return resp;
  }

  check(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.loginService.checkSuper().subscribe((ok: boolean) => {
        if (ok) {
          resolve(true);
        } else {
          this.publicService.snack('No tiene permisos esta acción fue reportada', 5000);
          this.loginService.logout();
          resolve(false);
        }
      })
    })
  }


}
