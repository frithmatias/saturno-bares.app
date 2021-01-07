import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators, FormGroupDirective } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { AdminService } from '../../../../modules/admin/admin.service';
import { LoginService } from '../../../../services/login.service';
import { SharedService } from '../../../../services/shared.service';

import { GetidstringPipe } from '../../../../pipes/getidstring.pipe';
import { Company, CompanyResponse } from '../../../../interfaces/company.interface';
import { Observable } from 'rxjs/internal/Observable';
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
	@Output() clearForm: EventEmitter<void> = new EventEmitter();

	forma: FormGroup;
	txCompanyString: string;
	centerMap: number[] = []; // for app-map child

	// Localidades
	filteredOptions: Observable<string[]>;
	options: any[] = [];
	// declaro mi nuevo control donde voy a capturar los datos ingresados para la busqueda.
	localidadesControl = new FormControl();

	// en localidades guardo la lista de localidades en el AUTOCOMPLETE
	localidades: Location[] = [];

	constructor(
		private adminService: AdminService,
		private loginService: LoginService,
		private sharedService: SharedService,
		public publicService: PublicService,
		private getidstring: GetidstringPipe,
		private capitalizarPipe: CapitalizarPipe
	) { }

	ngOnInit() {
		this.createForm({});
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


	createForm(defaults: any): void {
		if (this.forma) return;
		this.forma = new FormGroup({
			txCompanyName: new FormControl(defaults.txCompanyName || '', [Validators.required, this.validatorSetId.bind(this)]),
			txCompanyString: new FormControl({ value: defaults.txCompanyString || '', disabled: true }, Validators.required),
			txCompanySlogan: new FormControl(defaults.txCompanySlogan || ''),
			txCompanyLocation: new FormControl(defaults.txCompanyLocation || '', Validators.required),
			cdCompanyLocation: new FormControl(defaults.cdCompanyLocation || '', Validators.required),
			txAddressStreet: new FormControl(defaults.txAddressStreet || '', Validators.required),
			txAddressNumber: new FormControl(defaults.txAddressNumber || '', Validators.required),
			txCompanyLat: new FormControl({ value: defaults.txCompanyLat || '', disabled: true }, Validators.required),
			txCompanyLng: new FormControl({ value: defaults.txCompanyLng || '', disabled: true }, Validators.required),
		});
	}

	cleanInput() {
		this.localidadesControl.reset();
		this.localidades = [];
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (!changes.companyEdit?.currentValue) { return; }

		let defaults = {
			txCompanyName: changes.companyEdit.currentValue.tx_company_name,
			txCompanyString: changes.companyEdit.currentValue.tx_company_string,
			txCompanySlogan: changes.companyEdit.currentValue.tx_company_slogan,
			txCompanyLocation: changes.companyEdit.currentValue.tx_company_location,
			cdCompanyLocation: changes.companyEdit.currentValue.cd_company_location,
			txAddressStreet: changes.companyEdit.currentValue.tx_address_street,
			txAddressNumber: changes.companyEdit.currentValue.tx_address_number,
			txCompanyLat: changes.companyEdit.currentValue.tx_company_lat,
			txCompanyLng: changes.companyEdit.currentValue.tx_company_lng,
		}

		this.forma ? this.forma.patchValue(defaults) : this.createForm(defaults);

		// localidadesControl espera un objeto que luego va a "parsear" [displayWith] con el metodo setLocalidad
		let cdLocation = changes.companyEdit.currentValue.cd_company_location;
		let txLocation = changes.companyEdit.currentValue.tx_company_location.split(',');
		txLocation = txLocation.map((loc: string) => loc.trim());
		this.localidadesControl.setValue({
			properties:
			{
				id: cdLocation,
				nombre: txLocation[0],
				departamento: { nombre: txLocation[1] },
				provincia: { nombre: txLocation[2] }

			}
		});

		// move map to location
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
					this.forma.controls['txCompanyName'].setErrors({ 'incorrect': true });
					this.forma.setErrors({ 'companyExists': true })
				}
			});
		}
	}

	createCompany(formDirective: FormGroupDirective) {

		if (this.forma.getRawValue().txCompanyLat === '' || this.forma.getRawValue().txCompanyLng === ''){
			this.forma.setErrors({ 'coordsMissing': true });
		}
		
		if (this.forma.invalid) {
			this.sharedService.snack('Faltan datos por favor verifique', 2000, 'Aceptar');
			return;
		}

		
		const company: any = {
			id_user: this.loginService.user._id,
			tx_company_name: this.forma.value.txCompanyName,
			tx_company_slogan: this.forma.value.txCompanySlogan,
			tx_company_string: this.forma.getRawValue().txCompanyString,
			cd_company_location: this.forma.value.cdCompanyLocation,
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
				this.sharedService.snack(data.msg, 2000);
				this.resetForm(formDirective);
			}, (err: HttpErrorResponse) => {
				this.sharedService.snack(err.error.msg, 2000);
			}
			)

		} else {
			this.adminService.createCompany(company).subscribe((data: CompanyResponse) => {
				this.newCompany.emit(data.company);
				this.resetForm(formDirective);
				if (data.ok) {
					this.sharedService.snack('Empresa creada correctamente', 2000);
				} else {
					this.sharedService.snack(data.msg, 2000);
				}
			}, () => {
				this.sharedService.snack('Error al crear la empresa', 2000);
			});
		}
	}

	resetForm(formDirective: FormGroupDirective) {
		this.clearForm.emit();
		this.localidadesControl.setValue('');
		this.companyEdit = null;
		this.forma.enable();
		this.forma.reset();
		formDirective.resetForm();
		this.sharedService.scrollTop();
	}

	setLocalidad(localidad: Location) {
		if (localidad) {
			if (localidad.geometry?.coordinates) this.centerMap = localidad.geometry.coordinates;

			let provinciaNombre = localidad.properties.provincia.nombre;
			if (provinciaNombre.toLowerCase() === 'Ciudad Autónoma de Buenos Aires'.toLowerCase()) {
				provinciaNombre = 'CABA';
			}

			const capitalizedLocation =
				this.capitalizarPipe.transform(localidad.properties.nombre) + ', ' +
				this.capitalizarPipe.transform(localidad.properties.departamento.nombre) + ', ' +
				this.capitalizarPipe.transform(provinciaNombre);

			this.forma.patchValue({
				txCompanyLocation: capitalizedLocation,
				cdCompanyLocation: localidad.properties.id
			});

			return capitalizedLocation;
		}
	}

	setCoords(e) {
		this.forma.patchValue({
			txCompanyLat: String(e.lat),
			txCompanyLng: String(e.lng)
		});
	}


}
