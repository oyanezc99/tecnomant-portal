/** Duración del conteo animado de los números del Dashboard (FR3.2). */
export const DURACION_CONTEO_MS = 800;

/** Indica si el sistema pide reducir el movimiento (NFR5). */
export function prefiereMovimientoReducido(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Sube un número de 0 a `destino` y avisa de cada valor con `alCambiar`.
 * Con movimiento reducido entrega el valor final de inmediato.
 * Devuelve una función que cancela el conteo.
 */
export function contarHasta(
  destino: number,
  alCambiar: (valor: number) => void,
  duracionMs = DURACION_CONTEO_MS,
): () => void {
  if (destino <= 0 || prefiereMovimientoReducido()) {
    alCambiar(destino);
    return () => undefined;
  }

  let cuadro = 0;
  let inicio: number | null = null;
  const avanzar = (ahora: number): void => {
    inicio ??= ahora;
    const avance = Math.min((ahora - inicio) / duracionMs, 1);
    alCambiar(Math.round(destino * avance));
    if (avance < 1) {
      cuadro = requestAnimationFrame(avanzar);
    }
  };
  cuadro = requestAnimationFrame(avanzar);
  return () => cancelAnimationFrame(cuadro);
}
