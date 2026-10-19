import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { OrdenTecnico, ResumenOrdenes, Tecnico } from '../../core/modelos';
import { ToastService } from '../../core/toast.service';
import { ModalComponent } from '../../shared/modal/modal.component';

interface CeldaCalendario {
  fecha: Date | null;
  numeroDia: number | null;
  esHoy: boolean;
  ordenes: OrdenTecnico[];
}

@Component({
  selector: 'app-ordenes',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './ordenes.component.html',
  styleUrls: ['./ordenes.component.css']
})
export class OrdenesComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);

  ordenes: OrdenTecnico[] = [];
  tecnicos: Tecnico[] = [];
  resumen: ResumenOrdenes = { pendientes: 0, enProceso: 0, completadas: 0 };
  cargando = true;

  // Filtros Avanzados Multicriterio
  filtroTexto = '';
  filtroTecnico = '';
  filtroEstado = '';
  filtroFechaDesde = '';
  filtroFechaHasta = '';

  // Paginación
  paginaActual = 1;
  registrosPorPagina = 10;

  // Alternador de Vista (Tabla vs Calendario)
  vistaCalendario = false;

  // Modal de Detalle de Orden
  modalDetalleAbierto = false;
  ordenSeleccionada: OrdenTecnico | null = null;
  nombreTecnicoSeleccionado = '';

  // Control de Calendario Mensual
  fechaActualCalendario = new Date();
  readonly diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  ngOnInit(): void {
    this.cargarResumen();
    this.cargarDatosIniciales();
  }

  cargarResumen(): void {
    this.api.obtenerResumenOrdenes().subscribe({
      next: (data) => this.resumen = data,
      error: () => this.toast.mostrar('Error al cargar el resumen de órdenes')
    });
  }

  cargarDatosIniciales(): void {
    this.cargando = true;
    this.api.obtenerTecnicos().subscribe({
      next: (data) => {
        this.tecnicos = data;
        this.cargarTodasLasOrdenes(data);
      },
      error: () => {
        this.cargando = false;
        this.toast.mostrar('Error al cargar técnicos');
      }
    });
  }

  cargarTodasLasOrdenes(listaTecnicos: Tecnico[]): void {
    if (listaTecnicos.length === 0) {
      this.ordenes = [];
      this.cargando = false;
      return;
    }

    let completadas = 0;
    const acumuladas: OrdenTecnico[] = [];

    listaTecnicos.forEach(tec => {
      this.api.obtenerOrdenesDelTecnico(tec.idTecnico).subscribe({
        next: (ords) => {
          ords.forEach(o => {
            // Guardamos el id del técnico en la orden para identificarlo fácilmente
            (o as any)._idTecnico = tec.idTecnico;
            (o as any)._nombreTecnico = tec.nombre;

            if (!acumuladas.some(x => x.idOrden === o.idOrden)) {
              acumuladas.push(o);
            }
          });
          completadas++;
          if (completadas === listaTecnicos.length) {
            this.ordenes = acumuladas;
            this.cargando = false;
          }
        },
        error: () => {
          completadas++;
          if (completadas === listaTecnicos.length) {
            this.ordenes = acumuladas;
            this.cargando = false;
          }
        }
      });
    });
  }

  onCambioTecnicoCombo(valor: string): void {
    if (!valor) {
      this.cargarDatosIniciales();
    } else {
      const id = parseInt(valor, 10);
      if (!isNaN(id)) {
        this.cargando = true;
        const tecEncontrado = this.tecnicos.find(t => t.idTecnico === id);
        this.api.obtenerOrdenesDelTecnico(id).subscribe({
          next: (data) => {
            this.ordenes = data.map(o => ({
              ...o,
              _idTecnico: id,
              _nombreTecnico: tecEncontrado?.nombre || 'Técnico Asignado'
            } as any));
            this.cargando = false;
          },
          error: () => {
            this.ordenes = [];
            this.cargando = false;
          }
        });
      }
    }
  }

  limpiarFiltros(): void {
    this.filtroTexto = '';
    this.filtroTecnico = '';
    this.filtroEstado = '';
    this.filtroFechaDesde = '';
    this.filtroFechaHasta = '';
    this.paginaActual = 1;
    this.cargarDatosIniciales();
  }

  abrirDetalleOrden(orden: OrdenTecnico): void {
    this.ordenSeleccionada = orden;
    this.nombreTecnicoSeleccionado = (orden as any)._nombreTecnico || this.tecnicos.find(t => t.idTecnico === Number(this.filtroTecnico))?.nombre || 'Técnico Asignado';
    this.modalDetalleAbierto = true;
  }

  cerrarDetalleOrden(): void {
    this.modalDetalleAbierto = false;
    this.ordenSeleccionada = null;
    this.nombreTecnicoSeleccionado = '';
  }

  get ordenesFiltradas(): OrdenTecnico[] {
    return this.ordenes.filter(ord => {
      const texto = this.filtroTexto.trim().toLowerCase();
      const coincideTexto = !texto || 
        ord.cliente.toLowerCase().includes(texto) ||
        ord.equipoTipo.toLowerCase().includes(texto) ||
        ord.equipoCodigo.toLowerCase().includes(texto) ||
        (ord.ubicacion && ord.ubicacion.toLowerCase().includes(texto));

      const coincideEstado = !this.filtroEstado || ord.estado === this.filtroEstado;

      let coincideFecha = true;
      if (ord.fechaProgramada) {
        const fechaOrd = new Date(ord.fechaProgramada).toISOString().slice(0, 10);
        if (this.filtroFechaDesde && fechaOrd < this.filtroFechaDesde) coincideFecha = false;
        if (this.filtroFechaHasta && fechaOrd > this.filtroFechaHasta) coincideFecha = false;
      }

      return coincideTexto && coincideEstado && coincideFecha;
    });
  }

  get ordenesPaginadas(): OrdenTecnico[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.ordenesFiltradas.slice(inicio, inicio + this.registrosPorPagina);
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.ordenesFiltradas.length / this.registrosPorPagina));
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

  get nombreMesAnio(): string {
    const opciones: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
    const nombre = this.fechaActualCalendario.toLocaleDateString('es-ES', opciones);
    return nombre.charAt(0).toUpperCase() + nombre.slice(1);
  }

  cambiarMes(delta: number): void {
    const anio = this.fechaActualCalendario.getFullYear();
    const mes = this.fechaActualCalendario.getMonth();
    this.fechaActualCalendario = new Date(anio, mes + delta, 1);
  }

  irAHoy(): void {
    this.fechaActualCalendario = new Date();
  }

  get celdasCalendario(): CeldaCalendario[] {
    const anio = this.fechaActualCalendario.getFullYear();
    const mes = this.fechaActualCalendario.getMonth();
    
    const primerDiaMes = new Date(anio, mes, 1);
    const ultimoDiaMes = new Date(anio, mes + 1, 0);
    
    let diaSemanaInicio = primerDiaMes.getDay() - 1;
    if (diaSemanaInicio === -1) diaSemanaInicio = 6;

    const totalDias = ultimoDiaMes.getDate();
    const hoyStr = new Date().toISOString().slice(0, 10);

    const celdas: CeldaCalendario[] = [];

    for (let i = 0; i < diaSemanaInicio; i++) {
      celdas.push({ fecha: null, numeroDia: null, esHoy: false, ordenes: [] });
    }

    for (let dia = 1; dia <= totalDias; dia++) {
      const fechaActual = new Date(anio, mes, dia);
      const fechaStr = fechaActual.toISOString().slice(0, 10);
      const esHoy = fechaStr === hoyStr;

      const ordenesDelDia = this.ordenesFiltradas.filter(ord => {
        if (!ord.fechaProgramada) return false;
        const ordFechaStr = new Date(ord.fechaProgramada).toISOString().slice(0, 10);
        return ordFechaStr === fechaStr;
      });

      celdas.push({
        fecha: fechaActual,
        numeroDia: dia,
        esHoy,
        ordenes: ordenesDelDia
      });
    }

    while (celdas.length % 7 !== 0) {
      celdas.push({ fecha: null, numeroDia: null, esHoy: false, ordenes: [] });
    }

    return celdas;
  }

  exportarCSV(): void {
    const datos = this.ordenesFiltradas;
    if (datos.length === 0) {
      this.toast.mostrar('No hay órdenes para exportar.');
      return;
    }

    const encabezados = ['Id', 'Cliente', 'Equipo', 'Ubicacion', 'Fecha Programada', 'Estado'];
    const filas = datos.map(o => [
      o.idOrden,
      `"${(o.cliente || '').replace(/"/g, '""')}"`,
      `"${(o.equipoTipo + ' - ' + o.equipoCodigo).replace(/"/g, '""')}"`,
      `"${(o.ubicacion || '').replace(/"/g, '""')}"`,
      o.fechaProgramada,
      o.estado
    ]);

    const csvContent = [encabezados.join(','), ...filas.map(f => f.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const enlace = document.createElement('a');
    enlace.setAttribute('href', url);
    enlace.setAttribute('download', `reporte_ordenes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
  }
}