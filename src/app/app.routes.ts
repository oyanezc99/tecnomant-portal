import { Routes } from '@angular/router';

import { authGuard } from './core/auth.guard';
import { LayoutComponent } from './layout/layout.component';
import { ClientesComponent } from './pages/clientes/clientes.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
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
      { path: 'inspecciones', component: InspeccionesComponent, data: { titulo: 'Inspecciones' } },
      {
        path: 'inspecciones/:id',
        component: InspeccionDetalleComponent,
        data: { titulo: 'Detalle de inspección' },
      },
    ],
  },
  // Cualquier otra ruta va al Dashboard; en el avance eso incluye /equipos, /tecnicos y /ordenes (A2).
  { path: '**', redirectTo: 'dashboard' },
];
