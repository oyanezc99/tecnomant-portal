import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { routes } from './app.routes';
import { ApiService } from './core/api.service';
import { SesionService } from './core/sesion.service';
import { RESUMEN, SESION, buscar } from './testing/datos-prueba';

describe('Rutas del portal', () => {
  let api: jasmine.SpyObj<ApiService>;

  /** Abre una dirección como lo haría el navegador y dice dónde termina. */
  async function abrir(direccion: string): Promise<{ url: string; raiz: HTMLElement }> {
    const arnes = await RouterTestingHarness.create();
    await arnes.navigateByUrl(direccion);
    return { url: TestBed.inject(Router).url, raiz: arnes.fixture.nativeElement };
  }

  beforeEach(() => {
    sessionStorage.clear();
    // Con movimiento reducido el Dashboard no deja un conteo en marcha.
    spyOn(window, 'matchMedia').and.returnValue({ matches: true } as MediaQueryList);
    api = jasmine.createSpyObj<ApiService>('ApiService', ['resumenOrdenes', 'inspecciones']);
    api.resumenOrdenes.and.returnValue(of(RESUMEN));
    api.inspecciones.and.returnValue(of([]));
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), { provide: ApiService, useValue: api }],
    });
  });

  afterEach(() => sessionStorage.clear());

  it('sin sesión, abrir /dashboard lleva a /login (FR1.6)', async () => {
    const destino = await abrir('/dashboard');

    expect(destino.url).toBe('/login');
    expect(api.resumenOrdenes).not.toHaveBeenCalled();
  });

  it('con sesión, una ruta que no existe lleva a /dashboard (FR2.4)', async () => {
    TestBed.inject(SesionService).guardar(SESION);

    const destino = await abrir('/no-existe/123');

    expect(destino.url).toBe('/dashboard');
    expect(buscar(destino.raiz, 'layout-titulo-pagina').textContent).toBe('Dashboard');
  });

  it('con sesión, /equipos lleva a /dashboard (FR2.4, A2)', async () => {
    TestBed.inject(SesionService).guardar(SESION);

    const destino = await abrir('/equipos');

    expect(destino.url).toBe('/dashboard');
  });
});
