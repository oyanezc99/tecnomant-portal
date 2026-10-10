import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  Cliente,
  DatosCliente,
  Inspeccion,
  InspeccionDetalle,
  RespuestaLogin,
  ResumenOrdenes,
} from './modelos';

/** Todas las llamadas del portal a la API de TecnoMant. */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  login(usuario: string, clave: string): Observable<RespuestaLogin> {
    return this.http.post<RespuestaLogin>(`${this.base}/api/login`, { usuario, clave });
  }

  resumenOrdenes(): Observable<ResumenOrdenes> {
    return this.http.get<ResumenOrdenes>(`${this.base}/api/ordenes/resumen`);
  }

  /** Listado de inspecciones, la más reciente primero. */
  inspecciones(): Observable<Inspeccion[]> {
    return this.http.get<Inspeccion[]>(`${this.base}/api/inspecciones`);
  }

  inspeccion(id: number): Observable<InspeccionDetalle> {
    return this.http.get<InspeccionDetalle>(`${this.base}/api/inspecciones/${id}`);
  }

  clientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.base}/api/clientes`);
  }

  crearCliente(datos: DatosCliente): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.base}/api/clientes`, datos);
  }

  editarCliente(id: number, datos: DatosCliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.base}/api/clientes/${id}`, datos);
  }

  eliminarCliente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/api/clientes/${id}`);
  }
}
