export interface LocationsResponse {
  ok: boolean;
  locations: Location[];
}

export interface Location {
  properties: Properties;
  geometry: Geometry;
  _id: string;
  type: string;
}

interface Geometry {
  coordinates: number[];
  type: string;
}

interface Properties {
  municipio: Municipio;
  departamento: Departamento;
  provincia: Provincia;
  localidad_censal: LocalidadCensal;
  categoria: string;
  fuente: string;
  nombre: string;
  id: string;
}

interface Departamento {
  nombre: string;
  id: string;
}

interface Provincia {
  nombre: string;
  id: string;
}

interface LocalidadCensal {
  nombre: string;
  id: string;
}

interface Municipio {
  nombre?: string;
  id?: string;
}