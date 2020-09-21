import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'messageTime'
})
export class MessageTimePipe implements PipeTransform {

  transform(date: Date): string {
    
    let hour = String(date.getHours());
    let minutes = String(date.getMinutes());

    if (hour.length === 1) { hour = '0' + hour; }
    if (minutes.length === 1) { minutes = '0' + minutes; }
    
    const strTime = hour + ':' + minutes;
    return strTime;
  }

}
