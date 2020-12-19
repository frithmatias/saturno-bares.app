import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import { HttpClient } from '@angular/common/http';

import { FileUpload } from '../../models/fileupload.model';
import urlsafeBase64 from 'urlsafe-base64';
import { catchError, map, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploaderService {

  constructor(
    private http: HttpClient
  ) { }

  subirImagen(fileItem: FileUpload, idField: string, idDocument: string) {
    const url = environment.url + '/uploads/' + idDocument + '/' + idField;
    const formData: FormData = new FormData();
    formData.append('imagen', fileItem.archivo, fileItem.archivo.name);
    return this.http.put(url, formData, { reportProgress: true });
  }

  borrarImagen(idField: string, idDocument: string, filename: string) {
    const url = environment.url + '/uploads/' + idDocument + '/' + idField + '/' + filename;
      return this.http.delete(url, { reportProgress: true });
  }

}
