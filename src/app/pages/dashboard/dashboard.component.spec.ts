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

  it('cuenta Bien, Regular y Malo como realizadas y usa todas las inspecciones, no solo las últimas cinco', () => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(2026, 9, 19, 12));
    try {
      api.inspecciones.and.returnValue(of(INSPECCIONES.map((inspeccion, indice) => ({
        ...inspeccion,
        fechaHoraReal: '2026-10-18T10:30:00',
        estadoGeneral: (['Bien', 'Regular', 'Malo'] as const)[indice % 3],
      }))));
      crear();
      const dias = fixture.componentInstance.rendimientoMensual();
      expect(dias[17].completadas).toBe(INSPECCIONES.length);
      expect(dias.reduce((total, dia) => total + dia.completadas, 0)).toBe(INSPECCIONES.length);
      expect(buscarTodos(raiz, 'dashboard-fila').length).toBe(5);
      const barras = raiz.querySelectorAll('[data-dia="18"] rect');
      expect(Number(barras[1].getAttribute('height'))).toBe(95);
      expect(Number(raiz.querySelector('[data-dia="1"] rect:last-of-type')?.getAttribute('height'))).toBe(0);
    } finally {
      jasmine.clock().uninstall();
    }
  });

  it('excluye fechas inválidas, otros meses y otros años del conteo mensual', () => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(2026, 9, 19, 12));
    try {
      const fechas = ['2026-10-01T09:00:00', '2026-10-31T18:00:00', '2026-09-30T10:00:00', '2025-10-19T12:00:00', 'invalida', ''];
      api.inspecciones.and.returnValue(of(INSPECCIONES.map((inspeccion, indice) => ({ ...inspeccion, fechaHoraReal: fechas[indice] }))));
      crear();
      const dias = fixture.componentInstance.rendimientoMensual();
      expect(dias.length).toBe(31);
      expect(dias[0].completadas).toBe(1);
      expect(dias[30].completadas).toBe(1);
      expect(dias.reduce((total, dia) => total + dia.completadas, 0)).toBe(2);
    } finally {
      jasmine.clock().uninstall();
    }
  });

});
