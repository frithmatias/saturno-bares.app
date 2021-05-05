import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-theme',
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.css']
})
export class ThemeComponent implements OnInit {
  @Output() themeSelected: EventEmitter<string> = new EventEmitter();
  theme: string;
  constructor() { }

  ngOnInit(): void { }

  changeTheme(theme: string): void {

    let cssLink = <HTMLLinkElement>document.getElementById('themeAsset');
    cssLink.href = `./assets/css/themes/${theme}`;
    this.themeSelected.emit(theme);

  }

}
