import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { esErrorDeConexion, mensajeDeError } from '../../core/errores';
import { FechaHoraPipe } from '../../core/fecha-hora.pipe';
import { Inspeccion } from '../../core/modelos';
import { ToastService } from '../../core/toast.service';
import { BadgeComponent } from '../../shared/badge/badge.component';
import { ErrorConexionComponent } from '../../shared/error-conexion/error-conexion.component';
import { FilasEsqueletoComponent } from '../../shared/filas-esqueleto/filas-esqueleto.component';

/** Listado de inspecciones, con filtro en pantalla por estado general. */
@Component({
  selector: 'app-inspecciones',
  standalone: true,
  imports: [BadgeComponent, ErrorConexionComponent, FilasEsqueletoComponent, FechaHoraPipe],
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

  /** Inspecciones del estado elegido, en el orden en que las envía la API. */
  readonly filtradas = computed(() =>
    this.estado() === 'Todos'
      ? this.inspecciones()
      : this.inspecciones().filter((inspeccion) => inspeccion.estadoGeneral === this.estado()),
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

  abrir(idInspeccion: number): void {
    this.router.navigate(['/inspecciones', idInspeccion]);
  }
}
