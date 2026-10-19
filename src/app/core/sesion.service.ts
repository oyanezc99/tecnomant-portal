import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Injectable, inject } from '@angular/core';

import { Sesion } from './modelos';

const CLAVE_SESION = 'tecnomant.sesion';

/** Guarda y lee la sesión del administrador en `sessionStorage`. */
@Injectable({ providedIn: 'root' })
export class SesionService {
  private readonly http=inject(HttpClient,{optional:true});
  /** Guarda rol, nombre y token de sesión; nunca la contraseña. */
  guardar(sesion: Sesion): void {
    const datos: Sesion = { rol: sesion.rol, nombre: sesion.nombre, ...(sesion.token ? { token: sesion.token } : {}) };
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify(datos));
  }

  /** Devuelve la sesión guardada, o `null` si no hay ninguna o lo guardado no es válido. */
  leer(): Sesion | null {
    try {
      const datos = JSON.parse(sessionStorage.getItem(CLAVE_SESION) ?? 'null') as Partial<Sesion> | null;
      if (typeof datos?.rol === 'string' && typeof datos?.nombre === 'string') {
        return { rol: datos.rol, nombre: datos.nombre, ...(typeof datos.token === 'string' ? { token: datos.token } : {}) };
      }
    } catch {
      // Lo guardado no es JSON: se trata igual que si no hubiera sesión.
    }
    return null;
  }

  cerrar(): void {
    const token=this.leer()?.token;
    sessionStorage.removeItem(CLAVE_SESION);
    if(token && this.http) this.http.post(environment.apiUrl+'/api/logout',{}, {headers:{Authorization:'Bearer '+token}, withCredentials:true}).subscribe({error:()=>{}});
  }
}
