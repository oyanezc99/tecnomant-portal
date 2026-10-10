import { TestBed } from '@angular/core/testing';

import { SESION } from '../testing/datos-prueba';
import { SesionService } from './sesion.service';

describe('SesionService', () => {
  const CLAVE_SESION = 'tecnomant.sesion';
  let servicio: SesionService;

  beforeEach(() => {
    sessionStorage.clear();
    servicio = TestBed.inject(SesionService);
  });

  afterEach(() => sessionStorage.clear());

  it('al guardar, en sessionStorage queda solo { rol, nombre }, sin la clave (FR1.3, NFR1)', () => {
    // Llega un objeto con datos de más, como si se reenviara todo lo del formulario de login.
    const datosDeMas = { ...SESION, clave: 'clave-de-prueba', idTecnico: null };

    servicio.guardar(datosDeMas);

    const guardado = sessionStorage.getItem(CLAVE_SESION) ?? '';
    expect(JSON.parse(guardado)).toEqual({ rol: 'admin', nombre: 'Administrador' });
    expect(guardado).not.toContain('clave-de-prueba');
    expect(localStorage.getItem(CLAVE_SESION)).toBeNull();
    expect(document.cookie).not.toContain('clave-de-prueba');
  });

  it('al leer, devuelve nada si no hay sesión o si lo guardado no es válido (FR1.6)', () => {
    expect(servicio.leer()).toBeNull();

    sessionStorage.setItem(CLAVE_SESION, 'esto no es JSON');
    expect(servicio.leer()).toBeNull();

    sessionStorage.setItem(CLAVE_SESION, JSON.stringify({ rol: 'admin' }));
    expect(servicio.leer()).toBeNull();

    sessionStorage.setItem(CLAVE_SESION, JSON.stringify(SESION));
    expect(servicio.leer()).toEqual(SESION);
  });

  it('al cerrar, la sesión se borra (FR1.7)', () => {
    servicio.guardar(SESION);
    expect(servicio.leer()).toEqual(SESION);

    servicio.cerrar();

    expect(sessionStorage.getItem(CLAVE_SESION)).toBeNull();
    expect(servicio.leer()).toBeNull();
  });
});
