import { Inject } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { PublicService } from '../../../public/public.service';
import { MessageResponse } from '../../../../interfaces/messenger.interface';

@Component({
  selector: 'app-bsheet',
  templateUrl: './bsheet.component.html',
  styleUrls: ['./bsheet.component.css']
})
export class BsheetComponent implements OnInit {

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private bottomSheetRef: MatBottomSheetRef<BsheetComponent>,
    private publicService: PublicService
  ) { }

  ngOnInit(): void {
  }

  messageResponse(response: MessageResponse) {
    this.publicService.snack(response.msg, 5000, 'Aceptar');
  }

}
