import { Component, OnInit, ViewChild, Output, EventEmitter, OnChanges, AfterViewInit, Input, NgZone } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PublicService } from '../../modules/public/public.service';

declare const gapi: any;
declare const FB: any;
declare const window: any;

@Component({
  selector: 'app-social',
  templateUrl: './social.component.html',
  styleUrls: ['./social.component.css']
})
export class SocialComponent implements OnInit, AfterViewInit {
  @ViewChild('validateTicketGoogle') gButton: any;
  @Output() socialResponse: EventEmitter<Social | null> = new EventEmitter();
  @Input() logout: boolean = false;
  @Input() platforms: string[];

  auth2: gapi.auth2.GoogleAuth; // info de google con el token
  social: Social;
  facebookFrontendResponse: facebookFrontendResponse;
  isMobile = false;

  constructor(
    private publicService: PublicService,
    private zone: NgZone
  ) { }

  ngOnInit(): void {

    if (this.logout) {
      this.logOut();
    }

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }

    // Get social data
    if (localStorage.getItem('social')) {
      this.social = JSON.parse(localStorage.getItem('social'));
    }

    if(this.platforms){
      if (this.platforms.includes('google')) { this.googleInit(); }
      if (this.platforms.includes('facebook')) { this.facebookInit(); }
    }

  }

  ngOnChanges(changes): void {
  }

  // ==========================================================
  // VALIDATE GOOGLE USER
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
      this.attachSignin();

    });
  }

  googleValidate(e) {
    this.attachSignin();
  }

  attachSignin = () => {
    this.auth2.attachClickHandler(this.gButton?._elementRef.nativeElement, {}, (googleUser: any) => {

      this.zone.run(() => {
        const social: Social = {
          txPlatform: 'google',
          txToken: googleUser.getAuthResponse().id_token,
          txEmail: googleUser.Fs.lt,
          txName: googleUser.Fs.sd,
          txImage: googleUser.Fs.wI
        };

        localStorage.setItem('social', JSON.stringify(social));
        this.social = social;
        this.socialResponse.emit(social)
      });

    }, () => { });

  }

  // ==========================================================
  // VALIDATE FB USER
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
    FB.getLoginStatus((loginResponse) => {
      if (loginResponse.status === 'connected') {
        this.facebookGetData(loginResponse);
      } else {
        FB.login((loginResponse) => {
          if (loginResponse.status === 'connected') {
            this.facebookGetData(loginResponse);
          }
        }, { scope: 'email' })
      }
    }, true); // true para deshabilitar el guarado en cache de esta respuesta 
  }

  facebookGetData(loginResponse: facebookFrontendResponse): void {
    FB.api('/me?fields=id,email,first_name,name,gender', (response) => {
      this.zone.run(() => {
        const social: Social = {
          txPlatform: 'facebook',
          txToken: loginResponse.authResponse.accessToken,
          txEmail: response.email,
          txName: response.name,
          txImage: null
        };

        if (!social.txName) {
          this.publicService.snack('No obtuvimos permiso para validar tu reserva', 5000, 'Aceptar');
          return;
        }

        localStorage.setItem('social', JSON.stringify(social));
        this.socialResponse.emit(social)
        this.social = social;
      });
    });

  }

  // ==========================================================
  // VALIDATE TELEGRAM USER
  // ==========================================================

  validateTicketTelegram() {
    window.Telegram.Login.auth({ bot_id: '1545224984', request_access: true }, (response) => {

      if (!response) {
        this.publicService.snack('Error de validación de Telegram.', 5000, 'Aceptar');
        return;
      }

      const social: Social = {
        txPlatform: 'telegram',
        txToken: null,
        txEmail: response.id,
        txName: response.first_name,
        txImage: response.photo_url
      };

      localStorage.setItem('social', JSON.stringify(social));
      this.social = social;
      this.socialResponse.emit(social);

    })
  }

  // ==========================================================
  // VALIDATE EMAIL USER
  // ==========================================================

  emailValidate() {
    this.publicService.snack('Esta opción va a estar disponible próximamente.', 5000, 'Aceptar');
  }

  logOut(): void {

    if (this.social?.txPlatform === 'facebook') {
      FB.logout(function (response) {
        // user is now logged out
      });
    }
    if (localStorage.getItem('social')) { localStorage.removeItem('social'); }
    this.social = null;
    this.socialResponse.emit(null);

  }

}

interface facebookFrontendResponse {
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
  txEmail: string;
  txName: string;
  txImage: string;
}

