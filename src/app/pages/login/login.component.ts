import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { mensajeDeError } from '../../core/errores';
import { SesionService } from '../../core/sesion.service';
import { ToastService } from '../../core/toast.service';

/** Pantalla de inicio de sesión. Solo deja entrar a quien tiene rol `admin`. */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly api = inject(ApiService);
  private readonly sesion = inject(SesionService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  usuario = '';
  clave = '';
  readonly esperando = signal(false);
  /** Mensaje en rojo bajo los campos. */
  readonly mensaje = signal('');
  /** Sacude la tarjeta; se apaga sola cuando termina la animación. */
  readonly sacudir = signal(false);

  ingresar(): void {
    if (this.esperando()) {
      return;
    }
    this.mensaje.set('');
    this.esperando.set(true);
    this.api.login(this.usuario, this.clave).subscribe({
      next: (respuesta) => {
        this.esperando.set(false);
        if (respuesta.rol !== 'admin') {
          this.mensaje.set('Este portal es solo para administradores');
          return;
        }
        // Solo se guardan el rol y el nombre; la clave nunca sale de este formulario (NFR1).
        this.sesion.guardar({ rol: respuesta.rol, nombre: respuesta.nombre });
        this.router.navigate(['/dashboard']);
      },
      error: (error: unknown) => {
        this.esperando.set(false);
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.mensaje.set('Usuario o clave incorrectos');
          this.sacudir.set(true);
        } else {
          this.toast.mostrar(mensajeDeError(error));
        }
      },
    });
  }
}
