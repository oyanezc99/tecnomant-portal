import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { SesionService } from './sesion.service';
import { environment } from '../../environments/environment';
export const sesionInterceptor: HttpInterceptorFn = (pedido, siguiente) => {
  const sesion=inject(SesionService);
  const router=inject(Router);
  const propio=pedido.url.startsWith(environment.apiUrl + '/');
  const token=sesion.leer()?.token;
  const autenticado=propio ? pedido.clone({withCredentials:true, ...(token ? {setHeaders:{Authorization:'Bearer '+token}} : {})}) : pedido;
  return siguiente(autenticado).pipe(catchError(error=>{
    if(propio && error.status===401 && !pedido.url.endsWith('/api/login') && !pedido.url.endsWith('/api/logout')) {sesion.cerrar(); router.navigate(['/login']);}
    return throwError(()=>error);
  }));
};
