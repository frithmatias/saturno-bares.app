import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Pipe({
  name: 'dateToInterval'
})
@Injectable({
  providedIn: 'root'
})
export class DateToIntervalPipe implements PipeTransform {

  transform(date: Date): string {

    const interval = new Date(date);
    const hours = interval.getHours();
    const minutes = interval.getMinutes();
    const strM = minutes < 10 ? '0' : '';
    let str = String(hours) + ':' + strM + String(minutes);
    return str;
  }

}
