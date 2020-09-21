import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Pipe({
	name: 'getidstring'
})
@Injectable({
	providedIn: 'root' // Only available with angular 6+, else add it to providers
})
export class GetidstringPipe implements PipeTransform {

	transform(value: string): any {
		if(!value){
			return;
		}
		const strid = value
			.replace(/á/gi, 'a')
			.replace(/é/gi, 'e')
			.replace(/í/gi, 'i')
			.replace(/ó/gi, 'o')
			.replace(/ú/gi, 'u')
			.replace(/ñ/gi, 'n')
			.replace(/[^a-zA-Z0-9]/gi, '')
			.toLowerCase();
		return strid;
	}

}
