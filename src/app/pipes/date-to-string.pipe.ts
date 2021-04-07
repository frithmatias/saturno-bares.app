import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root' // Only available with angular 6+, else add it to providers
})
@Pipe({
  name: 'dateToString'
})
export class DateToStringPipe implements PipeTransform {
  transform(time: Date, format: string): string {
    if(!time){
      return 'n/a';
    }
    var options = {};

    switch (format) {
      case 'full': // Sábado, 20 de Marzo de 2021 21:05
        options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        break;
      case 'date-full': // Sábado, 20 de Marzo de 2021
        options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        break;
      case 'date-long': // Sábado, 20 de Marzo
        options = { weekday: 'long', month: 'long', day: 'numeric' };
        break;
      case 'date': // 20 de Marzo
        options = { month: 'long', day: 'numeric' };
        break;
      case 'date-time': // Sábado, 20 de Marzo 21:05
        options = { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
        break;
      case 'date-time-short': // Sáb, 20 Mar. 21:05
        options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
        break;
      case 'date-short': // 20-03
        options = { month: 'numeric', day: 'numeric' };
        break;
      case 'time-full': // 21:05:34
        options = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        break;
      case 'time-12': // 9:05 PM
        options = { hour: '2-digit', minute: '2-digit', hour12: true };
        break;
      case 'time-24': // 21:05
        options = { hour: '2-digit', minute: '2-digit', hour12: false };
        break;
    }

    return new Date(time).toLocaleString('es-AR', options);;
  }
}
