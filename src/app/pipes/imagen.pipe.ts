import { Pipe, PipeTransform, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Pipe({
	name: 'imagenPipe'
})
@Injectable({
	providedIn: 'root' // Only available with angular 6+, else add it to providers
})
export class ImagenPipe implements PipeTransform {
	transform(idFile: string, idType: string, idCompany: string): any {
		let url = environment.api + '/image';
		
		if (idFile && idFile.indexOf('cover') >= 0) {
			idCompany = 'predefined'; 
		}


		if (idFile && idFile.indexOf('https') >= 0) {
			return idFile; // la imagen es una url por ejemplo la de una cuenta de Google
		}

		url += '/' + idCompany + '/' + idType + '/' + idFile;
		return url;
	}
}
