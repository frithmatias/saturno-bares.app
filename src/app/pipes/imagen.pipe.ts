import { Pipe, PipeTransform, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Pipe({
	name: 'imagenPipe'
})
@Injectable({
	providedIn: 'root' // Only available with angular 6+, else add it to providers
})
export class ImagenPipe implements PipeTransform {
	transform(filename: string, idCompany: string): any {
		let url = environment.url + '/image';
		if (!filename) {
			// al no existir esta url el backend me devuelve una imagen por defecto 'NO IMAGE'
			return url + '/xxx/xxx'; // http://localhost:3000/imagenes/xxx/xxx/xxx -> 'usuarios'/user_id/img_id
		}
		if (filename.indexOf('https') >= 0) {
			return filename; // la imagen es una url por ejemplo la de una cuenta de Google
		}

		url += '/' + idCompany + '/' + filename;
		return url;
	}
}
