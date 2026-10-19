import { Routes } from '@angular/router';

import { authGuard } from './core/auth.guard';
import { LayoutComponent } from './layout/layout.component';
import { ClientesComponent } from './pages/clientes/clientes.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { EquiposComponent } from './pages/equipos/equipos.component';
import { TecnicosComponent } from './pages/tecnicos/tecnicos.component';
import { OrdenesComponent } from './pages/ordenes/ordenes.component';
import { InspeccionDetalleComponent } from './pages/inspeccion-detalle/inspeccion-detalle.component';
import { InspeccionesComponent } from './pages/inspecciones/inspecciones.component';
import { LoginComponent } from './pages/login/login.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    // El resto del portal vive dentro del layout y pide sesión.
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent, data: { titulo: 'Dashboard' } },
      { path: 'clientes', component: ClientesComponent, data: { titulo: 'Clientes' } },
      { path: 'equipos', component: EquiposComponent, data: { titulo: 'Equipos' } },
      { path: 'tecnicos', component: TecnicosComponent, data: { titulo: 'Técnicos' } },
      { path: 'ordenes', component: OrdenesComponent, data: { titulo: 'Órdenes' } },
      { path: 'inspecciones', component: InspeccionesComponent, data: { titulo: 'Inspecciones' } },
      {
        path: 'inspecciones/:id',
        component: InspeccionDetalleComponent,
        data: { titulo: 'Detalle de inspección' },
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];