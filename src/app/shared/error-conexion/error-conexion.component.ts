import { Component, EventEmitter, Input, Output } from '@angular/core';

import { MENSAJE_SIN_CONEXION } from '../../core/errores';

/** Mensaje que ocupa el lugar de los datos cuando no se pudieron cargar, con el botón Reintentar. */
@Component({
  selector: 'app-error-conexion',
  standalone: true,
  templateUrl: './error-conexion.component.html',
  styleUrl: './error-conexion.component.css',
})
export class ErrorConexionComponent {
  @Input() mensaje = MENSAJE_SIN_CONEXION;
  @Output() reintentar = new EventEmitter<void>();
}
