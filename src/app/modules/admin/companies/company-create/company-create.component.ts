import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators, FormGroupDirective } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';

import { AdminService } from '../../../../modules/admin/admin.service';
import { LoginService } from '../../../../services/login.service';
import { SharedService } from '../../../../services/shared.service';

import { GetidstringPipe } from '../../../../pipes/getidstring.pipe';
import { Company, CompanyResponse } from '../../../../interfaces/company.interface';
import { Observable } from 'rxjs/internal/Observable';
import { startWith, map, tap } from 'rxjs/operators';
import { Location, LocationsResponse } from 'src/app/interfaces/location.interface';
import { PublicService } from 'src/app/modules/public/public.service';
import { CapitalizarPipe } from 'src/app/pipes/capitalizar.pipe';

@Component({
	selector: 'app-company-create',
	templateUrl: './company-create.component.html',
	styleUrls: ['./company-create.component.css']
})
export class CompanyCreateComponent implements OnInit {
	@Input() companyEdit: Company;
	@Output() newCompany: EventEmitter<Company> = new EventEmitter();
	forma: FormGroup;
	txCompanyString: string;
	centerMap: number[] = []; // for app-map child

	// Localidades
	filteredOptions: Observable<string[]>;
	options: any[] = [];
	// declaro mi nuevo control donde voy a capturar los datos ingresados para la busqueda.
	localidadesControl = new FormControl();

	// en localidades guardo la lista de localidades en el AUTOCOMPLETE
	localidades: any[] = [];
	constructor(
		private adminService: AdminService,
		private loginService: LoginService,
		private sharedService: SharedService,
		public publicService: PublicService,
		private snack: MatSnackBar,
		private getidstring: GetidstringPipe,
		private capitalizarPipe: CapitalizarPipe
	) { }

	ngOnInit() {
		let defaults = {
			txCompanyName: '',
			txCompanyString: '',
			txCompanySlogan: '',
			txCompanyLocation: '',
			txAddressStreet: '',
			txAddressNumber: '',
			txCompanyLat: '',
			txCompanyLng: ''
		}

		this.forma = new FormGroup({
			txCompanyName: new FormControl(defaults.txCompanyName, [Validators.required, this.validatorSetId.bind(this)]),
			txCompanyString: new FormControl({ value: '', disabled: true }),
			txCompanySlogan: new FormControl(defaults.txCompanySlogan),
			txCompanyLocation: new FormControl(defaults.txCompanyLocation, Validators.required),
			txAddressStreet: new FormControl(defaults.txAddressStreet, Validators.required),
			txAddressNumber: new FormControl(defaults.txAddressNumber, Validators.required),
			txCompanyLat: new FormControl({value: defaults.txCompanyLat, disabled: true}, Validators.required),
			txCompanyLng: new FormControl({value: defaults.txCompanyLng, disabled: true}, Validators.required),
		});

		this.localidadesControl.valueChanges.subscribe(data => {

			if (typeof data !== 'string' || data.length <= 0) {
				return;
			}

			if (data.length === 3) {
				this.publicService.buscarLocalidades(data.toLowerCase()).then((resp: LocationsResponse) => {
					this.localidades = resp.locations;
				});
			} else if (data.length > 3) {
				this.localidades = this.localidades.filter((localidad: Location) => {
					return localidad.properties.nombre.toLowerCase().includes(data.toLowerCase());
				});
			}

		});
	}

	cleanInput() {
		this.localidadesControl.reset();
		this.localidades = [];
	}

	ngOnChanges(changes: SimpleChanges): void {
		console.log(changes)

		if(changes.companyEdit.currentValue === undefined) { return; }

		this.forma?.patchValue({
			txCompanyName: changes.companyEdit.currentValue.tx_company_name,
			txCompanySlogan: changes.companyEdit.currentValue.tx_company_slogan,
			txCompanyLocation: changes.companyEdit.currentValue.tx_company_location,
			txCompanyLat: changes.companyEdit.currentValue.tx_company_lat,
			txCompanyLng: changes.companyEdit.currentValue.tx_company_lng,
			txAddressStreet: changes.companyEdit.currentValue.tx_address_street,
			txAddressNumber: changes.companyEdit.currentValue.tx_address_number
		})


		let lat = changes.companyEdit.currentValue.tx_company_lat;
		let lng = changes.companyEdit.currentValue.tx_company_lng;

		this.centerMap = [lng, lat]
	}

	validatorSetId(control: FormControl): any {
		// utilizo el pipe getidstring que limpia de acentos, ñ, espacios y me devuelve un tolower.
		this.txCompanyString = this.getidstring.transform(control.value);
		this.forma?.patchValue({ txCompanyString: this.txCompanyString });
		return null;
	}

	checkCompanyExists() {

		if (this.companyEdit && (this.txCompanyString === this.companyEdit.tx_company_string)) {
			// Cuando se edita el nombre de una empresa, no debe hacer la verificacion si 
			// existe esa empresa. Esto es porque me devuelve que existe si yo cambio el nombre real 
			// pero el nombre público no cambia (FereterriaNorte a Ferreteria Norte, el nombre 
			// público es el mismo)
			return;
		}

		let pattern = this.txCompanyString;
		if (pattern?.length > 3) {
			this.adminService.checkCompanyExists(pattern).subscribe((data: any) => {
				if (!data.ok) {
					this.forma.controls['company'].setErrors({ 'incorrect': true });
					this.forma.setErrors({ 'companyExists': true })
				}
			});
		}
	}

	createCompany(formDirective: FormGroupDirective) {
		
		console.log(this.forma); // raw para que incluya los value de los controles disabled.

		if (this.forma.invalid) {
			this.sharedService.snack('Faltan datos por favor verifique', 5000, 'Aceptar');
			return;
		}

		const company: any = {
			id_user: this.loginService.user._id,
			tx_company_name: this.forma.value.txCompanyName,
			tx_company_slogan: this.forma.value.txCompanySlogan,
			tx_company_string: this.txCompanyString,
			tx_company_location: this.forma.value.txCompanyLocation,
			tx_address_street: this.forma.value.txAddressStreet,
			tx_address_number: this.forma.value.txAddressNumber,
			tx_company_lat: this.forma.getRawValue().txCompanyLat,
			tx_company_lng: this.forma.getRawValue().txCompanyLng
		};


		if (this.companyEdit) {
			company._id = this.companyEdit._id;
			this.adminService.updateCompany(company).subscribe((data: CompanyResponse) => {
				this.newCompany.emit(data.company);
				this.snack.open(data.msg, null, { duration: 5000 });
				this.resetForm(formDirective);
			}, (err: HttpErrorResponse) => {
				this.snack.open(err.error.msg, null, { duration: 5000 });
			}
			)

		} else {
			this.adminService.createCompany(company).subscribe((data: CompanyResponse) => {
				this.newCompany.emit(data.company);
				this.resetForm(formDirective);
				if (data.ok) {
					this.snack.open('Empresa creada correctamente', null, { duration: 2000 });
				} else {
					this.snack.open(data.msg, null, { duration: 5000 });
				}
			}, () => {
				this.snack.open('Error al crear la empresa', null, { duration: 2000 });
			});
		}
	}

	resetForm(formDirective: FormGroupDirective) {
		this.companyEdit = null;
		this.forma.enable();
		this.forma.reset();
		formDirective.resetForm();
		this.sharedService.scrollTop();
	}


	setLocalidad(localidad: Location) {
		this.centerMap = localidad.geometry.coordinates;
		this.forma.patchValue({
			txCompanyLocation: localidad.properties.id
		});
	}


	getInputLocalidadNombre(value: any) {
		if (value) {
			const capval = this.capitalizarPipe.transform(value.properties.nombre + ', ' + value.properties.departamento.nombre + ', ' + value.properties.provincia.nombre);
			this.forma.patchValue
			return capval;
		}
	}

	setCoords(e) {
		this.forma.patchValue({
			txCompanyLat: String(e.lat),
			txCompanyLng: String(e.lng)
		});
	}


}
