import { TestBed } from '@angular/core/testing';

import { buscar } from '../../testing/datos-prueba';
import { BadgeComponent } from './badge.component';

describe('BadgeComponent', () => {
  it('aplica el color que corresponde a cada estado o resultado (FR8.3)', () => {
    const fixture = TestBed.createComponent(BadgeComponent);
    // Texto, clase de color y color de fondo que definen las variables de styles.css.
    const casos = [
      ['Pendiente', 'badge-pendiente', 'rgb(217, 164, 0)'],
      ['En proceso', 'badge-en-proceso', 'rgb(47, 111, 176)'],
      ['Completada', 'badge-completada', 'rgb(46, 139, 87)'],
      ['Bien', 'badge-bien', 'rgb(46, 139, 87)'],
      ['Regular', 'badge-regular', 'rgb(217, 164, 0)'],
      ['Malo', 'badge-malo', 'rgb(179, 38, 30)'],
    ];

    for (const [texto, clase, color] of casos) {
      fixture.componentRef.setInput('texto', texto);
      fixture.detectChanges();

      const pastilla = buscar(fixture.nativeElement, 'badge');
      expect(pastilla.textContent).toBe(texto);
      expect(pastilla.classList).toContain(clase);
      expect(getComputedStyle(pastilla).backgroundColor).withContext(texto).toBe(color);
      expect(getComputedStyle(pastilla).color).withContext(texto).toBe('rgb(255, 255, 255)');
    }
  });
});
