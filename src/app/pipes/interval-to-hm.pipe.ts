import { Pipe, PipeTransform, Injectable } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'intervalToHm'
})
@Injectable({
  providedIn: 'root'
})
export class IntervalToHmPipe implements PipeTransform {

  transform(interval: number): object {

    // local
    const local_hr = Math.trunc(interval / 2); // parte entera de un decimal
    const local_min = interval % 2 === 0 ? 0 : 30;
    let local_str = local_hr < 10 ? '0' + local_hr.toString() : local_hr.toString(); // 09 or 13
    local_str = interval % 2 === 0 ? local_str + ':00' : local_str + ':30'; //09:00 or 09:30
    const local_code = local_hr * 100 + local_min;

    // utc:
    const now = new Date();
    const utc_date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), local_hr, local_min);
    
    let utc_hr = utc_date.getUTCHours();
    let utc_min = utc_date.getUTCMinutes();
    let utc_str = utc_hr < 10 ? '0' + utc_hr.toString() : utc_hr.toString(); // 09 or 13
    utc_str = interval % 2 === 0 ? utc_str + ':00' : utc_str + ':30'; //09:00 or 09:30
    const utc_code = utc_hr * 100 + utc_min;

    return { 
      interval, 
      mins: interval * 30, 
      oclock: interval % 2 === 0, 
      local_hr, 
      local_min, 
      local_str, 
      local_code, 
      utc_hr, 
      utc_min, 
      utc_str, 
      utc_code, 
      utc_date
     }
  }

}
