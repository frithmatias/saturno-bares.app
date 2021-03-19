import { Component, OnInit, Input } from '@angular/core';
import { Table } from 'src/app/interfaces/table.interface';

@Component({
  selector: 'app-table-status',
  templateUrl: './table-status.component.html',
  styleUrls: ['./table-status.component.css']
})
export class TableStautsComponent implements OnInit {

  @Input() table: Table;
  @Input() listmode: boolean;
  @Input() toggling: boolean;

  constructor() { }

  ngOnInit(): void {
  }

}
