import { TestBed, fakeAsync, flush, tick } from '@angular/core/testing';

import { ToastService } from './toast.service';

describe('ToastService', () => {
  let servicio: ToastService;

  beforeEach(() => {
    servicio = TestBed.inject(ToastService);
  });

  it('mostrar un aviso lo agrega a la lista (FR7.3)', fakeAsync(() => {
    servicio.mostrar('No se pudo conectar con la API');
    servicio.mostrar('Usuario o clave incorrectos');

    expect(servicio.avisos().map((aviso) => aviso.texto)).toEqual([
      'No se pudo conectar con la API',
      'Usuario o clave incorrectos',
    ]);
    flush();
  }));

  it('el aviso se retira solo a los 3 s (FR7.3)', fakeAsync(() => {
    servicio.mostrar('Aviso de prueba');

    tick(2999);
    expect(servicio.avisos().length).toBe(1);

    tick(1);
    expect(servicio.avisos()).toEqual([]);
  }));
});
