import { Injectable } from '@angular/core';
import { HttpHeaders, HttpErrorResponse, HttpHandler, HttpEvent, HttpRequest, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { LoginService } from '../services/login.service';
import { catchError, tap } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { SharedService } from '../services/shared.service';

@Injectable({
  providedIn: 'root'
})
export class TokenService implements HttpInterceptor {

  constructor(
    private loginService: LoginService,
    private sharedService: SharedService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (this.loginService.logged()) {

      const headers = new HttpHeaders({
        'turnos-token': this.loginService.token
      });

      const reqClone = req.clone({
        headers: headers
      })

      return next.handle(reqClone).pipe(
        tap(this.manejarRespuesta),
        catchError(this.manejarError.bind(this)));

    } else {
      // en peticiones públicas no se inyecta el token 

      return next.handle(req).pipe(
        tap(this.manejarRespuesta),
        catchError(this.manejarError.bind(this)));


    }

  }

  manejarRespuesta(resp: HttpResponse<any>) {
    if (resp.type === 4) { //HttpResponse (Not 2 -> HttpHeadersResponse i.e.)
      console.log(resp.body);
    }
  }

  manejarError(error: HttpErrorResponse) {
    console.warn(error.error);
    this.sharedService.snack(error.error.msg, 5000);

    if (error.error.code == 1001) { // token expired
      this.loginService.logout();
    }
    return throwError(''); // Devuelve un error al suscriptor de mi observable.
  }

}
