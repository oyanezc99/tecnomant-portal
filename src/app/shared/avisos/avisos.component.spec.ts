import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { ToastService } from '../../core/toast.service';
import { buscarTodos } from '../../testing/datos-prueba';
import { AvisosComponent } from './avisos.component';

describe('AvisosComponent', () => {
  it('dibuja los avisos que tiene el servicio (FR7.3)', fakeAsync(() => {
    const fixture = TestBed.createComponent(AvisosComponent);
    const raiz: HTMLElement = fixture.nativeElement;
    const textos = () => buscarTodos(raiz, 'aviso').map((aviso) => aviso.textContent);
    fixture.detectChanges();
    expect(textos()).toEqual([]);

    const toast = TestBed.inject(ToastService);
    toast.mostrar('No se pudo conectar con la API');
    toast.mostrar('Usuario o clave incorrectos');
    fixture.detectChanges();
    expect(textos()).toEqual(['No se pudo conectar con la API', 'Usuario o clave incorrectos']);

    // A los 3 s el servicio los retira y dejan de dibujarse.
    tick(3000);
    fixture.detectChanges();
    expect(textos()).toEqual([]);
  }));
});
