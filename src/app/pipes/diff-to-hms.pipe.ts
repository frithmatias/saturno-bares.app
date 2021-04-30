import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Pipe({
  name: 'DiffToHMS'
})
@Injectable({
  providedIn: 'root'
})
export class DiffToHMSPipe implements PipeTransform {

  transform(timeFrom: number | string, timeTo?: number | string): string {


    if (typeof timeFrom === 'string') {
      timeFrom = new Date(timeFrom).getTime();
    }

    if (typeof timeTo === 'string') {
      timeTo = new Date(timeTo).getTime();
    }

    if (!timeFrom) return '-';
    if (!timeTo) timeTo = + new Date();
    let interval = timeTo - timeFrom;

    let h = new Date(interval).getUTCHours();
    let m = new Date(interval).getUTCMinutes();
    let s = new Date(interval).getUTCSeconds();

    let hh = h === 0 ? '00:' : h <= 9 ? '0' + h.toString() + ':' : h.toString() + ':';
    let mm: string = m <= 9 ? '0' + m.toString() + ':' : m.toString() + ':';
    let ss: string = s <= 9 ? '0' + s.toString() : s.toString();

    return `${hh}${mm}${ss}`;
  }

}
