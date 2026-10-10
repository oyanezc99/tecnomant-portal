import { Component, Input } from '@angular/core';

/**
 * Filas de carga para el cuerpo de una tabla mientras llega la respuesta de la API.
 * Se usa sobre el propio `<tbody>` para no romper la estructura de la tabla.
 */
@Component({
  selector: 'tbody[app-filas-esqueleto]',
  standalone: true,
  templateUrl: './filas-esqueleto.component.html',
  styleUrl: './filas-esqueleto.component.css',
})
export class FilasEsqueletoComponent {
  listaFilas = rango(5);
  listaColumnas = rango(4);

  @Input() set filas(cantidad: number) {
    this.listaFilas = rango(cantidad);
  }

  @Input() set columnas(cantidad: number) {
    this.listaColumnas = rango(cantidad);
  }
}

function rango(cantidad: number): number[] {
  return Array.from({ length: cantidad }, (_, indice) => indice);
}
