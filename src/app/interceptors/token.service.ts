import { Injectable } from '@angular/core';
import { HttpHeaders, HttpErrorResponse, HttpHandler, HttpEvent, HttpRequest, HttpInterceptor } from '@angular/common/http';
import { LoginService } from '../services/login.service';
import { catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TokenService implements HttpInterceptor {

  constructor(private loginService: LoginService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (this.loginService.logged()) {

      const headers = new HttpHeaders({
        'turnos-token': this.loginService.token
      });

      const reqClone = req.clone({
        headers: headers
      })

      return next.handle(reqClone).pipe(catchError(this.manejarError));

    } else {

      return next.handle(req);

    }

  }

  manejarError(error: HttpErrorResponse) {
    console.warn('Ocurrio un error en la petición', error);
    return throwError('Error personalizado'); // Devuelve un error al suscriptor de mi observable.
  }


}
