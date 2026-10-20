/** Tipos de los datos que el portal recibe de la API de TecnoMant y envía a ella. */

/** Respuesta de `POST /api/login`. */
export interface RespuestaLogin {
  token?: string;
  rol: 'admin' | 'tecnico';
  idTecnico: number | null;
  nombre: string;
}

/** Lo único que el portal guarda de la sesión. Nunca incluye la clave. */
export interface Sesion {
  token?: string;
  rol: string;
  nombre: string;
}

/** Respuesta de `GET /api/ordenes/resumen`. */
export interface ResumenOrdenes {
  pendientes: number;
  enProceso: number;
  completadas: number;
}

export interface Cliente {
  idCliente: number;
  razonSocial: string;
  direccion: string;
  contacto: string | null;
}

/** Campos que se envían al crear o editar un cliente. */
export type DatosCliente = Omit<Cliente, 'idCliente'>;

/** Resultado de un ítem y estado general de una inspección. */
export type Resultado = 'Bien' | 'Regular' | 'Malo';

/** Elemento de `GET /api/inspecciones`. */
export interface Inspeccion {
  idTecnico?: number;
  idInspeccion: number;
  idOrden: number;
  fechaHoraReal: string;
  cliente: string;
  equipoTipo: string;
  equipoCodigo: string;
  tecnico: string;
  estadoGeneral: Resultado;
}

export interface ItemChecklist {
  nombreItem: string;
  resultado: Resultado;
  observacion: string | null;
}

export interface Evidencia {
  idEvidencia: number;
  /** Ruta de la foto, relativa a la dirección base de la API. */
  url: string;
  fecha: string;
}

/** Respuesta de `GET /api/inspecciones/{id}`. */
export interface InspeccionDetalle {
  idInspeccion: number;
  idOrden: number;
  fechaHoraReal: string;
  cliente: string;
  equipoTipo: string;
  equipoCodigo: string;
  tecnico: string;
  estadoGeneral: Resultado | string;
  observaciones: string | null;
  items: ItemChecklist[];
  evidencias: Evidencia[];
}

export interface Equipo {
  idEquipo: number;
  idCliente: number;
  tipo: string;
  codigoSerie: string;
  ubicacion: string;
  cliente?: string;
}

export type DatosEquipo = Omit<Equipo, 'idEquipo' | 'cliente'>;

export interface Tecnico {
  idTecnico: number;
  nombre: string;
  dni: string;
  especialidad: string;
  usuario: string;
}

export interface DatosTecnico {
  nombre: string;
  dni: string;
  especialidad: string;
  usuario: string;
  clave: string;
}

export interface OrdenTecnico {
  idOrden: number;
  cliente: string;
  direccion: string;
  equipoTipo: string;
  equipoCodigo: string;
  ubicacion?: string;
  fechaProgramada: string;
  estado: string;
}
export interface OrdenAdministrativa extends OrdenTecnico {
  idEquipo: number;
  idTecnico: number;
  tecnico: string;
}
export interface DatosOrden {
  idEquipo: number;
  idTecnico: number;
  fechaProgramada: string;
  estado: string;
}
