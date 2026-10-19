import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Tecnico, DatosTecnico, Inspeccion } from '../../core/modelos';
import { ToastService } from '../../core/toast.service';
import { ModalComponent } from '../../shared/modal/modal.component';
import { BadgeComponent } from '../../shared/badge/badge.component';

@Component({
  selector: 'app-tecnicos',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, BadgeComponent],
  templateUrl: './tecnicos.component.html',
  styleUrls: ['./tecnicos.component.css']
})
export class TecnicosComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);

  tecnicos: Tecnico[] = [];
  inspecciones: Inspeccion[] = [];
  cargando = true;
  filtroTexto = '';

  // Paginación
  paginaActual = 1;
  registrosPorPagina = 10;

  modalAbierto = false;
  editando = false;
  tecnicoActualId: number | null = null;

  // Modal de perfil / carga operativa del técnico
  modalPerfilAbierto = false;
  tecnicoSeleccionado: Tecnico | null = null;
  inspeccionesTecnico: Inspeccion[] = [];
  cargandoPerfil = false;

  formulario: DatosTecnico = {
    nombre: '',
    dni: '',
    especialidad: '',
    usuario: '',
    clave: ''
  };

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.api.obtenerTecnicos().subscribe({
      next: (data) => {
        this.tecnicos = data;
        this.api.inspecciones().subscribe({
          next: (insp) => {
            this.inspecciones = insp;
            this.cargando = false;
          },
          error: () => {
            this.cargando = false;
          }
        });
      },
      error: () => {
        this.toast.mostrar('Error al cargar los técnicos');
        this.cargando = false;
      }
    });
  }

  /** Calcula el número de inspecciones activas o pendientes para un técnico */
  obtenerCargaTrabajo(nombreTecnico: string): { texto: string; tipo: 'exito' | 'pendiente' | 'proceso' } {
    const asignadas = this.inspecciones.filter(i => i.tecnico?.toLowerCase() === nombreTecnico.toLowerCase());
    const pendientes = asignadas.filter(i => !i.estadoGeneral?.toLowerCase().includes('completado')).length;

    if (pendientes === 0) {
      return { texto: 'Disponible (0 activas)', tipo: 'exito' };
    } else if (pendientes <= 2) {
      return { texto: `En ruta (${pendientes} activas)`, tipo: 'proceso' };
    } else {
      return { texto: `Ocupado (${pendientes} activas)`, tipo: 'pendiente' };
    }
  }

  get tecnicosFiltrados(): Tecnico[] {
    if (!this.filtroTexto.trim()) return this.tecnicos;
    const texto = this.filtroTexto.toLowerCase();
    return this.tecnicos.filter(t => 
      t.nombre.toLowerCase().includes(texto) ||
      t.dni.toLowerCase().includes(texto) ||
      t.especialidad.toLowerCase().includes(texto) ||
      t.usuario.toLowerCase().includes(texto)
    );
  }

  get tecnicosPaginados(): Tecnico[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.tecnicosFiltrados.slice(inicio, inicio + this.registrosPorPagina);
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.tecnicosFiltrados.length / this.registrosPorPagina));
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
      this.paginaActual = nuevaPagina;
    }
  }

  cambiarRegistrosPorPagina(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.registrosPorPagina = Number(select.value);
    this.paginaActual = 1;
  }

  exportarCSV(): void {
    const datos = this.tecnicosFiltrados;
    if (datos.length === 0) {
      this.toast.mostrar('No hay técnicos para exportar.');
      return;
    }

    const encabezados = ['Id', 'Nombre', 'DNI', 'Especialidad', 'Usuario'];
    const filas = datos.map(t => [
      t.idTecnico,
      `"${(t.nombre || '').replace(/"/g, '""')}"`,
      `"${(t.dni || '').replace(/"/g, '""')}"`,
      `"${(t.especialidad || '').replace(/"/g, '""')}"`,
      `"${(t.usuario || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [encabezados.join(','), ...filas.map(f => f.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const enlace = document.createElement('a');
    enlace.setAttribute('href', url);
    enlace.setAttribute('download', `reporte_tecnicos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
  }

  abrirPerfil(tecnico: Tecnico): void {
    this.tecnicoSeleccionado = tecnico;
    this.modalPerfilAbierto = true;
    this.inspeccionesTecnico = this.inspecciones.filter(i => i.tecnico?.toLowerCase() === tecnico.nombre.toLowerCase());
  }

  cerrarPerfil(): void {
    this.modalPerfilAbierto = false;
    this.tecnicoSeleccionado = null;
  }

  abrirModalCrear(): void {
    this.editando = false;
    this.tecnicoActualId = null;
    this.formulario = { nombre: '', dni: '', especialidad: '', usuario: '', clave: '' };
    this.modalAbierto = true;
  }

  abrirModalEditar(tecnico: Tecnico, event: Event): void {
    event.stopPropagation();
    this.editando = true;
    this.tecnicoActualId = tecnico.idTecnico;
    this.formulario = {
      nombre: tecnico.nombre,
      dni: tecnico.dni,
      especialidad: tecnico.especialidad,
      usuario: tecnico.usuario,
      clave: tecnico.clave
    };
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
  }

  guardar(): void {
    if (!this.formulario.nombre || !this.formulario.dni || !this.formulario.especialidad || !this.formulario.usuario || !this.formulario.clave) {
      this.toast.mostrar('Todos los campos son obligatorios.');
      return;
    }

    if (this.editando && this.tecnicoActualId !== null) {
      this.api.actualizarTecnico(this.tecnicoActualId, this.formulario).subscribe({
        next: () => {
          this.toast.mostrar('Técnico actualizado correctamente');
          this.cerrarModal();
          this.cargarDatos();
        },
        error: () => this.toast.mostrar('Error al actualizar el técnico')
      });
    } else {
      this.api.crearTecnico(this.formulario).subscribe({
        next: () => {
          this.toast.mostrar('Técnico creado correctamente');
          this.cerrarModal();
          this.cargarDatos();
        },
        error: () => this.toast.mostrar('Error al crear el técnico')
      });
    }
  }

  eliminar(id: number, event: Event): void {
    event.stopPropagation();
    if (confirm('¿Estás seguro de que deseas eliminar este técnico?')) {
      this.api.eliminarTecnico(id).subscribe({
        next: () => {
          this.toast.mostrar('Técnico eliminado');
          this.cargarDatos();
        },
        error: () => this.toast.mostrar('No se pudo eliminar el técnico')
      });
    }
  }
}