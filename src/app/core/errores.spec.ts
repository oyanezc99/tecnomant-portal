import { HttpErrorResponse } from '@angular/common/http';

import { errorDeApi, errorSinConexion } from '../testing/datos-prueba';
import { esErrorDeConexion, mensajeDeError } from './errores';

describe('errores', () => {
  it('un error con estado 0 es de conexión y su texto es "No se pudo conectar con la API" (FR7.1)', () => {
    const error = errorSinConexion();

    expect(esErrorDeConexion(error)).toBeTrue();
    expect(mensajeDeError(error)).toBe('No se pudo conectar con la API');
  });

  it('un error con { mensaje } devuelve ese mensaje tal cual (FR7.2)', () => {
    const error = errorDeApi(409, 'No se puede eliminar: tiene registros relacionados');

    expect(esErrorDeConexion(error)).toBeFalse();
    expect(mensajeDeError(error)).toBe('No se puede eliminar: tiene registros relacionados');
  });

  it('un error sin mensaje devuelve "Ocurrió un error inesperado" (A13)', () => {
    expect(mensajeDeError(new HttpErrorResponse({ status: 500, error: null }))).toBe('Ocurrió un error inesperado');
    expect(mensajeDeError(new HttpErrorResponse({ status: 500, error: 'texto suelto' }))).toBe(
      'Ocurrió un error inesperado',
    );
    expect(mensajeDeError(new Error('fallo ajeno a la API'))).toBe('Ocurrió un error inesperado');
  });
});
