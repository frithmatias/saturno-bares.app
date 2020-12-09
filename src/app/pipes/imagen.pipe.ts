import { Pipe, PipeTransform, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Pipe({
	name: 'imagenPipe'
})
@Injectable({
	providedIn: 'root' // Only available with angular 6+, else add it to providers
})
export class ImagenPipe implements PipeTransform {
	transform(img: string, tipo: string, id: string): any {
		let url = environment.url + '/imagenes';
		if (!img) {
			// al no existir esta url el backend me devuelve una imagen por defecto 'NO IMAGE'
			return url + '/xxx/xxx/xxx'; // http://localhost:3000/imagenes/xxx/xxx/xxx -> 'usuarios'/user_id/img_id
		}
		if (img.indexOf('https') >= 0) {
			return img; // la imagen es una url por ejemplo para una cuenta de Google
		}
		switch (tipo) {
			case 'usuarios':
			case 'avisos':
			case 'inmobiliarias':
				url += '/' + tipo + '/' + id + '/' + img;
				break;
			default:
				url += '/xxx/xxx/xxx';
		}
		return url;
	}
}
