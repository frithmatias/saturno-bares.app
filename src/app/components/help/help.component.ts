import { Component, OnInit, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';


interface dataSheet {
  idHelp: string
}

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent implements OnInit {

  helpTitle: string;
  helpText: string;

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: dataSheet
  ) { }

  ngOnInit(): void {

    // TITLES
    switch (this.data.idHelp) {
      case 'adminSettingsVirtualQueue':
        this.helpTitle = `COLA VIRTUAL`;
        break;
      case 'adminSettingsSPM':
        this.helpTitle = `SPM`;
        break;
      case 'adminSettingsSchedule':
        this.helpTitle = `AGENDA`;
        break;
      case 'adminSettingsIntervals':
        this.helpTitle = 'INTERVALOS';
        break;
      case 'waiterVirtualQueuePosition':
        this.helpTitle = `POSICIÓN`;
        break;
    }
  }
}