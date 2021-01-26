import { Component, OnInit, ViewChild, Input, Output, EventEmitter, SimpleChanges, ElementRef } from '@angular/core';
export const MAPBOX_TOKEN = 'pk.eyJ1IjoiY29kZXI0MDQiLCJhIjoiY2sxMnBkMnl1MDA4cDNvcDFxanV4cThzZSJ9.qHR4JrSJ0aqpIG8VVRUTLw';
import { Company } from 'src/app/interfaces/company.interface';
import { Router } from '@angular/router';
import { PublicService } from '../../modules/public/public.service';
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
  companiesNameHome: any[] = []; // Nombres de Negocios en el mapa en Home.

  markerInserted = false; // en crear company, es necesario crear solo un marker

  config: any = {};

  constructor(
    public publicService: PublicService,
    private router: Router
  ) { }

  async ngOnInit(): Promise<any> {

    if (localStorage.getItem('config')) {
      this.config = JSON.parse(localStorage.getItem('config'));
    }

    if (!this.config.theme) {
      let hours = new Date().getHours();

      if (hours >= 6 && hours < 20) {
        // light theme
        this.config.maptheme = 'streets-v11'
      } else {
        // dark theme
        this.config.maptheme = 'dark-v10';
      }

    } else {
      if (['deeppurple-amber.css', 'indigo-pink.css'].includes(this.config.theme)) {
        // light theme
        this.config.maptheme = 'streets-v11'
      } else {
        // dark theme
        this.config.maptheme = 'dark-v10';
      }
    }




    await this.inicializarMapa(this.mapbox);
  }

  async ngOnChanges(changes: SimpleChanges) {

    if (!this.map) {
      await this.inicializarMapa(this.mapbox);
    }

    if (this.router.url === '/home') { // solo si estoy en la page HOME voy a mostrar los markers

      // RECIBE CENTRO DE MAPA
      if (changes.center?.currentValue.length > 0) {
        this.flyMap([changes.center.currentValue, changes.center.currentValue]);
      }

      // MARKERS DE COMERCIOS
      if (changes.companies?.currentValue.length > 0) {

        this.companies.forEach((company: Company) => {
          if (company.tx_company_lat && company.tx_company_lng && this.map) { // solo si tiene coordenadas y el mapa existe




            // MARKER POPUP DATA
            const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
              `
							<div class="mat-card company-card animated fadeIn">
                <div class="lg text-accent">${company.tx_company_name}</div>
          	    <div class="md text-info mt-2">${company.tx_address_street} ${company.tx_address_number}</div>
                 <hr>
                <div class="sm company-welcome-textarea">${company.tx_company_welcome}</div>
                  <a href="/public/${company.tx_company_string}">
							  	  <button class="btn btn-block btn-sm btn-secondary">
                      <i class="lg mdi mdi-glass-mug-variant"></i> Ir a este lugar! 
                    </button>
                  </a>
                </div>
						  `
            );

            // CREATE MARKER
            const icon = document.createElement('div');
            icon.className = 'marker';
            icon.style.backgroundImage = company.tx_company_type === 'bar' ? 'url(\'../../../assets/img/svg/beer.svg\')' : 'url(\'../../../assets/img/svg/resto.svg\')';
            icon.style.width = '30px';
            icon.style.height = '30px';
            icon.style.cursor = 'pointer';
            icon.style.backgroundSize = 'contain';
            const newmarker = new mapboxgl.Marker(icon)
              .setLngLat([company.tx_company_lng, company.tx_company_lat])
              .setPopup(popup) // sets a popup on this marker
              .addTo(this.map);
            this.markersHome.push(newmarker);

            const label = document.createElement('div');


            label.innerHTML = `<div class="marker-text-wrapper"><span class="marker-text">${company.tx_company_name}</span></div>`;
            
            const companyName = new mapboxgl.Marker(label)
              .setLngLat([company.tx_company_lng, company.tx_company_lat])
              .addTo(this.map);
            this.companiesNameHome.push(companyName);


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
    // RECIBE CENTER
    // =======================================================================

    if (this.router.url !== '/home') { // solo si estoy en la page HOME voy a mostrar los markers
      if (changes.center !== undefined && changes.center.currentValue !== undefined) {
        if (changes.center.currentValue.length > 0) {
          this.flyMap([changes.center.currentValue, changes.center.currentValue]);

          // CREA UN MARKER DRAGGEABLE EN CENTER
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

        // CREA EVENTO CLICK EN EL MAPA
        this.map.on('click', e => {
          if (!this.markerInserted) {
            // Si no se inserto estoy en un company nuevo, espero a que el usuario ponga el marker.
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
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
          this.mapCenterInit.lng = position.coords.longitude.toString();
          this.mapCenterInit.lat = position.coords.latitude.toString();
          resolve(this.mapCenterInit);
        },
          err => {
            reject(this.mapCenterInit);
            this.geolocationDenied = true;
          })
      }
    })
  }

  async inicializarMapa(mapbox: ElementRef) {
    let coords = await this.getCoords().catch((coords) => {
      this.mapZoom = 10;
      return coords;
    })


    const lat = Number(coords.lat);
    const lng = Number(coords.lng);
    mapboxgl.accessToken = MAPBOX_TOKEN;
    this.map = new mapboxgl.Map({
      container: mapbox.nativeElement,
      style: `mapbox://styles/mapbox/${this.config.maptheme}`,
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
      if (this.map) { this.map.flyTo({ center: [String(center[0][0]), String(center[0][1])], zoom: 15 }); }
    } else {
      // centro desde el marker mas SO hacia el marker mas NE
      this.map.fitBounds(center, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 }
      });
    }
  }
}
