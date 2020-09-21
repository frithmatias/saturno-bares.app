import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'timeToHms'
})
export class TimeToHmsPipe implements PipeTransform {

  transform(time: number): string {
    return moment(time).format('H:mm:ss');
  }

}
