import { Directive, Output, EventEmitter, HostListener } from '@angular/core';

@Directive({
	selector: '[app-dropfiles]'
})
export class UploaderDirective {

	@Output() mouseSobre: EventEmitter<boolean> = new EventEmitter();
	@Output() sendDropFiles: EventEmitter<any> = new EventEmitter();
	
	constructor() { }

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
