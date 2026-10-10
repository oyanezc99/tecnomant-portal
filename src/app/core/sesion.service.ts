import { Injectable } from '@angular/core';

import { Sesion } from './modelos';

const CLAVE_SESION = 'tecnomant.sesion';

/** Guarda y lee la sesión del administrador en `sessionStorage`. */
@Injectable({ providedIn: 'root' })
export class SesionService {
  /** Guarda solo `rol` y `nombre`: se copian uno a uno para que no viaje ningún otro dato (NFR1). */
  guardar(sesion: Sesion): void {
    const datos: Sesion = { rol: sesion.rol, nombre: sesion.nombre };
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify(datos));
  }

  /** Devuelve la sesión guardada, o `null` si no hay ninguna o lo guardado no es válido. */
  leer(): Sesion | null {
    try {
      const datos = JSON.parse(sessionStorage.getItem(CLAVE_SESION) ?? 'null') as Partial<Sesion> | null;
      if (typeof datos?.rol === 'string' && typeof datos?.nombre === 'string') {
        return { rol: datos.rol, nombre: datos.nombre };
      }
    } catch {
      // Lo guardado no es JSON: se trata igual que si no hubiera sesión.
    }
    return null;
  }

  cerrar(): void {
    sessionStorage.removeItem(CLAVE_SESION);
  }
}
