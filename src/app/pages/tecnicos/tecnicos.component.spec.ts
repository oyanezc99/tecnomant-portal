import { TestBed } from '@angular/core/testing';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { TecnicosComponent } from './tecnicos.component';

describe('Carga operativa de técnicos', () => {
  it('cuenta solo órdenes activas por ID e ignora inspecciones completadas y nombres repetidos', () => {
    TestBed.configureTestingModule({providers:[{provide:ApiService,useValue:{}},{provide:ToastService,useValue:{}}]});
    const componente=TestBed.runInInjectionContext(()=>new TecnicosComponent());
    const base={idEquipo:1,tecnico:'Mismo nombre',cliente:'Cliente',direccion:'',equipoTipo:'Ascensor',equipoCodigo:'ASC',fechaProgramada:'2026-10-19'};
    componente.ordenes=[{...base,idOrden:1,idTecnico:10,estado:'Pendiente'},{...base,idOrden:2,idTecnico:10,estado:'En proceso'},{...base,idOrden:3,idTecnico:10,estado:'Completada'},{...base,idOrden:4,idTecnico:20,estado:'Pendiente'}];
    expect(componente.obtenerCargaTrabajo(10).texto).toBe('2 órdenes activas');
    expect(componente.obtenerCargaTrabajo(20).texto).toBe('1 orden activa');
    expect(componente.obtenerCargaTrabajo(30).texto).toBe('Disponible (0 activas)');
  });
});
