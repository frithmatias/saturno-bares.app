import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stringReplaceDateTime'
})
export class StringReplaceDateTimePipe implements PipeTransform {

  transform(text: string, date: Date): string {
    
    // replace date    
    const dateOptions: any = { weekday: 'long', month: 'long', day: 'numeric' };
    const dateString = new Date(date).toLocaleString('es-AR', dateOptions);;
    text = text.replace(/_date_/gi, dateString)

    // replace time
    const timeOptions: any = { hour: '2-digit', minute: '2-digit', hour12: true };
    const timeString = new Date(date).toLocaleString('es-AR', timeOptions);;
    text = text.replace(/_time_/gi, timeString)

    return text;
  }

}
