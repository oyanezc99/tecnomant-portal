import { TestBed } from '@angular/core/testing';

import { buscar } from '../../testing/datos-prueba';
import { ErrorConexionComponent } from './error-conexion.component';

describe('ErrorConexionComponent', () => {
  it('muestra "No se pudo conectar con la API" y avisa al pulsar Reintentar (FR7.1)', () => {
    const fixture = TestBed.createComponent(ErrorConexionComponent);
    const raiz: HTMLElement = fixture.nativeElement;
    let reintentos = 0;
    fixture.componentInstance.reintentar.subscribe(() => reintentos++);
    fixture.detectChanges();

    expect(buscar(raiz, 'error-conexion-mensaje').textContent).toBe('No se pudo conectar con la API');
    expect(reintentos).toBe(0);

    buscar(raiz, 'error-conexion-reintentar').click();

    expect(reintentos).toBe(1);
  });
});
