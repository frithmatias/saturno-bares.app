import { Component, OnInit, ViewChild, Output, EventEmitter, OnChanges, AfterViewInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PublicService } from '../../modules/public/public.service';

declare const gapi: any;
declare const FB: any;
declare const window: any;

interface facebookResponse {
  authResponse: {
    accessToken: string;
    data_access_expiration_time: number;
    expiresIn: number;
    graphDomain: string;
    signedRequest: string;
    userID: string;
  }
  status: string;
}

export interface Social {
  txPlatform: string;
  txToken: string;
  idUser: string;
  txName: string;
  txImage: string;
}

@Component({
  selector: 'app-social',
  templateUrl: './social.component.html',
  styleUrls: ['./social.component.css']
})
export class SocialComponent implements OnInit, AfterViewInit {
  @ViewChild('validateTicketGoogle') gButton: any;
  @Output() socialResponse: EventEmitter<Social> = new EventEmitter();

  auth2: gapi.auth2.GoogleAuth; // info de google con el token
  social: Social = {
    txPlatform: null,
    txToken: null,
    idUser: null,
    txName: null,
    txImage: null,
  };
  facebookResponse: facebookResponse;
  isMobile = false;

  constructor(
    private publicService: PublicService
  ) { }

  ngOnInit(): void {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }

    this.googleInit()
    this.facebookInit();
  }

  // ==========================================================
  // VALIDATE TICKET WITH GOOGLE
  // ==========================================================

  ngAfterViewInit(): void {
    this.googleInit();
  }

  googleInit() {
    gapi.load('auth2', () => {
      this.auth2 = gapi.auth2.init({
        client_id: environment.gapi_uid,
        cookiepolicy: 'single_host_origin',
        scope: 'profile email'
      });
      this.attachSignin(this.gButton?._elementRef.nativeElement);
    });
  }

  attachSignin = (element) => {
    this.auth2.attachClickHandler(element, {}, (googleUser: any) => {
      this.social.txPlatform = 'google';
      this.social.txToken = googleUser.getAuthResponse().id_token;
      this.social.idUser = googleUser.Fs.lt;
      this.social.txName = googleUser.Fs.sd;
      this.social.txImage = googleUser.Fs.wI;
      localStorage.setItem('social', JSON.stringify(this.social));
      this.socialResponse.emit(this.social)
    }, () => {
      this.publicService.snack('Ocurrio un error de autenticación con auth2', 2000, 'Aceptar');
    });
  }

  // ==========================================================
  // VALIDATE TICKET WITH FACEBOOK
  // ==========================================================

  facebookInit() {
    window.fbAsyncInit = function () {
      FB.init({
        appId: '1615265112007678',
        cookie: true,
        xfbml: true,
        version: 'v9.0'
      });
      FB.AppEvents.logPageView();
    };
    (function (d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) { return; }
      js = d.createElement(s); js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  }

  facebookLogin() {
    FB.getLoginStatus((response) => {
      if (response.status === 'connected') {
        this.validateTicketFacebook();
      } else {
        FB.login((response) => {
          if (response.status === 'connected') {
            this.validateTicketFacebook();
          }
        })
      }
    }, true); // true para deshabilitar el guarado en cache de esta respuesta 
  }

  validateTicketFacebook() {
    FB.api('/me?fields=name,email', (response) => {
      // const idUser = response.id;

      this.social.txPlatform = 'facebook';
      this.social.txToken = null;
      this.social.idUser = response.email;
      this.social.txName = response.name;
      this.social.txImage = null;

      if (!this.social.idUser || !this.social.txName) {
        this.publicService.snack('No obtuvimos permiso para validar tu reserva', 5000, 'Aceptar');
        FB.login((response) => {
          if (response.status !== 'connected') {
            return;
          }
        })
        return;
      }

      localStorage.setItem('social', JSON.stringify(this.social));
      this.socialResponse.emit(this.social)
    });
  }

  // ==========================================================
  // VALIDATE TICKET WITH TELEGRAM
  // ==========================================================

  validateTicketTelegram() {
    window.Telegram.Login.auth({ bot_id: '1545224984', request_access: true }, (response) => {

      if (!response) {
        this.publicService.snack('Error de validación de Telegram.', 5000, 'Aceptar');
        return;
      }

      this.social.txPlatform = 'telegram';
      this.social.txToken = null;
      this.social.idUser = response.id;
      this.social.txName = response.first_name;
      this.social.txImage = response.photo_url;

      localStorage.setItem('social', JSON.stringify(this.social));
      this.socialResponse.emit(this.social);

    })
  }

  // ==========================================================
  // VALIDATE TICKET WITH EMAIL
  // ==========================================================

  emailValidate() {
    this.publicService.snack('Esta opción va a estar disponible próximamente.', 5000, 'Aceptar');
  }



}



