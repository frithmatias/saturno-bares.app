import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../../services/login.service';
import { AdminService } from '../admin.service';
import { PublicService } from '../../public/public.service';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css']
})
export class ConfigComponent implements OnInit {

  constructor(
    public loginService: LoginService,
    public adminService: AdminService,
    public publicService: PublicService
  ) { }

  ngOnInit(): void {}


}
