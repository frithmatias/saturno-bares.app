import { Component, OnInit } from '@angular/core';
import { NgForm, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { PublicService } from '../../modules/public/public.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
  showContactData = false;
  contactForm: FormGroup;

  constructor(
    private publicService: PublicService,
    private router: Router) { }

  ngOnInit(): void {

    this.contactForm = new FormGroup({
      cdContact: new FormControl('', Validators.required),
      txComment: new FormControl('', [Validators.required, Validators.maxLength(500)]),
      txName: new FormControl('', Validators.maxLength(30)),
      txEmail: new FormControl('', Validators.maxLength(50)),
      nmPhone: new FormControl('', [Validators.min(100000), Validators.max(9999999999999)])
    })


  }

  enviar(): void {
    if (this.contactForm.invalid) {
      this.publicService.snack('Por favor verifique los datos ingresados.', 2000);
      return;
    }

    let contact = {
      tx_type: this.contactForm.value.cdContact,
      tx_message: this.contactForm.value.txComment,
      tx_name: this.contactForm.value.txName,
      tx_email: this.contactForm.value.txEmail,
      tx_phone: this.contactForm.value.nmPhone,
    }

    this.publicService.sendContact(contact).subscribe((resp: any) => {
      this.contactForm.reset();
      this.publicService.snack(`Gracias! Recibimos su mensaje.`, 2000, 'Aceptar').finally(() => {
        this.router.navigate(['/home'])
      })
    })
  }


}
