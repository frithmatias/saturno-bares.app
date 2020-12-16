import { Directive, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { FileUpload } from '../models/fileupload.model';

@Directive({
	selector: '[appNgDropFiles]'
})
export class NgDropFilesDirective {

	@Input() tipo: string;
	@Input() id: string;
	@Input() filesToUpload: FileUpload[] = [];
	@Output() mouseSobre: EventEmitter<boolean> = new EventEmitter();
	@Output() sendDropFiles: EventEmitter<any> = new EventEmitter();
	
	constructor() { }

	/*
	vamos a especificar un callback cuando suceda el "dragover", va a disparar un evento
	la función recibe el evento y disparamos una notificacion para que el padre sepa que esta
	encima. Pero para hablar con el padre o el elemento que lo contiene, hacemos el @Output
	*/


	@HostListener('dragover', ['$event'])
	public onDragEnter(event: any) {
		event.preventDefault();
		event.stopPropagation();
		this.mouseSobre.emit(true);
		this.sendDropFiles.emit(event);
	}

	@HostListener('dragleave', ['$event'])
	public onDragLeave(event: any) {
		this.mouseSobre.emit(false);
	}

	@HostListener('drop', ['$event'])
	public onDrop(event: any) {
		this.sendDropFiles.emit(event);
		this.mouseSobre.emit(false);
	}

}
