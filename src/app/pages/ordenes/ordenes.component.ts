import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { OrdenAdministrativa, OrdenTecnico, DatosOrden, ResumenOrdenes, Tecnico, Equipo } from '../../core/modelos';
import { mensajeDeError } from '../../core/errores';
import { ToastService } from '../../core/toast.service';
import { ModalComponent } from '../../shared/modal/modal.component';
interface CeldaCalendario { fecha: Date | null; numeroDia: number | null; esHoy: boolean; ordenes: OrdenAdministrativa[]; }
@Component({ selector: 'app-ordenes', standalone: true, imports: [CommonModule, FormsModule, ModalComponent], templateUrl: './ordenes.component.html', styleUrls: ['./ordenes.component.css'] })
export class OrdenesComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  ordenes: OrdenAdministrativa[] = [];
  tecnicos: Tecnico[] = [];
  equipos: Equipo[] = [];
  resumen: ResumenOrdenes = { pendientes: 0, enProceso: 0, completadas: 0 };
  cargando = true;
  errorCarga = '';
  filtroTexto = '';
  filtroTecnico = '';
  filtroEstado = '';
  filtroFechaDesde = '';
  filtroFechaHasta = '';
  paginaActual = 1;
  registrosPorPagina = 10;
  vistaCalendario = false;
  modalDetalleAbierto = false;
  ordenSeleccionada: OrdenAdministrativa | null = null;
  nombreTecnicoSeleccionado = '';
  modalFormulario = false;
  editandoId: number | null = null;
  guardando = false;
  formulario: DatosOrden = { idEquipo: 0, idTecnico: 0, fechaProgramada: '', estado: 'Pendiente' };
  fechaActualCalendario = new Date();
  readonly diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  ngOnInit(): void { this.cargarDatosIniciales(); }
  cargarDatosIniciales(): void {
    this.cargando = true;
    this.errorCarga = '';
    forkJoin({ ordenes: this.api.ordenes(), tecnicos: this.api.obtenerTecnicos(), equipos: this.api.obtenerEquipos(), resumen: this.api.resumenOrdenes() }).subscribe({
      next: datos => { Object.assign(this, datos); this.cargando = false; this.paginaActual = Math.min(this.paginaActual, this.totalPaginas); },
      error: error => { this.cargando = false; this.errorCarga = mensajeDeError(error); this.toast.mostrar(this.errorCarga); }
    });
  }
  onCambioTecnicoCombo(valor: string): void { this.filtroTecnico = valor; this.actualizarFiltros(); }
  limpiarFiltros(): void { this.filtroTexto = this.filtroTecnico = this.filtroEstado = this.filtroFechaDesde = this.filtroFechaHasta = ''; this.paginaActual = 1; }
  abrirDetalleOrden(orden: OrdenAdministrativa): void { this.ordenSeleccionada = orden; this.nombreTecnicoSeleccionado = orden.tecnico; this.modalDetalleAbierto = true; }
  cerrarDetalleOrden(): void { this.modalDetalleAbierto = false; this.ordenSeleccionada = null; }
  abrirFormulario(orden?: OrdenAdministrativa): void {
    this.editandoId = orden?.idOrden ?? null;
    this.formulario = { idEquipo: orden?.idEquipo ?? this.equipos[0]?.idEquipo ?? 0, idTecnico: orden?.idTecnico ?? this.tecnicos[0]?.idTecnico ?? 0, fechaProgramada: orden?.fechaProgramada.slice(0,16) ?? '', estado: orden?.estado ?? 'Pendiente' };
    this.modalDetalleAbierto = false;
    this.modalFormulario = true;
  }
  guardarOrden(): void {
    if (this.guardando) return;
    if (!this.formulario.idEquipo || !this.formulario.idTecnico || !this.formulario.fechaProgramada) { this.toast.mostrar('Selecciona equipo, técnico y fecha'); return; }
    this.guardando = true;
    const datos = { ...this.formulario, idEquipo: Number(this.formulario.idEquipo), idTecnico: Number(this.formulario.idTecnico) };
    const llamada: Observable<unknown> = this.editandoId === null ? this.api.crearOrden(datos) : this.api.editarOrden(this.editandoId, datos);
    llamada.subscribe({ next: () => { this.guardando = false; this.modalFormulario = false; this.toast.mostrar('Orden guardada'); this.cargarDatosIniciales(); }, error: error => { this.guardando = false; this.toast.mostrar(mensajeDeError(error)); } });
  }
  eliminarOrden(orden: OrdenAdministrativa): void {
    if (!confirm('¿Eliminar la orden #' + orden.idOrden + '?')) return;
    this.api.eliminarOrden(orden.idOrden).subscribe({ next: () => { this.cerrarDetalleOrden(); this.toast.mostrar('Orden eliminada'); this.cargarDatosIniciales(); }, error: error => this.toast.mostrar(mensajeDeError(error)) });
  }
  get ordenesFiltradas(): OrdenAdministrativa[] {
    const texto = this.filtroTexto.trim().toLowerCase();
    return this.ordenes.filter(o => (!texto || [o.cliente,o.equipoTipo,o.equipoCodigo,o.ubicacion].some(v => v?.toLowerCase().includes(texto))) && (!this.filtroTecnico || o.idTecnico === Number(this.filtroTecnico)) && (!this.filtroEstado || o.estado === this.filtroEstado) && (!this.filtroFechaDesde || o.fechaProgramada.slice(0,10) >= this.filtroFechaDesde) && (!this.filtroFechaHasta || o.fechaProgramada.slice(0,10) <= this.filtroFechaHasta));
  }
  get ordenesPaginadas(): OrdenAdministrativa[] { const inicio = (this.paginaActual-1)*this.registrosPorPagina; return this.ordenesFiltradas.slice(inicio,inicio+this.registrosPorPagina); }
  get totalPaginas(): number { return Math.max(1,Math.ceil(this.ordenesFiltradas.length/this.registrosPorPagina)); }
  cambiarPagina(n: number): void { if(n>=1 && n<=this.totalPaginas) this.paginaActual=n; }
  cambiarRegistrosPorPagina(event: Event): void { this.registrosPorPagina=Number((event.target as HTMLSelectElement).value); this.paginaActual=1; }
  actualizarFiltros(): void { this.paginaActual=1; }
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
    const hoyStr = this.fechaLocal(new Date());

    const celdas: CeldaCalendario[] = [];

    for (let i = 0; i < diaSemanaInicio; i++) {
      celdas.push({ fecha: null, numeroDia: null, esHoy: false, ordenes: [] });
    }

    for (let dia = 1; dia <= totalDias; dia++) {
      const fechaActual = new Date(anio, mes, dia);
      const fechaStr = this.fechaLocal(fechaActual);
      const esHoy = fechaStr === hoyStr;

      const ordenesDelDia = this.ordenesFiltradas.filter(ord => {
        if (!ord.fechaProgramada) return false;
        const ordFechaStr = ord.fechaProgramada.slice(0, 10);
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

  private fechaLocal(fecha: Date): string { return fecha.getFullYear() + '-' + String(fecha.getMonth()+1).padStart(2,'0') + '-' + String(fecha.getDate()).padStart(2,'0'); }
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