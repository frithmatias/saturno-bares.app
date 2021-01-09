import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getOccupation'
})
export class GetOccupationPipe implements PipeTransform {

  transform(tableCapacity: number, tablePeople?: number): number {

    if(!tablePeople){
      return 0;
    }

    let occupation = Math.round(Number(tablePeople * 100 / tableCapacity));
    return occupation;
  }

}
