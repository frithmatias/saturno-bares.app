import { Component, OnInit, Input } from '@angular/core';
import { User } from 'src/app/interfaces/user.interface';

@Component({
  selector: 'app-userimage',
  templateUrl: './userimage.component.html',
  styleUrls: ['./userimage.component.css']
})
export class UserimageComponent implements OnInit {

  @Input() user: User;
  @Input() showname: boolean;

    constructor() { }

  ngOnInit(): void {
  }

}
