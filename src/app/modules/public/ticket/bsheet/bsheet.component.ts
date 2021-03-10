import { Component, OnInit, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { Ticket } from 'src/app/interfaces/ticket.interface';

@Component({
  selector: 'app-bsheet',
  templateUrl: './bsheet.component.html',
  styleUrls: ['./bsheet.component.css']
})
export class BsheetComponent implements OnInit {

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public ticket: Ticket

  ) { }

  ngOnInit(): void { }

}
