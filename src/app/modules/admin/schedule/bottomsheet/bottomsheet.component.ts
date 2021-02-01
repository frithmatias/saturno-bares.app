import { Component, OnInit } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-bottomsheet',
  templateUrl: './bottomsheet.component.html',
  styleUrls: ['./bottomsheet.component.css']
})
export class BottomsheetComponent implements OnInit {

  constructor(
    private bottomSheetRef: MatBottomSheetRef<BottomsheetComponent>

  ) { }

  ngOnInit(): void {
  }

}
