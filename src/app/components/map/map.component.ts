import { Component, OnInit, ViewChild, Input, Output, EventEmitter, SimpleChanges, ElementRef } from '@angular/core';
import { SharedService } from '../../services/shared.service';
export const MAPBOX_TOKEN = 'pk.eyJ1IjoiY29kZXI0MDQiLCJhIjoiY2sxMnBkMnl1MDA4cDNvcDFxanV4cThzZSJ9.qHR4JrSJ0aqpIG8VVRUTLw';
import Swal from 'sweetalert2';
import { Company } from 'src/app/interfaces/company.interface';
import { Router } from '@angular/router';
import { ImagenPipe } from '../../pipes/imagen.pipe';
declare var mapboxgl: any;


interface MapCenterInit {
  lng: String;
  lat: string;
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  @ViewChild('mapbox', { static: true }) mapbox: ElementRef;
  @Input() companies: Company[] = []; // center definido en el formulario company-crear
  @Input() center: string[] = []; // center definido en el formulario company-crear
  @Input() mapCoords: string[]; // center definido en el formulario filtros (checks localidades)
  @Output() newMarker: EventEmitter<{}> = new EventEmitter();


  map: any;
  mapCenterInit: MapCenterInit = { lng: '-58.43680066430767', lat: '-34.608870104837614' };
  mapZoom = 14;
  geolocationDenied = false; // browser permission

	markerNewPlace: any; // Marker para el mapa nuevo Bar / Resto
	markersHome: any[] = []; // Markers del mapa en Home.
	markerInserted = false; // en crear company, es necesario crear solo un marker

  constructor(
    public sharedService: SharedService,
    private router: Router, 
    private imagenPipe: ImagenPipe
    ) { }

  async ngOnInit(): Promise<any>  {
    await this.inicializarMapa(this.mapbox);
  }

  async ngOnChanges(changes: SimpleChanges) {

		if (!this.map) {
			await this.inicializarMapa(this.mapbox);
    }
    

		// =======================================================================
		// SI CAMBIAN LOS AVISOS
		// =======================================================================
		if ((changes.companies !== undefined) && (changes.companies.currentValue !== undefined) && changes.companies.currentValue.length > 0) {
			if (this.router.url === '/home') { // solo si estoy en la page AVISOS voy a crear los puntos en el mapa

				// =======================================================================
				// MUESTRO ICONOS Y POPUPS DE LOS NUEVOS AVISOS
				// =======================================================================
				this.companies.forEach((company: any) => {
					if (company.tx_company_lat && company.tx_company_lng && this.map) { // solo si tiene coordenadas y el mapa existe
						// MARKER POPUP DATA
						const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
							`
							<div class="card rounded">
							<div class="card-body">
							<hr>  
							<h5 class="card-title" style="font-weight: 600;">${company.tx_company_name}</h5>
							  <h6><p>${company.tx_company_slogan}</p></h6>
							  <a href="#/public/${company.tx_company_string}">
							  	<button class="btn btn-primary btn-block btn-sm">
                    <i class="mdi mdi-content-paste"></i> Ir a este lugar! 
                  </button>
							  </a>
							</div>
						  </div>
							`
						);

						// CREATE MARKER
						const icon = document.createElement('div');
						icon.className = 'marker';
						icon.style.backgroundImage = 'url(\'../../../assets/img/map/duff-beer.svg\')';
						icon.style.width = '30px';
            icon.style.height = '30px';
            icon.style.backgroundSize = 'contain';
						const newmarker = new mapboxgl.Marker(icon)
							.setLngLat([company.tx_company_lng, company.tx_company_lat])
							.setPopup(popup) // sets a popup on this marker
							.addTo(this.map);
						this.markersHome.push(newmarker);

					}
				});

			}
		} else {
			if (this.markersHome.length > 0) {
				this.markersHome.forEach(marker => {
					marker.remove();
				});
			}
		}

    // =======================================================================
    // [AVISO] (NUEVO Y EDICION) SI CAMBIA LA POSICION DEL MARKER AL HACER CLICK EN EL MAPA
    // =======================================================================
    if (changes.center !== undefined && changes.center.currentValue !== undefined) {

      // Si hay coordenadas estoy en editar company, centro el mapa y pongo el marker en las coordenadas del company
      if (changes.center.currentValue.length > 0) {
        this.flyMap([changes.center.currentValue, changes.center.currentValue]);
        this.markerNewPlace = new mapboxgl.Marker({ draggable: true })
          .setLngLat(changes.center.currentValue)
          .addTo(this.map);
        this.markerInserted = true;
        this.markerNewPlace.on('dragend', e => {
          // this.newMarker.emit(this.markerNewPlace.getLngLat());
          this.markerNewPlace.setLngLat(e.target._lngLat);
          this.newMarker.emit(e.target._lngLat);
        });
      }


      this.map.on('click', e => {
        if (!this.markerInserted) { // Si no se inserto estoy en un company nuevo, espero a que el usuario ponga el marker.
          this.markerNewPlace = new mapboxgl.Marker({ draggable: true })
            .setLngLat(e.lngLat.wrap())
            .addTo(this.map);
          this.markerInserted = true;
        }
        this.newMarker.emit(e.lngLat.wrap());
        this.markerNewPlace.setLngLat(e.lngLat.wrap());
        this.markerNewPlace.on('dragend', e => {
          // this.newMarker.emit(this.markerNewPlace.getLngLat());
          this.markerNewPlace.setLngLat(e.target._lngLat);
          this.newMarker.emit(e.target._lngLat);
        });
      });

    }

    // =======================================================================
    // [FILTROS] SI CAMBIAN LAS COORDENADAS AL HACER CLICK EN UN CHECK DE LOCALIDAD
    // =======================================================================
    // mapCoords:
    // 0: (2) [-58.4628575470422, -34.5548815240237] PUNTO SUR-ESTE
    // 1: (2) [-58.4502890947349, -34.5437376606688] PUNTO NOR-OESTE
    if ((changes.mapCoords !== undefined) && (changes.mapCoords.currentValue !== undefined)) {
      this.flyMap(changes.mapCoords.currentValue);
    }
  }

  getCoords(): Promise<MapCenterInit> {
    return new Promise(resolve => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
          this.mapCenterInit.lng = position.coords.longitude.toString();
          this.mapCenterInit.lat = position.coords.latitude.toString();
          resolve(this.mapCenterInit);
        },
          err => {
            this.geolocationDenied = true;
          })
      }
    })
  }

  async inicializarMapa(mapbox: ElementRef) {
    let coords = await this.getCoords()
    const lat = Number(coords.lat);
    const lng = Number(coords.lng);
    mapboxgl.accessToken = MAPBOX_TOKEN;
    this.map = new mapboxgl.Map({
      container: mapbox.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: this.mapZoom
    });

    // CONTROL NAV
    const nav = new mapboxgl.NavigationControl();
    this.map.addControl(nav, 'bottom-right');

  }

  flyMap(center: string[]) {
		if (this.markerNewPlace) { this.markerNewPlace.remove(); }
		// Desde filtros.component envío const coords = [[O, S], [E, N]];
		// Si se trata de UN SOLO Marker, entonces O=E y S=N por lo tanto no hay que centrar con fitBounds sino
		// que el mapa tiene que viajar hacia un solo punto con flyTo.
		if (center[0][0] === center[1][0] && center[0][1] === center[1][1]) {
			// 	this.map.zoomTo(this.mapZoom, { duration: 4000 });
			if (this.map) { this.map.flyTo({ center: [String(center[0][0]), String(center[0][1])] , zoom: 15}); }
		} else {
			// centro desde el marker mas SO hacia el marker mas NE
			this.map.fitBounds(center, {
				padding: { top: 50, bottom: 50, left: 50, right: 50 }
			});
		}
	}
}
