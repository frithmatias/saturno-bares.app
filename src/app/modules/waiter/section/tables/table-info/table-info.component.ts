import { Component, OnInit, Input } from '@angular/core';
import { Table } from 'src/app/interfaces/table.interface';

@Component({
  selector: 'app-table-info',
  templateUrl: './table-info.component.html',
  styleUrls: ['./table-info.component.css']
})
export class TableInfoComponent implements OnInit {

  @Input() table: Table;
  @Input() listmode: boolean;
  @Input() toggling: boolean;

  constructor() { }

  ngOnInit(): void {
  }

}
