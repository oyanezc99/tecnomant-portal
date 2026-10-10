import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { INSPECCIONES, RESUMEN, buscar, buscarTodos, errorSinConexion } from '../../testing/datos-prueba';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let api: jasmine.SpyObj<ApiService>;
  let toast: jasmine.SpyObj<ToastService>;
  let navegar: jasmine.Spy;
  let fixture: ComponentFixture<DashboardComponent>;
  let raiz: HTMLElement;

  function crear(): void {
    fixture = TestBed.createComponent(DashboardComponent);
    raiz = fixture.nativeElement;
    fixture.detectChanges();
  }

  const numero = (id: string) => buscar(raiz, 'dashboard-' + id).textContent?.trim();

  beforeEach(() => {
    // Movimiento reducido: los números muestran su valor final sin esperar al conteo.
    spyOn(window, 'matchMedia').and.returnValue({ matches: true } as MediaQueryList);
    api = jasmine.createSpyObj<ApiService>('ApiService', ['resumenOrdenes', 'inspecciones']);
    api.resumenOrdenes.and.returnValue(of(RESUMEN));
    api.inspecciones.and.returnValue(of(INSPECCIONES));
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['mostrar']);
    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: api },
        { provide: ToastService, useValue: toast },
      ],
    });
    navegar = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
  });

  it('las tres tarjetas muestran los valores del resumen (FR3.1)', () => {
    crear();

    expect(raiz.textContent).toContain('Pendientes');
    expect(raiz.textContent).toContain('En proceso');
    expect(raiz.textContent).toContain('Completadas');
    expect(numero('pendientes')).toBe('4');
    expect(numero('en-proceso')).toBe('1');
    expect(numero('completadas')).toBe('0');
  });

  it('la tabla muestra solo las 5 primeras inspecciones (FR3.3)', () => {
    crear();

    const filas = buscarTodos(raiz, 'dashboard-fila');
    expect(filas.length).toBe(5);
    expect(filas[0].textContent).toContain('09/10/2026 14:30');
    expect(filas[0].textContent).toContain('Ascensor · ASC-004');
    expect(filas[4].textContent).toContain('05/10/2026 14:30');
    // La sexta inspección de la respuesta queda fuera.
    expect(raiz.textContent).not.toContain('04/10/2026');
  });

  it('un clic en una fila navega a /inspecciones/{idInspeccion} (FR3.4)', () => {
    crear();

    buscarTodos(raiz, 'dashboard-fila')[0].click();

    expect(navegar).toHaveBeenCalledOnceWith(['/inspecciones', 12]);
  });

  it('sin inspecciones, muestra "Aún no hay inspecciones" (A11)', () => {
    api.inspecciones.and.returnValue(of([]));

    crear();

    expect(buscar(raiz, 'dashboard-vacio').textContent).toContain('Aún no hay inspecciones');
    expect(buscarTodos(raiz, 'dashboard-fila').length).toBe(0);
  });

  it('si la API no responde, muestra el mensaje y Reintentar vuelve a pedir los datos (FR7.1, NFR4)', () => {
    api.resumenOrdenes.and.returnValue(throwError(() => errorSinConexion()));

    crear();

    expect(buscar(raiz, 'error-conexion-mensaje').textContent).toContain('No se pudo conectar con la API');
    expect(buscarTodos(raiz, 'dashboard-fila').length).toBe(0);

    api.resumenOrdenes.and.returnValue(of(RESUMEN));
    buscar(raiz, 'error-conexion-reintentar').click();
    fixture.detectChanges();

    expect(api.resumenOrdenes).toHaveBeenCalledTimes(2);
    expect(buscar(raiz, 'error-conexion')).toBeNull();
    expect(numero('pendientes')).toBe('4');
    expect(buscarTodos(raiz, 'dashboard-fila').length).toBe(5);
  });
});
