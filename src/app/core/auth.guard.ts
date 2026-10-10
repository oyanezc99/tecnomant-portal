import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { SesionService } from './sesion.service';

/**
 * Sin sesión guardada, envía a `/login`.
 * Es solo una protección de navegación: la API del avance no pide token (C5).
 */
export const authGuard: CanActivateFn = () =>
  inject(SesionService).leer() ? true : inject(Router).createUrlTree(['/login']);
