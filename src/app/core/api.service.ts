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
  Equipo,
  DatosEquipo,
  Tecnico,
  DatosTecnico,
  OrdenTecnico,
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

  // ==================== EQUIPOS ====================

  /** Lista todos los equipos registrados. */
  obtenerEquipos(): Observable<Equipo[]> {
    return this.http.get<Equipo[]>(`${this.base}/api/equipos`);
  }

  /** Obtiene un equipo por su ID. */
  obtenerEquipo(id: number): Observable<Equipo> {
    return this.http.get<Equipo>(`${this.base}/api/equipos/${id}`);
  }

  /** Crea un nuevo equipo. */
  crearEquipo(datos: DatosEquipo): Observable<number> {
    return this.http.post<number>(`${this.base}/api/equipos`, datos);
  }

  /** Actualiza un equipo existente. */
  actualizarEquipo(id: number, datos: DatosEquipo): Observable<void> {
    return this.http.put<void>(`${this.base}/apiequipos/${id}`, datos);
  }

  /** Elimina un equipo por su ID. */
  eliminarEquipo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/api/equipos/${id}`);
  }

  obtenerTecnicos(): Observable<Tecnico[]> {
    return this.http.get<Tecnico[]>(`${this.base}/api/tecnicos`);
  }

  crearTecnico(datos: DatosTecnico): Observable<number> {
    return this.http.post<number>(`${this.base}/api/tecnicos`, datos);
  }

  actualizarTecnico(id: number, datos: DatosTecnico): Observable<void> {
    return this.http.put<void>(`${this.base}/api/tecnicos/${id}`, datos);
  }

  eliminarTecnico(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/api/tecnicos/${id}`);
  }

  obtenerOrdenesDelTecnico(idTecnico: number): Observable<OrdenTecnico[]> {
    return this.http.get<OrdenTecnico[]>(`${this.base}/api/ordenes/tecnico/${idTecnico}`);
  }

  obtenerResumenOrdenes(): Observable<ResumenOrdenes> {
    return this.http.get<ResumenOrdenes>(`${this.base}/api/ordenes/resumen`);
  }
}
