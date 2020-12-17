import { Component, OnInit, ViewChild, Input, Output, EventEmitter, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { Company, CompanyResponse } from 'src/app/interfaces/company.interface';
import { FileUpload } from '../../models/fileupload.model';
import Swal from 'sweetalert2';
import { UploaderService } from './uploader.service';
import { MatSnackBar, MatSnackBarDismiss } from '@angular/material/snack-bar';

@Component({
	selector: 'app-uploader',
	templateUrl: './uploader.component.html',
	styleUrls: ['./uploader.component.css']
})
export class UploaderComponent implements OnInit {
	@ViewChild('filesUpload', { static: true }) filesUpload: ElementRef;
	@Input() multi: boolean = false;
	@Input() company: Company;
	@Input() txType: string;
	@Input() cardData: { icon: string, title: string, subtitle: string };
	@Output() companyUpdated = new EventEmitter();

	filesToUpload: FileUpload[] = [];
	maxupload = 12;
	maxSize = 102400;
	estaSobreElemento = false;

	constructor(
		private uploaderService: UploaderService,
		private snack: MatSnackBar
	) {
	}

	async ngOnInit() {
		this.filesUpload.nativeElement.multiple = this.multi;
		this.maxupload = this.multi ? this.maxupload : 1;
		console.log(this)
	}

	// ngAfterViewInit() {
	// 	this.inputfiles.changes.subscribe(item => {
	// 		console.log(item)
	// 	})
	// }

	subirLogo() {
		let archivo = this.filesToUpload[0];
		this.uploaderService.subirImagen(archivo, this.txType, this.company._id).subscribe((data: any) => {
			console.log(data.company.tx_company_logo)
			archivo.progreso = 100;
			archivo.estaSubiendo = false;
			this.company.tx_company_logo = data.filename;
			this.filesToUpload = [];
			this.companyUpdated.emit(this.company);
		});
	}

	borrarLogo() {
		this.snack.open('Desea borrar el logo?', 'Si, Borrarlo', { duration: 5000 }).afterDismissed().subscribe((data: MatSnackBarDismiss) => {
			if (data.dismissedByAction) {
				this.uploaderService.borrarImagen(this.txType, this.company._id, null).subscribe((data: CompanyResponse) => {
					this.company = data.company;
					this.companyUpdated.emit(this.company);
				});
			}
		})
	}

	subirImagenes() {
		let count = 0;
		let filesUploaded = [];
		this.filesToUpload.forEach(archivo => {
			archivo.estaSubiendo = true;
			this.uploaderService.subirImagen(archivo, this.txType, this.company._id).subscribe((data: any) => {
				console.log(data.company.tx_company_banners)
				count++;
				archivo.progreso = 100;
				archivo.estaSubiendo = false;
				filesUploaded.push(data.filename);
				this.company.tx_company_banners.push(data.filename);
				if (count === this.filesToUpload.length) {
					this.filesToUpload = [];
					this.companyUpdated.emit(this.company);
				}

			}, () => {
				// si el archivo que intento subir falla, entonces lo quito del array de archivos a subir
				this.filesToUpload = this.filesToUpload.filter(file => file.nombreArchivo !== archivo.nombreArchivo)
			});
		});
	}

	borrarImagenes() {
		Swal.fire({
			title: '¿Está seguro?',
			text: 'Esta por borrar todas las imagenes de este aviso en el servidor',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			cancelButtonText: 'No, cancelar!',
			confirmButtonText: 'Si, quiero borrarla'
		}).then((result) => {
			if (result.value) {

				this.uploaderService.borrarImagen(this.txType, this.company._id, 'todas').subscribe((data: CompanyResponse) => {
					this.filesToUpload = [];
					this.company = data.company;
					this.companyUpdated.emit(this.company);
				})

				Swal.fire({
					position: 'center',
					icon: 'success',
					title: 'Eliminada!',
					showConfirmButton: false,
					timer: 700
				});
			}
		});

	}

	borrarImagen(id: string) {
		Swal.fire({
			title: '¿Está seguro?',
			text: 'Esta por borrar una imagen en el servidor',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			cancelButtonText: 'No, cancelar!',
			confirmButtonText: 'Si, quiero borrarla'
		}).then((result) => {
			if (result.value) {
				console.log('borrando', id)
				this.uploaderService.borrarImagen(this.txType, this.company._id, id).subscribe((data: CompanyResponse) => {
					this.company = data.company;
					this.companyUpdated.emit(this.company);
				});
				Swal.fire({
					position: 'center',
					icon: 'success',
					title: 'Eliminada!',
					showConfirmButton: false,
					timer: 700
				});
			}
		});

	}

	borrarImagenQueue(nombreArchivo) {
		this.filesToUpload = this.filesToUpload.filter(archivo => archivo.nombreArchivo !== nombreArchivo);
	}

	queueFiles(event: any) {
		// permitido: this.maxupload
		// ya cargadas: this.company.tx_company_banners.length
		// listas para subir: this.filesToUpload.length
		// intentando subir: event.target.files.length
		let files = event.target.files || event.dataTransfer.files;
		if (this.txType === 'banner') {
			if (this.maxupload - this.company.tx_company_banners.length - this.filesToUpload.length - files.length < 0) {
				this.snack.open(`Supera el máximo permitido de ${this.maxupload} imágenes`, null, { duration: 3000 })
				return;
			}
		}
		this._extraerArchivos(files); // le envío un objeto que voy a tener que convertir en array
		this._prevenirDetener(event);
	}


	private _getTransferencia(event: any) {
		// compatibility pourpose
		return event.dataTransfer.files ? event.dataTransfer.files : event.originalEvent.dataTransfer.files;
	}

	private _extraerArchivos(archivosLista: FileList) {
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

	private _prevenirDetener(event: any) {
		event.preventDefault();
		event.stopPropagation();
	}

	private _fileWasDropped(nombreArchivo: string): boolean {
		for (const archivo of this.filesToUpload) {
			if (archivo.nombreArchivo === nombreArchivo) {
				this.snack.open(`El archivo ${nombreArchivo} ya fue cargado.`, null, { duration: 3000 })
				return true;
			}
		}
		return false;
	}

	private _isImage(tipoArchivo: string): boolean {
		if (tipoArchivo === '' || tipoArchivo === undefined || !tipoArchivo.startsWith('image')) {
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
