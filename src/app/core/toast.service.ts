import { Injectable, signal } from '@angular/core';

export interface Aviso {
  id: number;
  texto: string;
}

/** Tiempo que un aviso permanece en pantalla. */
export const DURACION_AVISO_MS = 3000;

/** Mantiene la lista de avisos (toasts) y retira cada uno a los 3 s. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private siguienteId = 1;
  private readonly lista = signal<Aviso[]>([]);

  /** Avisos visibles en este momento. */
  readonly avisos = this.lista.asReadonly();

  mostrar(texto: string): void {
    const id = this.siguienteId++;
    this.lista.update((avisos) => [...avisos, { id, texto }]);
    setTimeout(() => this.lista.update((avisos) => avisos.filter((aviso) => aviso.id !== id)), DURACION_AVISO_MS);
  }
}
