export class FileUpload {
	// File no hay que importarlo, es una propiedad de TypeScript
	public archivo: File;
	public nombreArchivo: string;
	public url: string;
	public estaSubiendo: boolean; // flag
	public progreso: number;
	// en bufferImage guardo la imagen para previsualizarla haciendo 'const reader = new FileReader();'
	// y luego un push de reader.result
	public bufferImage: any;

	constructor(archivo: File) {
		this.archivo = archivo;
		this.nombreArchivo = archivo.name;
		this.estaSubiendo = false;
		this.progreso = 0;
	}
}
