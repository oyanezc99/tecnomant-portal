import { HttpErrorResponse } from '@angular/common/http';

export const MENSAJE_SIN_CONEXION = 'No se pudo conectar con la API';
export const MENSAJE_ERROR_INESPERADO = 'Ocurrió un error inesperado';

/** La API no respondió (apagada, sin red o bloqueada): `HttpClient` informa el estado 0. */
export function esErrorDeConexion(error: unknown): boolean {
  return error instanceof HttpErrorResponse && error.status === 0;
}

/** Texto que se muestra a la persona cuando falla una llamada a la API. */
export function mensajeDeError(error: unknown): string {
  if (esErrorDeConexion(error)) {
    return MENSAJE_SIN_CONEXION;
  }
  if (error instanceof HttpErrorResponse) {
    // La API devuelve sus errores como { "mensaje": "..." }: se muestra tal cual.
    const mensaje = (error.error as { mensaje?: unknown } | null)?.mensaje;
    if (typeof mensaje === 'string' && mensaje.trim() !== '') {
      return mensaje;
    }
  }
  return MENSAJE_ERROR_INESPERADO;
}
