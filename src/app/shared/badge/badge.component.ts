import { Component, Input } from '@angular/core';

/** Pastilla con el estado de una orden o el resultado de una inspección. */
@Component({
  selector: 'app-badge',
  standalone: true,
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.css',
})
export class BadgeComponent {
  /** Texto que se muestra; también decide el color. */
  @Input({ required: true }) texto = '';
  @Input() grande = false;

  /** Clase de color de `styles.css`: "En proceso" pasa a ser `badge-en-proceso`. */
  get claseColor(): string {
    return 'badge-' + this.texto.toLowerCase().replace(/\s+/g, '-');
  }
}
