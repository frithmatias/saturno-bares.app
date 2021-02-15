import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'dateToRemaining'
})
export class DateToRemainingPipe implements PipeTransform {

  transform(time: Date): unknown {
    return moment(time).fromNow();
  }


}
