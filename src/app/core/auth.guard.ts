import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { SesionService } from './sesion.service';

/**
 * Sin sesión guardada, envía a `/login`.
 * La navegación exige rol admin; la API verifica el token en cada petición.
 */
export const authGuard: CanActivateFn = () =>
  inject(SesionService).leer()?.rol === 'admin' ? true : inject(Router).createUrlTree(['/login']);
