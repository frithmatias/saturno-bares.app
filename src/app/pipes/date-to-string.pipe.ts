import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'dateToString'
})
export class DateToStringPipe implements PipeTransform {

  transform(time: string): unknown {
    let tmReserve = new Date(time);
    const day = tmReserve.getDate();
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const monthsShort = ['Ene', 'Feb', 'Ma', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    const month = monthsShort[tmReserve.getMonth()];
    const year = tmReserve.getFullYear();
    const hours = tmReserve.getHours();
    const minutes = tmReserve.getMinutes();

    let strHours = hours <= 9 ? '0'+hours.toString(): hours;
    let strMinutes = minutes <= 9 ? '0'+minutes: minutes;

    // return moment(time).format('dddd D MMMM YYYY a las h:mm:ss a');
    return `${day}-${month} ${strHours}:${strMinutes}`;
  }

}
