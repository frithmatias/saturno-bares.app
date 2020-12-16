import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'wordMaxLength'
})
export class WordMaxLengthPipe implements PipeTransform {
  transform(word: string, length: number): string {

    let newString;
    if(word.length > length){
      newString = word.substr(0, length) + '...';
    } else {
      newString = word
    }
    return newString;
  }
}
