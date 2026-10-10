import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { SesionService } from '../core/sesion.service';

interface OpcionMenu {
  id: string;
  etiqueta: string;
  /** Sin ruta, la opción aparece desactivada con la etiqueta "Próximamente". */
  ruta: string | null;
}

/** Opciones del menú lateral, en el orden pedido. */
const OPCIONES: OpcionMenu[] = [
  { id: 'dashboard', etiqueta: 'Dashboard', ruta: '/dashboard' },
  { id: 'clientes', etiqueta: 'Clientes', ruta: '/clientes' },
  { id: 'equipos', etiqueta: 'Equipos', ruta: null },
  { id: 'tecnicos', etiqueta: 'Técnicos', ruta: null },
  { id: 'ordenes', etiqueta: 'Órdenes', ruta: null },
  { id: 'inspecciones', etiqueta: 'Inspecciones', ruta: '/inspecciones' },
];

/** Estructura general del portal: barra superior, menú lateral y contenido. */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent {
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);
  private readonly sesion = inject(SesionService);

  readonly opciones = OPCIONES;
  readonly nombreUsuario = this.sesion.leer()?.nombre ?? '';
  /** Solo importa en pantallas de menos de 768 px, donde el menú empieza oculto. */
  readonly menuAbierto = signal(false);

  /** Título de la pantalla activa, tomado de los datos de su ruta. */
  get titulo(): string {
    return this.ruta.firstChild?.snapshot?.data?.['titulo'] ?? '';
  }

  cerrarSesion(): void {
    this.sesion.cerrar();
    this.router.navigate(['/login']);
  }
}
