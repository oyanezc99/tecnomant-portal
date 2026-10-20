import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs';

import { environment } from '../../environments/environment';

const decodificador = new TextDecoder('utf-8', { fatal: true });

/** Repara secuencias UTF-8 que llegaron interpretadas como caracteres Latin-1. */
function repararTexto(texto: string): string {
  let resultado = texto;

  // Repite por si el texto sufrió el mismo error de codificación más de una vez.
  for (let intento = 0; intento < 2; intento++) {
    const reparado = resultado.replace(/Ã([\u0080-\u00bf])/g, (secuencia, byte: string) => {
      try {
        return decodificador.decode(Uint8Array.of(0xc3, byte.charCodeAt(0)));
      } catch {
        return secuencia;
      }
    });

    if (reparado === resultado) break;
    resultado = reparado;
  }

  return resultado;
}

function repararContenido(valor: unknown): unknown {
  if (typeof valor === 'string') return repararTexto(valor);
  if (Array.isArray(valor)) return valor.map(repararContenido);
  if (valor !== null && typeof valor === 'object' && Object.getPrototypeOf(valor) === Object.prototype) {
    return Object.fromEntries(
      Object.entries(valor).map(([clave, contenido]) => [clave, repararContenido(contenido)]),
    );
  }
  return valor;
}

/** Normaliza los textos recibidos desde la API antes de que lleguen a las pantallas. */
export const textoInterceptor: HttpInterceptorFn = (pedido, siguiente) => {
  if (!pedido.url.startsWith(environment.apiUrl + '/')) return siguiente(pedido);

  return siguiente(pedido).pipe(
    map(evento => evento instanceof HttpResponse
      ? evento.clone({ body: repararContenido(evento.body) })
      : evento),
  );
};
