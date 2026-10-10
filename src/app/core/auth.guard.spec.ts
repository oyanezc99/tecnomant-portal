import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';

import { SESION } from '../testing/datos-prueba';
import { authGuard } from './auth.guard';
import { SesionService } from './sesion.service';

describe('authGuard', () => {
  const ejecutar = () =>
    TestBed.runInInjectionContext(() => authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  afterEach(() => sessionStorage.clear());

  it('sin sesión, redirige a /login (FR1.6)', () => {
    const resultado = ejecutar();

    expect(resultado instanceof UrlTree).toBeTrue();
    expect(TestBed.inject(Router).serializeUrl(resultado as UrlTree)).toBe('/login');
  });

  it('con sesión, deja pasar (FR1.6)', () => {
    TestBed.inject(SesionService).guardar(SESION);

    expect(ejecutar()).toBeTrue();
  });
});
