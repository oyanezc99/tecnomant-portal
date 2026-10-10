import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { buscar } from '../../testing/datos-prueba';
import { ModalComponent } from './modal.component';

@Component({
  standalone: true,
  imports: [ModalComponent],
  template: `
    <app-modal titulo="Nuevo cliente" (cerrar)="cierres = cierres + 1">
      <p data-testid="contenido">Contenido de prueba</p>
    </app-modal>
  `,
})
class PantallaDePruebaComponent {
  cierres = 0;
}

describe('ModalComponent', () => {
  it('muestra su contenido y avisa cuando se cierra (FR4.3)', () => {
    const fixture = TestBed.createComponent(PantallaDePruebaComponent);
    const raiz: HTMLElement = fixture.nativeElement;
    fixture.detectChanges();

    expect(buscar(raiz, 'modal-titulo').textContent).toBe('Nuevo cliente');
    expect(buscar(buscar(raiz, 'modal'), 'contenido').textContent).toBe('Contenido de prueba');
    expect(fixture.componentInstance.cierres).toBe(0);

    buscar(raiz, 'modal-cerrar').click();
    expect(fixture.componentInstance.cierres).toBe(1);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(fixture.componentInstance.cierres).toBe(2);
  });
});
