import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { PublicService } from '../../modules/public/public.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
showContactData = false;
  constructor(
    private publicService: PublicService,
    private sharedService: SharedService,
    private router: Router) { }

  ngOnInit(): void {
  }

  enviar( f: NgForm): void {

    if (f.invalid) {
      this.sharedService.snackShow('Por favor verifique los datos ingresados.', 2000);
      return;
    }

    let contact = {
      tx_type: f.value.tipo,
      tx_message: f.value.comentarios,
      tx_name: f.value.nombre,
      tx_email: f.value.email,
      tx_phone: f.value.telefono,
    }
    
    this.publicService.sendContact(contact).subscribe( (resp: any) => {
      f.reset();
      this.sharedService.snackShow(`Gracias! Recibimos su mensaje.`, 2000, 'Aceptar').finally(() => {
        this.router.navigate(['/home'])
      })
    })
  }


}
