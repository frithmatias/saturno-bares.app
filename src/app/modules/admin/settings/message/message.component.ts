import { Component, OnInit } from '@angular/core';
import { PublicService } from '../../../public/public.service';
import { AdminService } from '../../admin.service';
import { LoginService } from '../../../../services/login.service';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit {
  txMessage: string = '';

  constructor(
    private publicService: PublicService,
    private adminService: AdminService,
    private loginService: LoginService
  ) { }

  ngOnInit(): void {
  }
  sendMessage() {
    let txMessage = this.txMessage;

    if (txMessage.length > 100) {
      this.publicService.snack('El mensaje no puede tener mas de 100 caracteres', 5000, 'Aceptar');
      return;
    }

    let idCompany = this.loginService.user.id_company._id;
    this.adminService.sendMessage(idCompany, txMessage).subscribe(data => {
      this.txMessage = '';
      this.publicService.snack('El mensaje fue enviado correctamente', 2000);
    })
  }
}
