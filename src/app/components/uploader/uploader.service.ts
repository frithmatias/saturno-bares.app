import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import { HttpClient } from '@angular/common/http';

import { FileUpload } from '../../models/fileupload.model';
import urlsafeBase64 from 'urlsafe-base64';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploaderService {

  constructor(
    private http: HttpClient
  ) { }

  subirImagen(fileItem: FileUpload, txType: string = 'usuarios', idCompany: string) {
    const url = environment.url + '/uploads/' + idCompany + '/' + txType;
    const formData: FormData = new FormData();
    
    formData.append('imagen', fileItem.archivo, fileItem.archivo.name);

    return this.http.put(url, formData, { reportProgress: true });
  }

  borrarImagen(txType: string, idCompany: string, filename: string) {
    const url = environment.url + '/uploads/' + idCompany + '/' + txType + '/' + filename;
    return new Promise((resolve, reject) => {
      this.http.delete(url, { reportProgress: true }).subscribe(data => {
        resolve(data);
      },
        (err) => {
          reject(err);
        });
    });
  }


}
