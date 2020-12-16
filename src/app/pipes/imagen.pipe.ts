import { Pipe, PipeTransform, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Pipe({
	name: 'imagenPipe'
})
@Injectable({
	providedIn: 'root' // Only available with angular 6+, else add it to providers
})
export class ImagenPipe implements PipeTransform {
	transform(idFile: string, idType: string, idCompany: string): any {
		let url = environment.url + '/image';
		if (!idFile) {
			// al no existir esta url el backend me devuelve una imagen por defecto 'NO IMAGE'
			return url + '/idCompany/idType/idFile'; // http://localhost:3000/imagenes/xxx/xxx/xxx -> 'usuarios'/user_id/img_id
		}
		if (idFile.indexOf('https') >= 0) {
			return idFile; // la imagen es una url por ejemplo la de una cuenta de Google
		}

		url += '/' + idCompany + '/' + idType + '/' + idFile;
		return url;
	}
}
