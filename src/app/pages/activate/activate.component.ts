import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicService } from '../../modules/public/public.service';
import { LoginService } from '../../services/login.service';
import { UserResponse } from '../../interfaces/user.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { Company } from 'src/app/interfaces/company.interface';

@Component({
  selector: 'app-activate',
  templateUrl: './activate.component.html',
  styleUrls: ['./activate.component.css']
})
export class ActivateComponent implements OnInit {

  activated = false;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private publicService: PublicService,
    private loginService: LoginService
  ) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(data => {
      const email = data.email;
      const hash = data.hash;

      if (email && hash) {
        this.loginService.activateUser(email, hash).subscribe((data: UserResponse) => {
          if (data.ok) {
            this.activated = true;
            this.publicService.snack('Usuario Activado! Por favor, Ingresa con tu usuario y contraseña.', 10000);
            if(localStorage.getItem('isembed')){
              const companyString = localStorage.getItem('isembed');
              const companyFormURL = '/embed/' + companyString;
              this.router.navigate([companyFormURL]);
            } else {
              const destination = data.user.id_role === 'CUSTOMER_ROLE' ? '/public/login' : '/login';
              this.router.navigate([destination]);
            }
          }
        }, (err: HttpErrorResponse) => {
          this.publicService.snack(err.error.msg, 5000, 'Aceptar');
        })
      }
    })
  }

}
