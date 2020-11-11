import { Pipe, PipeTransform, Injectable } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'intervalToHms'
})
@Injectable({
	providedIn: 'root'
})
export class IntervalToHmsPipe implements PipeTransform {

  transform(timeFrom: number, timeTo?: number): string {
    if(!timeFrom) return '-';
    if(!timeTo) timeTo = + new Date();
    let interval = timeTo - timeFrom;
    let duration = moment.duration(interval);
    let h = duration.hours();
    let m = duration.minutes();
    let s = duration.seconds();
    
    let hh = h === 0 ? '' : h.toString() + ':';
    let mm: string = m <= 9 ? '0' + m.toString() + ':' : m.toString() + ':'; 
    let ss: string = s <= 9 ? '0' + s.toString() : s.toString(); 
    
    return `${hh}${mm}${ss}`;
  }

}
