import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateToRemaining'
})
export class DateToRemainingPipe implements PipeTransform {
  transform(time: Date): unknown {
    const _MS_PER_MIN = 1000 * 60; 
    let from = + new Date(time)
    let now = + new Date();

    let mins_remaining = Math.floor((from - now) / _MS_PER_MIN);
    let res = '';

    if(mins_remaining >= 24 * 60 ){
      res = 'en ' + Math.floor(mins_remaining / (24 * 60)) + ' dias';
    } 

    if(mins_remaining < 24 * 60 && mins_remaining >= 60) {
      res = 'en ' + Math.floor(mins_remaining / 60) + ' horas';
    } 

    if(mins_remaining < 60 && mins_remaining >= 0) {
      res = 'en ' + Math.floor(mins_remaining) + ' minutos';
    } 

    if(mins_remaining < 0 && mins_remaining >= -60) {
      res = 'desde hace ' + Math.floor(mins_remaining) + ' minutos';
    } 

    if(mins_remaining < -60 && mins_remaining >= -24 * 60) {
      mins_remaining = mins_remaining * -1;
      res = 'fué hace ' + Math.floor(mins_remaining / 60) + ' horas';
    } 
    
    if(mins_remaining < -24 * 60) {
      mins_remaining = mins_remaining * -1;
      res = 'fué hace ' + Math.floor(mins_remaining / (24 * 60)) + ' dias';
    }

    return res;
  }

}
