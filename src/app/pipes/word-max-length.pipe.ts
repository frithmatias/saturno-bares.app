import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'wordMaxLength'
})
export class WordMaxLengthPipe implements PipeTransform {

  transform(word: string, length: number): string {
    let myform = document.getElementById('wt-form');



    if(myform){
      let width = myform.offsetWidth;
      let maxlength: number;
      if(width < 260){
        maxlength = 8;
      } 
      if(width >= 260 && width < 280){
        maxlength = 9;
      }
      if(width >= 280 && width < 300){
        maxlength = 10;
      }
      if(width >= 300 && width < 320){
        maxlength = 11;
      }
      if(width >= 320 && width < 340){
        maxlength = 12;
      }
      if(width >= 340 && width < 360){
        maxlength = 13;
      }
      if(width >= 360 && width < 380){
        maxlength = 14;
      }
      if(width >= 380 && width < 400){
        maxlength = 15;
      }
      if(width >= 400){
        maxlength = 16;
      }
      let points = word.length > maxlength ? '...' : '';
      return word.substr(0, maxlength) + points;
    }

    return null;
  }

}
