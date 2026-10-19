import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { DETALLE, buscar, buscarTodos, errorDeApi } from '../../testing/datos-prueba';
import { InspeccionDetalleComponent } from './inspeccion-detalle.component';

describe('InspeccionDetalleComponent', () => {
  const URL_FOTO = environment.apiUrl + '/uploads/inspecciones/12/1.jpg';

  let api: jasmine.SpyObj<ApiService>;
  let toast: jasmine.SpyObj<ToastService>;
  let navegar: jasmine.Spy;
  let fixture: ComponentFixture<InspeccionDetalleComponent>;
  let raiz: HTMLElement;

  function crear(): void {
    fixture = TestBed.createComponent(InspeccionDetalleComponent);
    raiz = fixture.nativeElement;
    fixture.detectChanges();
  }

  function pulsar(testId: string): void {
    buscar(raiz, testId).click();
    fixture.detectChanges();
  }

  beforeEach(() => {
    api = jasmine.createSpyObj<ApiService>('ApiService', ['inspeccion']);
    api.inspeccion.and.returnValue(of(DETALLE));
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['mostrar']);
    TestBed.configureTestingModule({
      imports: [InspeccionDetalleComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '12' }) } } },
        { provide: ApiService, useValue: api },
        { provide: ToastService, useValue: toast },
      ],
    });
    navegar = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
  });

  it('muestra la cabecera, las observaciones generales y los ítems del checklist (FR6.1, FR6.2, FR6.3)', () => {
    crear();

    expect(api.inspeccion).toHaveBeenCalledOnceWith(12);
    const cabecera = buscar(raiz, 'detalle-cabecera');
    expect(cabecera.textContent).toContain('Condominio Vista Mar');
    expect(cabecera.textContent).toContain('Ascensor · ASC-004');
    expect(cabecera.textContent).toContain('Tecnico Prueba 1');
    expect(cabecera.textContent).toContain('09/10/2026 14:30');
    expect(buscar(cabecera, 'badge').textContent).toBe('Malo');
    expect(buscar(cabecera, 'badge').classList).toContain('badge-grande');
    expect(buscar(raiz, 'detalle-observaciones').textContent).toBe('Equipo con ruido en puertas');

    const items = buscarTodos(raiz, 'detalle-item');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('Funcionamiento');
    expect(buscar(items[0], 'badge').textContent).toBe('Bien');
  });

  it('el ítem en Malo está resaltado y muestra su observación (FR6.4)', () => {
    crear();

    const [funcionamiento, ruidos] = buscarTodos(raiz, 'detalle-item');
    expect(ruidos.classList).toContain('fila-malo');
    expect(ruidos.textContent).toContain('Ruido fuerte en puertas');
    expect(buscar(ruidos, 'badge').classList).toContain('badge-malo');
    expect(funcionamiento.classList).not.toContain('fila-malo');
  });

  it('cada miniatura usa la dirección apiUrl + url (FR6.5)', () => {
    crear();

    const miniaturas = buscarTodos(raiz, 'detalle-miniatura');
    expect(miniaturas.length).toBe(1);
    expect(miniaturas[0].querySelector('img')?.getAttribute('src')).toBe(URL_FOTO);
  });

  it('un clic en una miniatura abre la foto ampliada; Esc y un clic fuera la cierran (FR6.6)', () => {
    crear();
    expect(buscar(raiz, 'detalle-visor')).toBeNull();

    pulsar('detalle-miniatura');
    expect(buscar(raiz, 'detalle-foto-ampliada').getAttribute('src')).toBe(URL_FOTO);

    // Un clic sobre la propia foto no la cierra.
    pulsar('detalle-foto-ampliada');
    expect(buscar(raiz, 'detalle-visor')).not.toBeNull();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(buscar(raiz, 'detalle-visor')).toBeNull();

    pulsar('detalle-miniatura');
    pulsar('detalle-visor');
    expect(buscar(raiz, 'detalle-visor')).toBeNull();
  });

  it('← Volver navega a /inspecciones (FR6.7)', () => {
    crear();
    expect(buscar(raiz, 'detalle-volver').textContent).toContain('← Volver');

    pulsar('detalle-volver');

    expect(navegar).toHaveBeenCalledOnceWith(['/inspecciones']);
  });

  it('con 404, muestra el mensaje de la API y el botón ← Volver sigue visible (A12, FR7.2)', () => {
    api.inspeccion.and.returnValue(throwError(() => errorDeApi(404, 'La inspección no existe')));

    crear();

    expect(toast.mostrar).toHaveBeenCalledOnceWith('La inspección no existe');
    expect(buscar(raiz, 'detalle-volver')).not.toBeNull();
    expect(buscar(raiz, 'error-conexion-mensaje').textContent).toBe('La inspección no existe');
    expect(buscar(raiz, 'detalle-cabecera')).toBeNull();
  });
});