import { Pipe, PipeTransform, Injectable } from '@angular/core';


// A partir de Angular6+ los pipes deben tener el decorador @Injectable para poder inyectarlos en una clase.
// Este pipe ademas de ser utilizado en los templates, lo utilizo en clases (lado componente.ts) como filtros.
@Injectable({
	providedIn: 'root' // Only available with angular 6+, else add it to providers
})
@Pipe({
	name: 'capitalizarPipe'
})
export class CapitalizarPipe implements PipeTransform {
	/*
	FORMA NUEVA
	transform(value: string, arg1, arg2, arg3): string {

	FORMA ANTERIOR
	transform(value: string, args: any[]): string {

	si quiero utilizar la forma anterior puedo usar el operador REST ("...")
	transform(value: string, ...args: any[]): string {

	en la ultima version de angular, los args ya no vienen en un array
	vienen separados por comas arg1,arg2,arg3,argN...
	*/

	// VALUE: string a capitallizar
	// TODAS: si es verdadero capitaliza todas las palabres en el string.
	transform(value: string, todas: boolean = true): string {
		if (!value || typeof value !== 'string') {
			return;
		}
		value = value.toLowerCase();
		const nombres = value.split(' ');
		if (todas) {
			nombres.forEach((nombre , i) => {
			// for (const i in nombres) {
				nombres[i] = nombres[i][0].toUpperCase() + nombres[i].substr(1); // .substr(1) concateno desde la primera posición en adelante
			});
		} else {
			nombres[0] = nombres[0][0].toUpperCase() + nombres[0].substr(1); // .substr(1) concateno desde la primera posición en adelante
		}
		return nombres.join(' ');
	}
}
