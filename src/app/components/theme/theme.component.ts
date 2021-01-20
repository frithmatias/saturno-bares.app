import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-theme',
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.css']
})
export class ThemeComponent implements OnInit {
  config: any = {};
  constructor() { }

  ngOnInit(): void {
    
    if (localStorage.getItem('config')) {
      this.config = JSON.parse(localStorage.getItem('config'));
    }

    if (!this.config.theme) {
      let hours = new Date().getHours();

      if (hours >= 6 && hours < 20) {
        // light theme
        this.config.theme = 'grey-orange.css'
      } else {
        // dark theme
        this.config.theme = 'dark-pink.css';
      }

    }

    let cssLink = <HTMLLinkElement>document.getElementById('themeAsset');
    cssLink.href = `./assets/css/themes/${this.config.theme}`;
  }

  changeTheme(theme: string): void {
    let cssLink = <HTMLLinkElement>document.getElementById('themeAsset');
    cssLink.href = `./assets/css/themes/${theme}`;

    if (localStorage.getItem('config')) {
      this.config = JSON.parse(localStorage.getItem('config'));
    }

    this.config.theme = theme;
    localStorage.setItem('config', JSON.stringify(this.config));
  }

}
