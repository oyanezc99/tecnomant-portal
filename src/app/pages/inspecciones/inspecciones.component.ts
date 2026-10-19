import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../core/api.service';
import { esErrorDeConexion, mensajeDeError } from '../../core/errores';
import { FechaHoraPipe } from '../../core/fecha-hora.pipe';
import { Inspeccion } from '../../core/modelos';
import { ToastService } from '../../core/toast.service';
import { BadgeComponent } from '../../shared/badge/badge.component';
import { ErrorConexionComponent } from '../../shared/error-conexion/error-conexion.component';
import { FilasEsqueletoComponent } from '../../shared/filas-esqueleto/filas-esqueleto.component';

/** Listado de inspecciones, con filtro en pantalla por estado general, paginación y exportación CSV. */
@Component({
  selector: 'app-inspecciones',
  standalone: true,
  imports: [CommonModule, FormsModule, BadgeComponent, ErrorConexionComponent, FilasEsqueletoComponent, FechaHoraPipe],
  templateUrl: './inspecciones.component.html',
  styleUrl: './inspecciones.component.css',
  host: { class: 'pagina' },
})
export class InspeccionesComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  /** Opciones del selector de estado general (A7). */
  readonly opciones = ['Todos', 'Bien', 'Regular', 'Malo'];
  readonly estado = signal('Todos');
  readonly inspecciones = signal<Inspeccion[]>([]);
  readonly cargando = signal(true);
  readonly errorCarga = signal<string | null>(null);

  /** Estados para Paginación */
  readonly paginaActual = signal(1);
  readonly registrosPorPagina = signal(10);

  /** Inspecciones del estado elegido, en el orden en que las envía la API. */
  readonly filtradas = computed(() =>
    this.estado() === 'Todos'
      ? this.inspecciones()
      : this.inspecciones().filter((inspeccion) => inspeccion.estadoGeneral === this.estado()),
  );

  /** Inspecciones recortadas para la página actual */
  readonly paginadas = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.registrosPorPagina();
    return this.filtradas().slice(inicio, inicio + this.registrosPorPagina());
  });

  readonly totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.filtradas().length / this.registrosPorPagina()))
  );

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);
    this.api.inspecciones().subscribe({
      next: (inspecciones) => {
        this.inspecciones.set(inspecciones);
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.cargando.set(false);
        this.errorCarga.set(mensajeDeError(error));
        if (!esErrorDeConexion(error)) {
          this.toast.mostrar(mensajeDeError(error));
        }
      },
    });
  }

  cambiarEstado(nuevoEstado: string): void {
    this.estado.set(nuevoEstado);
    this.paginaActual.set(1);
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas()) {
      this.paginaActual.set(nuevaPagina);
    }
  }

  cambiarRegistrosPorPagina(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.registrosPorPagina.set(Number(select.value));
    this.paginaActual.set(1);
  }

  exportarCSV(): void {
    const datos = this.filtradas();
    if (datos.length === 0) {
      this.toast.mostrar('No hay inspecciones para exportar.');
      return;
    }

    const encabezados = ['Fecha', 'Cliente', 'Equipo', 'Tecnico', 'Estado General'];
    const filas = datos.map(i => [
      `"${(i.fechaHoraReal || '')}"`,
      `"${(i.cliente || '').replace(/"/g, '""')}"`,
      `"${(i.equipoTipo + ' - ' + i.equipoCodigo).replace(/"/g, '""')}"`,
      `"${(i.tecnico || '').replace(/"/g, '""')}"`,
      `"${(i.estadoGeneral || '')}"`
    ]);

    const csvContent = [encabezados.join(','), ...filas.map(f => f.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const enlace = document.createElement('a');
    enlace.setAttribute('href', url);
    enlace.setAttribute('download', `reporte_inspecciones_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
  }

  abrir(idInspeccion: number): void {
    this.router.navigate(['/inspecciones', idInspeccion]);
  }
}