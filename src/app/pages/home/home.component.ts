import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { PublicService } from '../../modules/public/public.service';
import { FormControl } from '@angular/forms';
import { Location } from 'src/app/interfaces/location.interface';
import { LocationsResponse } from '../../interfaces/location.interface';
import { CapitalizarPipe } from '../../pipes/capitalizar.pipe';
import { CompaniesResponse, Company } from 'src/app/interfaces/company.interface';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {
  date: string;
  centerMap: number[] = []; // for app-map child

  // declaro mi nuevo control donde voy a capturar los datos ingresados para la busqueda.
  localidadesControl = new FormControl();
  // en localidades guardo la lista de localidades en el AUTOCOMPLETE
  localidades: Location[] = [];

  companies: Company[] = []

  constructor(
    public publicService: PublicService,
    private capitalizarPipe: CapitalizarPipe

  ) { }

  ngOnInit(): void {

    // set day/night theme
 

    this.publicService.drawerScrollTop();

    // search locations
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

  ngAfterViewInit(): void {
    this.publicService.scrollTop();
  }
  
  setLocalidad(localidad: Location) {
    if (localidad) {

      let idLocation = localidad.properties.id;
      this.publicService.getCompaniesByLocation(idLocation).subscribe((data: CompaniesResponse) => {
        this.companies = data.companies;
      })

      if (localidad.geometry?.coordinates) this.centerMap = localidad.geometry.coordinates;

      let provinciaNombre = localidad.properties.provincia.nombre;
      if (provinciaNombre.toLowerCase() === 'Ciudad Autónoma de Buenos Aires'.toLowerCase()) {
        provinciaNombre = 'CABA';
      }

      const capitalizedLocation =
        this.capitalizarPipe.transform(localidad.properties.nombre) + ', ' +
        this.capitalizarPipe.transform(localidad.properties.departamento.nombre) + ', ' +
        this.capitalizarPipe.transform(provinciaNombre);
      return capitalizedLocation;
    }
  }

  cleanInput(inputCompany) {
    this.publicService.canAksPositionUser = true;
    inputCompany.value = null;
  }

  stepperGoNext(stepper: MatStepper) {
    stepper.next();
  }


  stepperGoBack(stepper: MatStepper) {
    stepper.previous();
  }


  goBottom() {
    let drawer = document.querySelector('mat-drawer-content');
    if (drawer) drawer.scrollTo(0, drawer.scrollHeight);
  }

  goTop() {
    let drawer = document.querySelector('mat-drawer-content');
    if (drawer) drawer.scrollTo(0, 0);
  }



}
