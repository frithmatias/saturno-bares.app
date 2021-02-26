import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicService } from '../../modules/public/public.service';
import { LoginService } from '../../services/login.service';
import { UserResponse } from '../../interfaces/user.interface';
import { HttpErrorResponse } from '@angular/common/http';

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
            this.publicService.snack('Usuario activado correctamente!', 5000);
            const destination = data.user.id_role === 'CUSTOMER_ROLE' ? '/public/login' : '/login';
            this.router.navigate([destination]);
          }
        }, (err: HttpErrorResponse) => {
          this.publicService.snack(err.error.msg, 5000, 'Aceptar');
        })
      }
    })
  }

}
