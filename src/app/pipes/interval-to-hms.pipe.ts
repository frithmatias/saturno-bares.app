import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'intervalToHms'
})
export class IntervalToHmsPipe implements PipeTransform {

  transform(timeFrom: number, timeTo?: number): string {
    let interval = timeTo - timeFrom;
    let duration = moment.duration(interval);
    let h = duration.hours();
    let m = duration.minutes();
    let s = duration.seconds();
    let hh: string = h <= 9 ? '0' + h.toString() : h.toString(); 
    let mm: string = m <= 9 ? '0' + m.toString() : m.toString(); 
    let ss: string = s <= 9 ? '0' + s.toString() : s.toString(); 

    return `${hh}:${mm}:${ss}`;
  }

}
