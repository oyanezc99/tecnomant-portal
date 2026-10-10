import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { environment } from '../../../environments/environment';
import { ApiService } from '../../core/api.service';
import { esErrorDeConexion, mensajeDeError } from '../../core/errores';
import { FechaHoraPipe } from '../../core/fecha-hora.pipe';
import { Evidencia, InspeccionDetalle } from '../../core/modelos';
import { ToastService } from '../../core/toast.service';
import { BadgeComponent } from '../../shared/badge/badge.component';
import { ErrorConexionComponent } from '../../shared/error-conexion/error-conexion.component';
import { FilasEsqueletoComponent } from '../../shared/filas-esqueleto/filas-esqueleto.component';

/** Detalle de una inspección: cabecera, observaciones, ítems del checklist y fotos. */
@Component({
  selector: 'app-inspeccion-detalle',
  standalone: true,
  imports: [BadgeComponent, ErrorConexionComponent, FilasEsqueletoComponent, FechaHoraPipe],
  templateUrl: './inspeccion-detalle.component.html',
  styleUrl: './inspeccion-detalle.component.css',
  host: { class: 'pagina' },
})
export class InspeccionDetalleComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

  /** `null` mientras carga o si la carga falló. */
  readonly inspeccion = signal<InspeccionDetalle | null>(null);
  readonly errorCarga = signal<string | null>(null);
  /** Dirección de la foto que se ve ampliada, o `null` si no hay ninguna abierta. */
  readonly fotoAmpliada = signal<string | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.errorCarga.set(null);
    this.api.inspeccion(this.id).subscribe({
      next: (inspeccion) => this.inspeccion.set(inspeccion),
      error: (error: unknown) => {
        // Si la inspección no existe (404), el mensaje de la API va en un toast (A12).
        this.errorCarga.set(mensajeDeError(error));
        if (!esErrorDeConexion(error)) {
          this.toast.mostrar(mensajeDeError(error));
        }
      },
    });
  }

  /** La API envía la ruta de cada foto relativa a su dirección base (FR6.5). */
  urlFoto(evidencia: Evidencia): string {
    return environment.apiUrl + evidencia.url;
  }

  @HostListener('document:keydown.escape')
  cerrarFoto(): void {
    this.fotoAmpliada.set(null);
  }

  volver(): void {
    this.router.navigate(['/inspecciones']);
  }
}
