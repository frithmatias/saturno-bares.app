import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateToString'
})
export class DateToStringPipe implements PipeTransform {
  transform(time: Date, format: string): string {

    var options = {
      weekday: 'long',
      // year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      // second: '2-digit',
      hour12: false
    };

    var str: string = new Date(time).toLocaleDateString('es-AR', options);
    return str;
  }
}
