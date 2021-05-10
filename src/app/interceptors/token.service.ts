import { Injectable } from '@angular/core';
import { HttpHeaders, HttpErrorResponse, HttpHandler, HttpEvent, HttpRequest, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { LoginService } from '../services/login.service';
import { catchError, tap } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { PublicService } from '../modules/public/public.service';
import { AdminService } from '../modules/admin/admin.service';

@Injectable({
  providedIn: 'root'
})
export class TokenService implements HttpInterceptor {

  constructor(
    private loginService: LoginService,
    private publicService: PublicService,
    private adminSerivce: AdminService,
    private router: Router
  ) {


  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (this.loginService.token || this.loginService.token) {

      const headers = new HttpHeaders({
        'turnos-token': this.loginService.token || this.loginService.token
      });

      const reqClone = req.clone({
        headers: headers
      })

      return next.handle(reqClone).pipe(
        tap(this.manejarRespuesta),
        catchError(this.manejarError.bind(this)));

    } else {

      return next.handle(req).pipe(
        tap(this.manejarRespuesta),
        catchError(this.manejarError.bind(this)));
    }
  }

  manejarRespuesta(resp: HttpResponse<any>) {
    if (resp.type === 4) { //HttpResponse (Not 2 -> HttpHeadersResponse i.e.)
      if (location.host.split(':')[0] === 'localhost') {
        console.log(resp.body);
      }
    }
  }

  manejarError(error: HttpErrorResponse) {

    // this.publicService.snack(error.error?.msg, 5000);
    if (error.error.code == 1001) { // token expired
      this.publicService.logout();
      this.adminSerivce.logout();
      this.loginService.logout();
    }
    return throwError(error); // Devuelve un error al suscriptor de mi observable.
  }

}
