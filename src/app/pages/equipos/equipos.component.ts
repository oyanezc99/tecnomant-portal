import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Equipo, DatosEquipo, Cliente, Inspeccion } from '../../core/modelos';
import { ToastService } from '../../core/toast.service';
import { ModalComponent } from '../../shared/modal/modal.component';

@Component({
  selector: 'app-equipos',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './equipos.component.html',
  styleUrls: ['./equipos.component.css']
})
export class EquiposComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);

  equipos: Equipo[] = [];
  clientes: Cliente[] = [];
  cargando = true;
  
  // Filtros avanzados
  filtroTexto = '';
  filtroTipo = '';
  filtroCliente = '';

  // Paginación
  paginaActual = 1;
  registrosPorPagina = 10;

  // Control del Modal (Crear / Editar)
  modalAbierto = false;
  editando = false;
  equipoActualId: number | null = null;

  // Control del Modal de Historial
  modalHistorialAbierto = false;
  equipoSeleccionado: Equipo | null = null;
  historialOrdenes: any[] = [];
  historialInspecciones: Inspeccion[] = [];
  cargandoHistorial = false;

  formulario: DatosEquipo = {
    idCliente: 0,
    tipo: '',
    codigoSerie: '',
    ubicacion: ''
  };

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.api.obtenerEquipos().subscribe({
      next: (data) => {
        this.equipos = data;
        this.cargando = false;
      },
      error: () => {
        this.toast.mostrar('Error al cargar los equipos');
        this.cargando = false;
      }
    });

    this.api.clientes().subscribe({
      next: (data) => {
        this.clientes = data;
      }
    });
  }

  get tiposDisponibles(): string[] {
    const tipos = this.equipos.map(e => e.tipo);
    return Array.from(new Set(tipos)).filter(t => t);
  }

  get equiposFiltrados(): Equipo[] {
    return this.equipos.filter(e => {
      const texto = this.filtroTexto.trim().toLowerCase();
      
      const coincideTexto = !texto || 
        e.tipo.toLowerCase().includes(texto) ||
        e.codigoSerie.toLowerCase().includes(texto) ||
        e.ubicacion.toLowerCase().includes(texto) ||
        (e.cliente && e.cliente.toLowerCase().includes(texto));

      const coincideTipo = !this.filtroTipo || e.tipo === this.filtroTipo;
      const coincideCliente = !this.filtroCliente || e.idCliente.toString() === this.filtroCliente;

      return coincideTexto && coincideTipo && coincideCliente;
    });
  }

  get equiposPaginados(): Equipo[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.equiposFiltrados.slice(inicio, inicio + this.registrosPorPagina);
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.equiposFiltrados.length / this.registrosPorPagina));
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

  actualizarFiltros(): void {
    this.paginaActual = 1;
  }

  exportarCSV(): void {
    const datos = this.equiposFiltrados;
    if (datos.length === 0) {
      this.toast.mostrar('No hay equipos para exportar.');
      return;
    }

    const encabezados = ['Id', 'Tipo', 'Codigo / Serie', 'Ubicacion', 'Cliente'];
    const filas = datos.map(e => [
      e.idEquipo,
      `"${(e.tipo || '').replace(/"/g, '""')}"`,
      `"${(e.codigoSerie || '').replace(/"/g, '""')}"`,
      `"${(e.ubicacion || '').replace(/"/g, '""')}"`,
      `"${(e.cliente || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [encabezados.join(','), ...filas.map(f => f.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const enlace = document.createElement('a');
    enlace.setAttribute('href', url);
    enlace.setAttribute('download', `reporte_equipos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
  }

  abrirHistorial(equipo: Equipo): void {
    this.equipoSeleccionado = equipo;
    this.modalHistorialAbierto = true;
    this.cargandoHistorial = true;

    // Cargar inspecciones y filtrar por coincidencia de equipo (código o ID)
    this.api.ordenes(equipo.idEquipo).subscribe({ next: ordenes => this.historialOrdenes = ordenes, error: error => this.toast.mostrar('No se pudieron cargar las órdenes del equipo') });
    this.historialOrdenes = [];
    this.api.inspecciones(equipo.idEquipo).subscribe({
      next: (inspecciones: Inspeccion[]) => {
        this.historialInspecciones = inspecciones;
        this.cargandoHistorial = false;
      },
      error: () => {
        this.cargandoHistorial = false;
      }
    });
  }

  cerrarHistorial(): void {
    this.modalHistorialAbierto = false;
    this.equipoSeleccionado = null;
  }

  abrirModalCrear(): void {
    this.editando = false;
    this.equipoActualId = null;
    this.formulario = { idCliente: this.clientes[0]?.idCliente || 0, tipo: '', codigoSerie: '', ubicacion: '' };
    this.modalAbierto = true;
  }

  abrirModalEditar(equipo: Equipo, event: Event): void {
    event.stopPropagation();
    this.editando = true;
    this.equipoActualId = equipo.idEquipo;
    this.formulario = {
      idCliente: equipo.idCliente,
      tipo: equipo.tipo,
      codigoSerie: equipo.codigoSerie,
      ubicacion: equipo.ubicacion
    };
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
  }

  guardar(): void {
    if (!this.formulario.tipo || !this.formulario.codigoSerie || !this.formulario.idCliente) {
      this.toast.mostrar('Completa los campos obligatorios y selecciona un cliente.');
      return;
    }

    if (this.editando && this.equipoActualId !== null) {
      this.api.actualizarEquipo(this.equipoActualId, { ...this.formulario, idCliente: Number(this.formulario.idCliente) }).subscribe({
        next: () => {
          this.toast.mostrar('Equipo actualizado correctamente');
          this.cerrarModal();
          this.cargarDatos();
        },
        error: () => this.toast.mostrar('Error al actualizar el equipo')
      });
    } else {
      this.api.crearEquipo({ ...this.formulario, idCliente: Number(this.formulario.idCliente) }).subscribe({
        next: () => {
          this.toast.mostrar('Equipo creado correctamente');
          this.cerrarModal();
          this.cargarDatos();
        },
        error: () => this.toast.mostrar('Error al crear el equipo')
      });
    }
  }

  eliminar(id: number, event: Event): void {
    event.stopPropagation();
    if (confirm('¿Estás seguro de que deseas eliminar este equipo?')) {
      this.api.eliminarEquipo(id).subscribe({
        next: () => {
          this.toast.mostrar('Equipo eliminado');
          this.cargarDatos();
        },
        error: () => this.toast.mostrar('No se pudo eliminar el equipo')
      });
    }
  }
}
