import { Component, OnInit } from '@angular/core';
import { PublicService } from '../../public.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(
    public publicService: PublicService,
    public router: Router
  ) { }

  ngOnInit(): void {
  }
  salir(): void {
    this.publicService.clearPublicSession();
    this.router.navigate(['/home'])
  }
}
