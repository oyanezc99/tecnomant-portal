import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { SesionService } from '../core/sesion.service';
import { SESION, buscar } from '../testing/datos-prueba';
import { LayoutComponent } from './layout.component';

describe('LayoutComponent', () => {
  let fixture: ComponentFixture<LayoutComponent>;
  let raiz: HTMLElement;
  let router: Router;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ imports: [LayoutComponent], providers: [provideRouter([])] });
    TestBed.inject(SesionService).guardar(SESION);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(LayoutComponent);
    raiz = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => sessionStorage.clear());

  it('la barra muestra "TecnoMant · Portal administrativo" y el nombre del usuario (FR2.1)', () => {
    expect(buscar(raiz, 'layout-titulo-portal').textContent).toContain('TecnoMant · Portal administrativo');
    expect(buscar(raiz, 'layout-usuario').textContent).toContain('Administrador');
  });

  it('el menú incluye los módulos habilitados en el orden acordado', () => {
    const etiquetas = Array.from(raiz.querySelectorAll('.menu-etiqueta')).map(e=>e.textContent);
    expect(etiquetas).toEqual(['Dashboard', 'Clientes', 'Equipos', 'Técnicos', 'Órdenes', 'Inspecciones']);
    for(const id of ['clientes','equipos','tecnicos','ordenes','inspecciones']) {
      expect(buscar(raiz,'menu-'+id).tagName).toBe('A');
      expect(buscar(raiz,'menu-'+id).getAttribute('href')).toBe('/'+id);
    }
  });

  it('Cerrar sesión borra la sesión y navega a /login (FR1.7)', () => {
    const navegar = spyOn(router, 'navigate').and.resolveTo(true);

    buscar(raiz, 'layout-cerrar-sesion').click();

    expect(sessionStorage.getItem('tecnomant.sesion')).toBeNull();
    expect(navegar).toHaveBeenCalledOnceWith(['/login']);
  });

  it('el botón ☰ muestra y vuelve a ocultar el menú (FR2.6)', () => {
    const boton = buscar(raiz, 'layout-boton-menu');
    const menu = buscar(raiz, 'layout-menu');
    expect(boton.textContent).toContain('☰');
    expect(menu.classList).not.toContain('abierto');

    boton.click();
    fixture.detectChanges();
    expect(menu.classList).toContain('abierto');
    expect(boton.getAttribute('aria-expanded')).toBe('true');

    boton.click();
    fixture.detectChanges();
    expect(menu.classList).not.toContain('abierto');
    expect(boton.getAttribute('aria-expanded')).toBe('false');
  });
});
