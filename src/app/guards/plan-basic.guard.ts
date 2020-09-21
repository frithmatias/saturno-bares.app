import { Injectable } from '@angular/core';
import { CanLoad, Route, UrlSegment, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginService } from '../services/login.service';
import { SharedService } from 'src/app/services/shared.service';

@Injectable({
  providedIn: 'root'
})
export class PlanBasicGuard implements CanLoad {
  constructor(
    private loginService: LoginService,
    private sharedService: SharedService,
    private router: Router
    ) {}
  canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
      if(this.loginService.user.cd_pricing > 0){
        return true;
      } else {
        this.sharedService.snackShow('Su plan no incluye esta sección.', 2000)
        this.router.navigate(['/pricing']); 
        return false;
      }
  }
}
