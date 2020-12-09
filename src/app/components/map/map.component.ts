import { Component, OnInit, ViewChild, Input, Output, EventEmitter, SimpleChanges, ElementRef } from '@angular/core';
import { SharedService } from '../../services/shared.service';
export const MAPBOX_TOKEN = 'pk.eyJ1IjoiY29kZXI0MDQiLCJhIjoiY2sxMnBkMnl1MDA4cDNvcDFxanV4cThzZSJ9.qHR4JrSJ0aqpIG8VVRUTLw';
import Swal from 'sweetalert2';
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
  @Input() center: string[] = []; // center definido en el formulario aviso-crear
  @Input() mapCoords: string[]; // center definido en el formulario filtros (checks localidades)
  @Output() newMarker: EventEmitter<{}> = new EventEmitter();


  map: any;
  mapCenterInit: MapCenterInit = { lng: '-58.43680066430767', lat: '-34.608870104837614' };
  mapZoom = 14;
  geolocationDenied = false; // browser permission

	markerAviso: any; // Marker para el mapa Aviso nuevo
	markersAvisos: any[] = []; // Merkers del mapa avisos.
	markerInserted = false; // en crear aviso, es necesario crear solo un marker

  constructor(public sharedService: SharedService) { }

  async ngOnInit(): Promise<any>  {
    await this.inicializarMapa(this.mapbox);
  }

  async ngOnChanges(changes: SimpleChanges) {
		if (!this.map) {
			await this.inicializarMapa(this.mapbox);
		}
    // =======================================================================
    // [AVISO] (NUEVO Y EDICION) SI CAMBIA LA POSICION DEL MARKER AL HACER CLICK EN EL MAPA
    // =======================================================================
    if (changes.center !== undefined && changes.center.currentValue !== undefined) {

      // Si hay coordenadas estoy en editar aviso, centro el mapa y pongo el marker en las coordenadas del aviso
      if (changes.center.currentValue.length > 0) {
        this.flyMap([changes.center.currentValue, changes.center.currentValue]);
        this.markerAviso = new mapboxgl.Marker({ draggable: true })
          .setLngLat(changes.center.currentValue)
          .addTo(this.map);
        this.markerInserted = true;
        this.markerAviso.on('dragend', e => {
          // this.newMarker.emit(this.markerAviso.getLngLat());
          this.markerAviso.setLngLat(e.target._lngLat);
          this.newMarker.emit(e.target._lngLat);
        });
      }


      this.map.on('click', e => {
        if (!this.markerInserted) { // Si no se inserto estoy en un aviso nuevo, espero a que el usuario ponga el marker.
          this.markerAviso = new mapboxgl.Marker({ draggable: true })
            .setLngLat(e.lngLat.wrap())
            .addTo(this.map);
          this.markerInserted = true;
        }
        this.newMarker.emit(e.lngLat.wrap());
        this.markerAviso.setLngLat(e.lngLat.wrap());
        this.markerAviso.on('dragend', e => {
          // this.newMarker.emit(this.markerAviso.getLngLat());
          this.markerAviso.setLngLat(e.target._lngLat);
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
		if (this.markerAviso) { this.markerAviso.remove(); }
		// Desde filtros.component envío const coords = [[O, S], [E, N]];
		// Si se trata de UN SOLO Marker, entonces O=E y S=N por lo tanto no hay que centrar con fitBounds sino
		// que el mapa tiene que viajar hacia un solo punto con flyTo.
		if (center[0][0] === center[1][0] && center[0][1] === center[1][1]) {
			// 	this.map.zoomTo(this.mapZoom, { duration: 4000 });
			if (this.map) { this.map.flyTo({ center: [String(center[0][0]), String(center[0][1])] }); }
		} else {
			// centro desde el marker mas SO hacia el marker mas NE
			this.map.fitBounds(center, {
				padding: { top: 50, bottom: 50, left: 50, right: 50 }
			});
		}
	}
}
