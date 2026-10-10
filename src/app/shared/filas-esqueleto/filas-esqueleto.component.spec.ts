import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { buscarTodos } from '../../testing/datos-prueba';
import { FilasEsqueletoComponent } from './filas-esqueleto.component';

@Component({
  standalone: true,
  imports: [FilasEsqueletoComponent],
  template: `<table><tbody app-filas-esqueleto [filas]="3" [columnas]="2"></tbody></table>`,
})
class TablaDePruebaComponent {}

describe('FilasEsqueletoComponent', () => {
  it('dibuja la cantidad de filas pedida (FR7.4)', () => {
    const fixture = TestBed.createComponent(TablaDePruebaComponent);
    fixture.detectChanges();

    const filas = buscarTodos(fixture.nativeElement, 'fila-esqueleto');
    expect(filas.length).toBe(3);
    for (const fila of filas) {
      expect(fila.querySelectorAll('td .esqueleto').length).toBe(2);
    }
  });
});
