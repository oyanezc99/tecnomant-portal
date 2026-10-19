import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { OrdenesComponent } from './ordenes.component';

describe('Órdenes administrativas', () => {
  let api: jasmine.SpyObj<ApiService>;
  let componente: OrdenesComponent;
  const ordenes = [
    {idOrden:1,idEquipo:1,idTecnico:10,tecnico:'Ana',cliente:'Cliente',direccion:'Dirección',equipoTipo:'Ascensor',equipoCodigo:'ASC-1',fechaProgramada:'2026-10-19T23:00:00',estado:'Completada'},
    {idOrden:2,idEquipo:1,idTecnico:20,tecnico:'Luis',cliente:'Cliente',direccion:'Dirección',equipoTipo:'Ascensor',equipoCodigo:'ASC-1',fechaProgramada:'2026-10-20T09:00:00',estado:'Pendiente'}
  ];
  beforeEach(() => {
    api=jasmine.createSpyObj('ApiService',['ordenes','obtenerTecnicos','obtenerEquipos','resumenOrdenes','crearOrden','editarOrden']);
    api.ordenes.and.returnValue(of(ordenes));
    api.obtenerTecnicos.and.returnValue(of([]));
    api.obtenerEquipos.and.returnValue(of([]));
    api.resumenOrdenes.and.returnValue(of({pendientes:1,enProceso:0,completadas:1}));
    api.crearOrden.and.returnValue(of({idOrden:3}));
    TestBed.configureTestingModule({providers:[{provide:ApiService,useValue:api},{provide:ToastService,useValue:{mostrar:()=>{}}}]});
    componente=TestBed.runInInjectionContext(()=>new OrdenesComponent());
    componente.ngOnInit();
  });
  it('incluye completadas y filtra por ID del técnico sin perder el conjunto completo', () => {
    componente.filtroEstado='Completada';
    expect(componente.ordenesFiltradas.map(o=>o.idOrden)).toEqual([1]);
    componente.filtroEstado='';
    componente.onCambioTecnicoCombo('20');
    expect(componente.ordenesFiltradas.map(o=>o.idOrden)).toEqual([2]);
    componente.limpiarFiltros();
    expect(componente.ordenesFiltradas.length).toBe(2);
    expect(api.ordenes).toHaveBeenCalledTimes(1);
  });
  it('filtra fechas por el día de negocio sin desplazar horas de la noche a UTC', () => {
    componente.filtroFechaDesde='2026-10-19';
    componente.filtroFechaHasta='2026-10-19';
    expect(componente.ordenesFiltradas.map(o=>o.idOrden)).toEqual([1]);
  });
  it('envía equipo y técnico numéricos al crear una orden', () => {
    componente.abrirFormulario();
    componente.formulario={idEquipo:1,idTecnico:20,fechaProgramada:'2026-10-21T10:00',estado:'Pendiente'};
    componente.guardarOrden();
    expect(api.crearOrden).toHaveBeenCalledOnceWith(componente.formulario);
    expect(componente.modalFormulario).toBeFalse();
  });
});
