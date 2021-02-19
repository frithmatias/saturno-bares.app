import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'dateToString'
})
export class DateToStringPipe implements PipeTransform {
  transform(time: Date, format: string): unknown {
      return moment(time).format(format);
  }
}
