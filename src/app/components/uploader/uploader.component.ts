import { Component, OnInit, ViewChild, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { FileUpload, FileUploadResponse } from './uploader.model';
import { UploaderService } from './uploader.service';
import { MatSnackBar, MatSnackBarDismiss } from '@angular/material/snack-bar';

@Component({
	selector: 'app-uploader',
	templateUrl: './uploader.component.html',
	styleUrls: ['./uploader.component.css']
})
export class UploaderComponent implements OnInit {
	@ViewChild('fileInput', { static: true }) fileInput: ElementRef;
	@Input() editable: boolean = true; // (i.e. google profile images are not editable)
	@Input() multi: boolean = false;
	@Input() documentData: any;  
	@Input() idDocument: string;
	@Input() idField: string;
	@Input() header: { icon: string, title: string, subtitle: string };
	@Output() dataUpdated = new EventEmitter();

	filesToUpload: FileUpload[] = [];
	maxupload = 5;
	maxSize = 5242880;
	estaSobreElemento = false;
	uploading = false;

	constructor(
		private uploaderService: UploaderService,
		private snack: MatSnackBar
	) { }

	async ngOnInit() {
		if (!this.documentData) {
			this.snack.open('Sin datos en el componente uploader', null, { duration: 3000 });
			return;
		}
		this.fileInput.nativeElement.multiple = this.multi;
		this.maxupload = this.multi ? this.maxupload : 1;
	}

	uploadSingle() {
		this.fileInput.nativeElement.value = "";
		let archivo = this.filesToUpload[0];
		this.uploading = true;
		this.uploaderService.subirImagen(this.idDocument, this.idField, archivo, 1).subscribe((data: FileUploadResponse) => {
			if (data.ok) {
				archivo.progreso = 100;
				archivo.estaSubiendo = false;
				this.documentData[this.idField] = data.filename;
				this.filesToUpload = [];
				this.dataUpdated.emit(this.documentData);
				this.uploading = false;
			}
			// this.uploaderService.syncHostinger(this.idDocument, this.idField).subscribe((data: FileUploadResponse) => {
			// 	if(data.ok){
			// 		this.snack.open(data.msg, null, {duration: 2000});
			// 	}
			// })
		});
	}

	uploadMulti() {

		this.fileInput.nativeElement.value = "";
		let filesToUploadLength = this.filesToUpload.length;
		this.uploading = true;
		this.filesToUpload.forEach((archivo, index, files) => {
			archivo.estaSubiendo = true;
			this.uploaderService.subirImagen(this.idDocument, this.idField, archivo, files.length).subscribe((data: FileUploadResponse) => {
				if (data.ok) {
					archivo.progreso = 100;
					archivo.estaSubiendo = false;
					this.documentData[this.idField].push(data.filename);
					this.filesToUpload = this.filesToUpload.filter(file => file.nombreArchivo !== archivo.nombreArchivo)
					if (index === filesToUploadLength - 1) {
						this.uploading = false;
						this.dataUpdated.emit(this.documentData);
						// this.uploaderService.syncHostinger(this.idDocument, this.idField).subscribe((data: FileUploadResponse) => {
						// 	if(data.ok){
						// 		this.snack.open(data.msg, null, {duration: 2000});
						// 	}
						// })
					}
				}
			}, () => {
				// si el archivo que intento subir falla, entonces lo quito del array de archivos a subir
				this.filesToUpload = this.filesToUpload.filter(file => file.nombreArchivo !== archivo.nombreArchivo)
			});
		});
	}

	deleteImage(idFile: string) {
		this.snack.open('Desea borrar esta imagen?', 'Si borrar', { duration: 5000 }).afterDismissed().subscribe((data: MatSnackBarDismiss) => {
			if (data.dismissedByAction) {
				this.uploaderService.borrarImagen(this.idDocument, this.idField, idFile).subscribe((data: FileUploadResponse) => {
					if (this.multi) {
						if (data.filename === 'todas') {
							this.documentData[this.idField] = [];
						} else {
							this.documentData[this.idField] = this.documentData[this.idField].filter(file => file != data.filename);
						}
					} else {
						this.documentData[this.idField] = null;
					}
					// this.uploaderService.syncHostinger(this.idDocument, this.idField).subscribe((data: FileUploadResponse) => {
					// 	if(data.ok){
					// 		this.snack.open(data.msg, null, {duration: 2000})
					// 	}
					// })
					this.dataUpdated.emit(this.documentData);
				});
			}
		})
	}

	removeQueue(nombreArchivo) {
		this.filesToUpload = this.filesToUpload.filter(archivo => archivo.nombreArchivo !== nombreArchivo);
		this.fileInput.nativeElement.value = "";
	}

	queueFiles(event: any) {
		// permitido: this.maxupload
		// ya cargadas: this.documentData[this.idField].length
		// listas para subir: this.filesToUpload.length
		// intentando subir: event.target.files.length
		let files = event.target.files || event.dataTransfer.files;

		let maxUpload = this.maxupload;
		let uploadedDB = this.documentData[this.idField]?.length || 0;
		let inCache = this.filesToUpload.length || 0;
		let newAppend = event.target.files.length || 0;


		if (this.multi) {
			if((uploadedDB + inCache + newAppend) > maxUpload) {
				this.snack.open(`Supera el máximo de ${this.maxupload} archivos permitidos.`, 'Aceptar', {duration: 3000});
				return;
			}
		}
		this._extractFiles(files); // le envío un objeto que voy a tener que convertir en array
		this._stopPrevent(event);
	}
	// helpers

	private _getTransfer(event: any) {
		// compatibility pourpose
		return event.dataTransfer.files ? event.dataTransfer.files : event.originalEvent.dataTransfer.files;
	}

	private _extractFiles(archivosLista: FileList) {
		for (const propiedad in Object.getOwnPropertyNames(archivosLista)) {
			const archivoTemporal = archivosLista[propiedad];
			if (this._fileCanLoaded(archivoTemporal)) {
				const nuevoArchivo = new FileUpload(archivoTemporal);
				const reader = new FileReader();
				reader.readAsDataURL(archivoTemporal);
				reader.onloadend = () => (nuevoArchivo.bufferImage = reader.result);
				this.filesToUpload.push(nuevoArchivo);
			}
		}

	}

	private _fileCanLoaded(archivo: File): boolean {
		if (!this._fileWasDropped(archivo.name) && this._isImage(archivo.type) && this._sizeOk(archivo.size)) {
			return true;
		} else {
			return false;
		}
	}

	private _stopPrevent(event: any) {
		event.preventDefault();
		event.stopPropagation();
	}

	private _fileWasDropped(nombreArchivo: string): boolean {
		// for (const archivo of this.filesToUpload) {
		// 	if (archivo.nombreArchivo === nombreArchivo) {
		// 		this.snack.open(`El archivo ${nombreArchivo} ya fue cargado.`, null, { duration: 3000 })
		// 		return true;
		// 	}
		// }
		return false;
	}

	private _isImage(tipoArchivo: string): boolean {

		var extensionesValidas = ["image/png", "image/jpg", "image/gif", "image/jpeg"];

		if (tipoArchivo === '' || tipoArchivo === undefined || !extensionesValidas.includes(tipoArchivo)) {
			this.snack.open('No es un tipo de archivo de imagen permitido.', null, { duration: 3000 })
			return false;
		}
		return true;
	}

	private _sizeOk(fileSize: number): boolean {
		if (fileSize > this.maxSize) {
			this.snack.open(`El archivo supera el tamaño máximo permitido de ${this.maxSize / 1024} kb`, null, { duration: 3000 })
			return false;
		}
		return true;
	}

}
