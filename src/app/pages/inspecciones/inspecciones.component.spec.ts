import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { INSPECCIONES, buscar, buscarTodos } from '../../testing/datos-prueba';
import { InspeccionesComponent } from './inspecciones.component';

describe('InspeccionesComponent', () => {
  let api: jasmine.SpyObj<ApiService>;
  let navegar: jasmine.Spy;
  let fixture: ComponentFixture<InspeccionesComponent>;
  let raiz: HTMLElement;

  const filas = () => buscarTodos(raiz, 'inspecciones-fila');
  const estados = () => filas().map((fila) => buscar(fila, 'badge').textContent);

  beforeEach(() => {
    api = jasmine.createSpyObj<ApiService>('ApiService', ['inspecciones']);
    api.inspecciones.and.returnValue(of(INSPECCIONES));
    TestBed.configureTestingModule({
      imports: [InspeccionesComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: api },
        { provide: ToastService, useValue: jasmine.createSpyObj<ToastService>('ToastService', ['mostrar']) },
      ],
    });
    navegar = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fixture = TestBed.createComponent(InspeccionesComponent);
    raiz = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('muestra las inspecciones con su fecha con formato y su estado general en badge (FR5.1, FR8.3)', () => {
    expect(filas().length).toBe(6);
    expect(filas()[0].textContent).toContain('09/10/2026 14:30');
    expect(filas()[0].textContent).toContain('Condominio Vista Mar');
    expect(filas()[0].textContent).toContain('Ascensor · ASC-004');
    expect(filas()[0].textContent).toContain('Tecnico Prueba 1');
    expect(buscar(filas()[0], 'badge').classList).toContain('badge-malo');
    // Mismo orden que la respuesta de la API.
    expect(estados()).toEqual(['Malo', 'Bien', 'Regular', 'Bien', 'Malo', 'Bien']);
  });

  it('el selector filtra por estado general sin volver a llamar a la API (FR5.2)', () => {
    const selector = buscar<HTMLSelectElement>(raiz, 'inspecciones-filtro-estado');
    const elegir = (estado: string) => {
      selector.value = estado;
      selector.dispatchEvent(new Event('change'));
      fixture.detectChanges();
    };
    expect(Array.from(selector.options).map((opcion) => opcion.value)).toEqual(['Todos', 'Bien', 'Regular', 'Malo']);

    elegir('Malo');
    expect(estados()).toEqual(['Malo', 'Malo']);

    elegir('Regular');
    expect(estados()).toEqual(['Regular']);

    elegir('Todos');
    expect(filas().length).toBe(6);
    expect(api.inspecciones).toHaveBeenCalledTimes(1);
  });

  it('un clic en una fila navega a /inspecciones/{idInspeccion} (FR5.3)', () => {
    filas()[1].click();

    expect(navegar).toHaveBeenCalledOnceWith(['/inspecciones', 11]);
  });
});
