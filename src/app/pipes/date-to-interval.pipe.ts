import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateToInterval'
})
export class DateToIntervalPipe implements PipeTransform {

  transform(date: Date): unknown {

    const interval = new Date(date);
    const hours = interval.getHours();
    const str = hours < 10 ? '0' + hours + ':00' : hours + ':00';
    return str;
  }

}
