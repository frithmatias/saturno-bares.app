import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
	name: 'domseguro'
})
export class DomseguroPipe implements PipeTransform {
	constructor(private domSanitizer: DomSanitizer) {}

	transform(value: string, url: string): any {
		//regresa un tipo any
		return this.domSanitizer.bypassSecurityTrustResourceUrl(url + value);
	}
}
