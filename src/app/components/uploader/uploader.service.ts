import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { FileUpload } from './uploader.model';

@Injectable({
  providedIn: 'root'
})
export class UploaderService {

  constructor(
    private http: HttpClient
  ) { }

  subirImagen(idDocument: string, idField: string, fileItem: FileUpload, filesLength: number) {
    const url = environment.api + '/uploads/' + idDocument + '/' + idField;
    const formData: FormData = new FormData();
    formData.append('imagen', fileItem.archivo, fileItem.archivo.name); // backend -> files: { imagen: { ... } }
    formData.append('filesLength', filesLength.toString()) // backend -> req.body
    return this.http.put(url, formData, { reportProgress: true });
  }

  borrarImagen(idDocument: string, idField: string, filename: string) {
    const url = environment.api + '/uploads/' + idDocument + '/' + idField + '/' + filename;
    return this.http.delete(url, { reportProgress: true });
  }

  syncHostinger(idDocument: string, idField: string) {
    let data = { idDocument, idField }
    const url = environment.api + '/uploads/synchostinger';
    return this.http.post(url, data)
  }

}
