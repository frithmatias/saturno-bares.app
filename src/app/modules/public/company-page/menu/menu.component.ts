import { Component, OnInit, Input } from '@angular/core';
import { Company } from '../../../../interfaces/company.interface';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  @Input() company: Company;
  constructor() { }

  ngOnInit(): void {
  }

}
