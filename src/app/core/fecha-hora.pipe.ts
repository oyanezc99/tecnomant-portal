import { Pipe, PipeTransform } from '@angular/core';

/** Fecha ISO 8601 sin zona horaria, como la envía la API: `2026-10-09T14:30:00`. */
const FECHA_ISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;

/**
 * Muestra una fecha de la API como `dd/MM/yyyy HH:mm`.
 * No convierte zonas horarias: la API envía la hora local y se muestra tal cual.
 */
@Pipe({ name: 'fechaHora', standalone: true })
export class FechaHoraPipe implements PipeTransform {
  transform(valor: string | null | undefined): string {
    const partes = FECHA_ISO.exec(valor ?? '');
    if (!partes) {
      return '';
    }
    const [, anio, mes, dia, hora, minuto] = partes;
    if (+mes < 1 || +mes > 12 || +dia < 1 || +dia > 31 || +hora > 23 || +minuto > 59) {
      return '';
    }
    return `${dia}/${mes}/${anio} ${hora}:${minuto}`;
  }
}
