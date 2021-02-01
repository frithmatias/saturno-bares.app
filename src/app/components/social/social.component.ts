import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
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

export interface outputResponse {
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
export class SocialComponent implements OnInit {
  @ViewChild('validateTicketGoogle') gButton: any;
  @Output() socialResponse: EventEmitter<outputResponse> = new EventEmitter();

  auth2: any; // info de google con el token

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
    this.facebookInit();
  }

  // ==========================================================
  // VALIDATE TICKET WITH GOOGLE
  // ==========================================================

  googleInit(button) {
    gapi.load('auth2', () => {
      this.auth2 = gapi.auth2.init({
        client_id: environment.gapi_uid,
        cookiepolicy: 'single_host_origin',
        scope: 'profile email'
      });
      this.attachSignin(button?._elementRef.nativeElement);
    });
  }

  attachSignin(element) {
    this.auth2.attachClickHandler(element, {}, googleUser => {
      const txPlatform = 'google';
      const txToken = googleUser.getAuthResponse().id_token;
      const idUser = googleUser.Fs.lt;
      const txName = googleUser.Fs.sd;
      const txImage = googleUser.Fs.wI;
      this.socialResponse.emit({ txPlatform: txPlatform, txToken: txToken, idUser: idUser, txName: txName, txImage: txImage })
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
      const txPlatform = 'facebook';
      const txName = response.name;
      const idUser = response.email;
      if (!idUser || !txName) {
        this.publicService.snack('No obtuvimos permiso para validar tu reserva', 5000, 'OK');
        FB.login((response) => {
          if (response.status !== 'connected') {
            return;
          }
        })
        return;
      }
      this.socialResponse.emit({ txPlatform: txPlatform, txToken: null, idUser: idUser, txName: txName, txImage: null })
    });
  }

  // ==========================================================
  // VALIDATE TICKET WITH TELEGRAM
  // ==========================================================

  validateTicketTelegram() {
    window.Telegram.Login.auth({ bot_id: '1545224984', request_access: true }, (response) => {
      if (!response) {
        this.publicService.snack('No obtuvimos permiso para validar tu reserva', 5000, 'OK');
      }
      const txPlatform = 'telegram';
      const txName = response.first_name;
      const idUser = response.id;
      const txPhoto = response.photo_url;
      const txUsername = response.username;
      this.socialResponse.emit({ txPlatform: txPlatform, txToken: null, idUser: idUser, txName: txName, txImage: null })
    })
  }

  // ==========================================================
  // VALIDATE TICKET WITH EMAIL
  // ==========================================================

  emailValidate() {
    this.publicService.snack('Esta opción va a estar disponible en breve', 5000, 'OK');
  }

}



