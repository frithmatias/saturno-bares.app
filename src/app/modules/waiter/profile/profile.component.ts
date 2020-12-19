import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../../services/login.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  header = {
    icon: 'mdi mdi-face',
    title: 'Subi el tu foto de perfil',
    subtitle: 'Esta imagen es para reconocer tu cuenta, es privada y no se muestra a nadie mas.'
  }
  constructor(
    public loginService: LoginService
  ) { }

  ngOnInit(): void {
  }
  dataUpdated(dataUpdated: any): void {
    this.loginService.pushUser(this.loginService.user)
  }
}
