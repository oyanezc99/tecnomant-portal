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

interface DiaMes {
  diaNumero: number;
  etiqueta: string;
  completadas: number;
  pendientes: number;
}

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

  /** Exponer Math para usarlo directamente en las expresiones del HTML */
  readonly Math = Math;

  /** Tarjetas del resumen; `valor` es el número que se ve mientras sube. */
  readonly tarjetas = [
    { id: 'pendientes', titulo: 'Pendientes', valor: signal(0) },
    { id: 'en-proceso', titulo: 'En proceso', valor: signal(0) },
    { id: 'completadas', titulo: 'Completadas', valor: signal(0) },
  ];
  readonly ultimas = signal<Inspeccion[]>([]);
  readonly cargando = signal(true);
  readonly errorCarga = signal<string | null>(null);

  /** Rendimiento mensual conectado dinámicamente a las inspecciones reales del mes actual */
  readonly rendimientoMensual = signal<DiaMes[]>([]);

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
        
        // Procesar las inspecciones reales para alimentar el gráfico mensual de principio a fin de mes
        this.procesarRendimientoMensual(inspecciones);

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

  private procesarRendimientoMensual(inspecciones: Inspeccion[]): void {
    const ahora = new Date();
    const anio = ahora.getFullYear();
    const mes = ahora.getMonth(); // 0-11
    
    // Obtener el total de días del mes actual (ej. 31 para octubre)
    const totalDias = new Date(anio, mes + 1, 0).getDate();

    // Inicializar mapa de días del mes (1 hasta totalDias)
    const diasMap: { [key: number]: { completadas: number; pendientes: number } } = {};
    for (let d = 1; d <= totalDias; d++) {
      diasMap[d] = { completadas: 0, pendientes: 0 };
    }

    inspecciones.forEach((insp) => {
      if (insp.fechaHoraReal) {
        const fechaStr = insp.fechaHoraReal.toString();
        const fecha = new Date(fechaStr.includes('T') ? fechaStr : fechaStr.replace(' ', 'T'));
        
        if (!isNaN(fecha.getTime()) && fecha.getFullYear() === anio && fecha.getMonth() === mes) {
          const diaNum = fecha.getDate();
          if (diasMap[diaNum]) {
            const estado = (insp.estadoGeneral || '').toLowerCase();
            if (estado.includes('completado') || estado.includes('completada') || estado.includes('bien')) {
              diasMap[diaNum].completadas++;
            } else {
              diasMap[diaNum].pendientes++;
            }
          }
        }
      }
    });

    // Construir el array completo del mes
    const datosMensuales: DiaMes[] = [];
    for (let d = 1; d <= totalDias; d++) {
      datosMensuales.push({
        diaNumero: d,
        etiqueta: d.toString(),
        completadas: diasMap[d].completadas,
        pendientes: diasMap[d].pendientes,
      });
    }

    this.rendimientoMensual.set(datosMensuales);
  }

  abrir(idInspeccion: number): void {
    this.router.navigate(['/inspecciones', idInspeccion]);
  }

  private detenerConteos(): void {
    this.cancelarConteos.forEach((cancelar) => cancelar());
    this.cancelarConteos = [];
  }
}