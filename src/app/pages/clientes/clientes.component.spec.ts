import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';

import { ApiService } from '../../core/api.service';
import { Cliente } from '../../core/modelos';
import { ToastService } from '../../core/toast.service';
import { CLIENTES, buscar, buscarTodos, errorDeApi, escribir } from '../../testing/datos-prueba';
import { ClientesComponent } from './clientes.component';

describe('ClientesComponent', () => {
  let api: jasmine.SpyObj<ApiService>;
  let toast: jasmine.SpyObj<ToastService>;
  let fixture: ComponentFixture<ClientesComponent>;
  let raiz: HTMLElement;

  const filas = () => raiz.querySelectorAll('[data-testid^="clientes-fila-"]');
  const fila = (idCliente: number) => buscar(raiz, 'clientes-fila-' + idCliente);
  const campo = (testId: string) => buscar<HTMLInputElement>(raiz, testId);

  /** Refresca la pantalla y espera a que los campos del formulario reciban sus valores. */
  async function refrescar(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  async function crear(): Promise<void> {
    fixture = TestBed.createComponent(ClientesComponent);
    raiz = fixture.nativeElement;
    await refrescar();
  }

  /** Pulsa el botón con ese `data-testid` (dentro de `zona`) y refresca la pantalla. */
  async function pulsar(testId: string, zona: HTMLElement = raiz): Promise<void> {
    buscar(zona, testId).click();
    await refrescar();
  }

  beforeEach(() => {
    api = jasmine.createSpyObj<ApiService>('ApiService', [
      'clientes',
      'crearCliente',
      'editarCliente',
      'eliminarCliente',
    ]);
    api.clientes.and.returnValue(of(CLIENTES));
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['mostrar']);
    TestBed.configureTestingModule({
      imports: [ClientesComponent],
      providers: [
        { provide: ApiService, useValue: api },
        { provide: ToastService, useValue: toast },
      ],
    });
  });

  it('muestra los clientes que devuelve la API (FR4.1)', async () => {
    await crear();

    const encabezados = Array.from(raiz.querySelectorAll('th')).map((encabezado) => encabezado.textContent);
    expect(encabezados).toEqual(['Id', 'Razón social', 'Dirección', 'Contacto', 'Acciones']);
    expect(filas().length).toBe(3);
    expect(fila(2).textContent).toContain('Condominio Vista Mar');
    expect(fila(2).textContent).toContain('Malecón Grau 250');
    expect(fila(2).textContent).toContain('Luis Torres');
    expect(buscar(fila(2), 'clientes-editar').textContent).toContain('Editar');
    expect(buscar(fila(2), 'clientes-eliminar').textContent).toContain('Eliminar');
  });

  it('mientras carga, muestra las filas esqueleto (FR7.4)', async () => {
    const respuesta = new Subject<Cliente[]>();
    api.clientes.and.returnValue(respuesta);

    await crear();
    expect(buscarTodos(raiz, 'fila-esqueleto').length).toBe(5);

    respuesta.next(CLIENTES);
    await refrescar();
    expect(buscarTodos(raiz, 'fila-esqueleto').length).toBe(0);
    expect(filas().length).toBe(3);
  });

  it('la búsqueda filtra las filas sin volver a llamar a la API (FR4.2)', async () => {
    await crear();

    escribir(raiz, 'clientes-buscar', 'VISTA');
    await refrescar();
    expect(filas().length).toBe(1);
    expect(fila(2)).not.toBeNull();

    // También busca por dirección.
    escribir(raiz, 'clientes-buscar', 'arequipa');
    await refrescar();
    expect(filas().length).toBe(1);
    expect(fila(1)).not.toBeNull();

    escribir(raiz, 'clientes-buscar', '');
    await refrescar();
    expect(filas().length).toBe(3);
    expect(api.clientes).toHaveBeenCalledTimes(1);
  });

  it('crear llama a crearCliente y el cliente nuevo aparece en la tabla (FR4.3)', async () => {
    const nuevo: Cliente = {
      idCliente: 4,
      razonSocial: 'Centro Comercial Sur',
      direccion: 'Av. Los Héroes 500',
      contacto: 'Ana Ruiz',
    };
    api.crearCliente.and.returnValue(of(nuevo));
    await crear();

    // Cancelar cierra el modal sin llamar a la API.
    await pulsar('clientes-nuevo');
    expect(buscar(raiz, 'modal-titulo').textContent).toBe('Nuevo cliente');
    await pulsar('clientes-cancelar');
    expect(buscar(raiz, 'modal')).toBeNull();
    expect(api.crearCliente).not.toHaveBeenCalled();

    await pulsar('clientes-nuevo');
    escribir(raiz, 'clientes-razon-social', '  Centro Comercial Sur ');
    escribir(raiz, 'clientes-direccion', 'Av. Los Héroes 500');
    escribir(raiz, 'clientes-contacto', 'Ana Ruiz');
    await pulsar('clientes-guardar');

    expect(api.crearCliente).toHaveBeenCalledOnceWith({
      razonSocial: 'Centro Comercial Sur',
      direccion: 'Av. Los Héroes 500',
      contacto: 'Ana Ruiz',
    });
    expect(fila(4).textContent).toContain('Centro Comercial Sur');
    expect(filas().length).toBe(4);
    expect(buscar(raiz, 'modal')).toBeNull();
  });

  it('editar llama a editarCliente y la fila muestra los datos nuevos (FR4.4)', async () => {
    api.editarCliente.and.returnValue(of({ ...CLIENTES[1], razonSocial: 'Condominio Vista Mar II' }));
    await crear();

    await pulsar('clientes-editar', fila(2));
    expect(buscar(raiz, 'modal-titulo').textContent).toBe('Editar cliente');
    expect(campo('clientes-razon-social').value).toBe('Condominio Vista Mar');
    expect(campo('clientes-direccion').value).toBe('Malecón Grau 250');
    expect(campo('clientes-contacto').value).toBe('Luis Torres');

    escribir(raiz, 'clientes-razon-social', 'Condominio Vista Mar II');
    await pulsar('clientes-guardar');

    expect(api.editarCliente).toHaveBeenCalledOnceWith(2, {
      razonSocial: 'Condominio Vista Mar II',
      direccion: 'Malecón Grau 250',
      contacto: 'Luis Torres',
    });
    expect(fila(2).textContent).toContain('Condominio Vista Mar II');
    expect(filas().length).toBe(3);
    expect(buscar(raiz, 'modal')).toBeNull();
  });

  it('con un obligatorio vacío o con solo espacios, marca el campo y no llama a la API (FR4.5, A5)', async () => {
    await crear();

    await pulsar('clientes-nuevo');
    escribir(raiz, 'clientes-direccion', '   ');
    escribir(raiz, 'clientes-contacto', 'Ana Ruiz');
    await pulsar('clientes-guardar');

    expect(campo('clientes-razon-social').classList).toContain('invalido');
    expect(campo('clientes-direccion').classList).toContain('invalido');
    expect(campo('clientes-contacto').classList).not.toContain('invalido');
    expect(api.crearCliente).not.toHaveBeenCalled();
    expect(buscar(raiz, 'modal')).not.toBeNull();
  });

  it('eliminar pide confirmación con "¿Eliminar a {razón social}?"; al confirmar llama a eliminarCliente y quita la fila; al cancelar no llama (FR4.6)', async () => {
    api.eliminarCliente.and.returnValue(of(undefined));
    await crear();

    await pulsar('clientes-eliminar', fila(2));
    expect(buscar(raiz, 'clientes-confirmacion').textContent).toBe('¿Eliminar a Condominio Vista Mar?');
    await pulsar('clientes-cancelar-eliminar');
    expect(api.eliminarCliente).not.toHaveBeenCalled();
    expect(buscar(raiz, 'clientes-confirmacion')).toBeNull();
    expect(fila(2)).not.toBeNull();

    await pulsar('clientes-eliminar', fila(2));
    await pulsar('clientes-confirmar-eliminar');
    expect(api.eliminarCliente).toHaveBeenCalledOnceWith(2);
    expect(fila(2)).toBeNull();
    expect(filas().length).toBe(2);
  });

  it('con 409, muestra el mensaje de la API y el cliente sigue en la tabla (FR4.7, FR7.2)', async () => {
    const mensaje = 'No se puede eliminar: tiene registros relacionados';
    api.eliminarCliente.and.returnValue(throwError(() => errorDeApi(409, mensaje)));
    await crear();

    await pulsar('clientes-eliminar', fila(1));
    await pulsar('clientes-confirmar-eliminar');

    expect(toast.mostrar).toHaveBeenCalledOnceWith(mensaje);
    expect(fila(1)).not.toBeNull();
    expect(filas().length).toBe(3);
  });

  it('sin clientes, muestra "Aún no hay clientes. Crea el primero" (FR4.8)', async () => {
    api.clientes.and.returnValue(of([]));

    await crear();

    expect(buscar(raiz, 'clientes-vacio').textContent).toContain('Aún no hay clientes. Crea el primero');
    expect(buscar(raiz, 'clientes-vacio').querySelector('svg')).not.toBeNull();
    expect(filas().length).toBe(0);
  });
});
