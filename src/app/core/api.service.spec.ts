import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { DETALLE, INSPECCIONES, RESUMEN } from '../testing/datos-prueba';
import { ApiService } from './api.service';

describe('ApiService', () => {
  const base = environment.apiUrl;
  let api: ApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('login envía POST a apiUrl + /api/login con { usuario, clave } (FR1.2)', () => {
    api.login('usuario-de-prueba', 'clave-de-prueba').subscribe();

    const pedido = http.expectOne(`${base}/api/login`);
    expect(pedido.request.method).toBe('POST');
    expect(pedido.request.body).toEqual({ usuario: 'usuario-de-prueba', clave: 'clave-de-prueba' });
  });

  it('resumenOrdenes pide GET /api/ordenes/resumen (FR3.1)', () => {
    let recibido: unknown;
    api.resumenOrdenes().subscribe((resumen) => (recibido = resumen));

    const pedido = http.expectOne(`${base}/api/ordenes/resumen`);
    expect(pedido.request.method).toBe('GET');
    pedido.flush(RESUMEN);
    expect(recibido).toEqual(RESUMEN);
  });

  it('inspecciones pide GET /api/inspecciones (FR3.3, FR5.1)', () => {
    let recibido: unknown;
    api.inspecciones().subscribe((inspecciones) => (recibido = inspecciones));

    const pedido = http.expectOne(`${base}/api/inspecciones`);
    expect(pedido.request.method).toBe('GET');
    pedido.flush(INSPECCIONES);
    expect(recibido).toEqual(INSPECCIONES);
  });

  it('inspeccion(12) pide GET /api/inspecciones/12 (FR6.1)', () => {
    let recibido: unknown;
    api.inspeccion(12).subscribe((detalle) => (recibido = detalle));

    const pedido = http.expectOne(`${base}/api/inspecciones/12`);
    expect(pedido.request.method).toBe('GET');
    pedido.flush(DETALLE);
    expect(recibido).toEqual(DETALLE);
  });

  it('clientes, crearCliente, editarCliente y eliminarCliente usan GET, POST, PUT y DELETE sobre /api/clientes y /api/clientes/{id} (FR4.1, FR4.3, FR4.4, FR4.6)', () => {
    const datos = { razonSocial: 'Condominio Vista Mar', direccion: 'Malecón Grau 250', contacto: 'Luis Torres' };

    api.clientes().subscribe();
    expect(http.expectOne(`${base}/api/clientes`).request.method).toBe('GET');

    api.crearCliente(datos).subscribe();
    const alta = http.expectOne(`${base}/api/clientes`);
    expect(alta.request.method).toBe('POST');
    expect(alta.request.body).toEqual(datos);

    api.editarCliente(2, datos).subscribe();
    const edicion = http.expectOne(`${base}/api/clientes/2`);
    expect(edicion.request.method).toBe('PUT');
    expect(edicion.request.body).toEqual(datos);

    api.eliminarCliente(2).subscribe();
    expect(http.expectOne(`${base}/api/clientes/2`).request.method).toBe('DELETE');
  });
});
