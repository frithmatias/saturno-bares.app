import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../../services/login.service';
import { AdminService } from '../admin.service';
import { PublicService } from '../../public/public.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  constructor(
    public loginService: LoginService,
    public adminService: AdminService,
    public publicService: PublicService
  ) { }

  ngOnInit(): void {
  }




}
