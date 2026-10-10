import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { ApiService } from '../../core/api.service';
import { contarHasta } from '../../core/conteo';
import { esErrorDeConexion, mensajeDeError } from '../../core/errores';
import { FechaHoraPipe } from '../../core/fecha-hora.pipe';
import { Inspeccion } from '../../core/modelos';
import { ToastService } from '../../core/toast.service';
import { BadgeComponent } from '../../shared/badge/badge.component';
import { ErrorConexionComponent } from '../../shared/error-conexion/error-conexion.component';
import { FilasEsqueletoComponent } from '../../shared/filas-esqueleto/filas-esqueleto.component';

/** Dashboard: resumen de órdenes por estado y las últimas 5 inspecciones. */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [BadgeComponent, ErrorConexionComponent, FilasEsqueletoComponent, FechaHoraPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  host: { class: 'pagina' },
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  /** Tarjetas del resumen; `valor` es el número que se ve mientras sube. */
  readonly tarjetas = [
    { id: 'pendientes', titulo: 'Pendientes', valor: signal(0) },
    { id: 'en-proceso', titulo: 'En proceso', valor: signal(0) },
    { id: 'completadas', titulo: 'Completadas', valor: signal(0) },
  ];
  readonly ultimas = signal<Inspeccion[]>([]);
  readonly cargando = signal(true);
  readonly errorCarga = signal<string | null>(null);

  private cancelarConteos: Array<() => void> = [];

  ngOnInit(): void {
    this.cargar();
  }

  ngOnDestroy(): void {
    this.detenerConteos();
  }

  cargar(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);
    forkJoin({ resumen: this.api.resumenOrdenes(), inspecciones: this.api.inspecciones() }).subscribe({
      next: ({ resumen, inspecciones }) => {
        // La API envía la más reciente primero: las 5 primeras son las últimas.
        this.ultimas.set(inspecciones.slice(0, 5));
        this.cargando.set(false);
        this.detenerConteos();
        const valores = [resumen.pendientes, resumen.enProceso, resumen.completadas];
        this.cancelarConteos = this.tarjetas.map((tarjeta, indice) =>
          contarHasta(valores[indice], (valor) => tarjeta.valor.set(valor)),
        );
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

  private detenerConteos(): void {
    this.cancelarConteos.forEach((cancelar) => cancelar());
    this.cancelarConteos = [];
  }
}
