import { HttpErrorResponse } from '@angular/common/http';

import { Cliente, Inspeccion, InspeccionDetalle, Resultado, ResumenOrdenes, Sesion } from '../core/modelos';

/*
 * Datos y ayudas que comparten las pruebas. Los datos salen de los ejemplos del
 * contrato de la API; ninguno es un dato real.
 */

export const SESION: Sesion = { rol: 'admin', nombre: 'Administrador' };

export const RESUMEN: ResumenOrdenes = { pendientes: 4, enProceso: 1, completadas: 0 };

export const CLIENTES: Cliente[] = [
  {
    idCliente: 1,
    razonSocial: 'Edificio Residencial Los Álamos',
    direccion: 'Av. Arequipa 1234, Lince',
    contacto: 'Rosa Paredes',
  },
  { idCliente: 2, razonSocial: 'Condominio Vista Mar', direccion: 'Malecón Grau 250', contacto: 'Luis Torres' },
  { idCliente: 3, razonSocial: 'Planta Industrial Norte', direccion: 'Av. Industrial 900', contacto: null },
];

function inspeccion(idInspeccion: number, estadoGeneral: Resultado, dia: string): Inspeccion {
  return {
    idInspeccion,
    idOrden: idInspeccion,
    fechaHoraReal: `2026-10-${dia}T14:30:00`,
    cliente: 'Condominio Vista Mar',
    equipoTipo: 'Ascensor',
    equipoCodigo: 'ASC-004',
    tecnico: 'Tecnico Prueba 1',
    estadoGeneral,
  };
}

/** Seis inspecciones, la más reciente primero, con los tres estados generales. */
export const INSPECCIONES: Inspeccion[] = [
  inspeccion(12, 'Malo', '09'),
  inspeccion(11, 'Bien', '08'),
  inspeccion(10, 'Regular', '07'),
  inspeccion(9, 'Bien', '06'),
  inspeccion(8, 'Malo', '05'),
  inspeccion(7, 'Bien', '04'),
];

/** Detalle de la inspección 12: un ítem en Malo con su observación y una foto. */
export const DETALLE: InspeccionDetalle = {
  ...INSPECCIONES[0],
  observaciones: 'Equipo con ruido en puertas',
  items: [
    { nombreItem: 'Funcionamiento', resultado: 'Bien', observacion: null },
    { nombreItem: 'Ruidos', resultado: 'Malo', observacion: 'Ruido fuerte en puertas' },
  ],
  evidencias: [{ idEvidencia: 7, url: '/uploads/inspecciones/12/1.jpg', fecha: '2026-10-09T14:31:10' }],
};

/** Error que entrega `HttpClient` cuando la API no responde. */
export function errorSinConexion(): HttpErrorResponse {
  return new HttpErrorResponse({ status: 0 });
}

/** Error que la API devuelve como `{ mensaje }`. */
export function errorDeApi(status: number, mensaje: string): HttpErrorResponse {
  return new HttpErrorResponse({ status, error: { mensaje } });
}

/** Primer elemento de `raiz` con ese `data-testid`. */
export function buscar<T extends HTMLElement = HTMLElement>(raiz: HTMLElement, testId: string): T {
  return raiz.querySelector(`[data-testid="${testId}"]`) as T;
}

/** Todos los elementos de `raiz` con ese `data-testid`. */
export function buscarTodos(raiz: HTMLElement, testId: string): HTMLElement[] {
  return Array.from(raiz.querySelectorAll<HTMLElement>(`[data-testid="${testId}"]`));
}

/** Escribe en un campo de texto como lo haría una persona. */
export function escribir(raiz: HTMLElement, testId: string, texto: string): void {
  const campo = buscar<HTMLInputElement>(raiz, testId);
  campo.value = texto;
  campo.dispatchEvent(new Event('input'));
}
