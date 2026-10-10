import { contarHasta } from './conteo';

describe('contarHasta', () => {
  it('el conteo termina exactamente en el valor final (FR3.2)', () => {
    spyOn(window, 'matchMedia').and.returnValue({ matches: false } as MediaQueryList);
    const cuadros: FrameRequestCallback[] = [];
    spyOn(window, 'requestAnimationFrame').and.callFake((cuadro) => cuadros.push(cuadro));
    const valores: number[] = [];

    contarHasta(4, (valor) => valores.push(valor));
    // Se avanza el reloj a mano: inicio, mitad y final de los 800 ms.
    [1000, 1400, 1800].forEach((instante) => cuadros.shift()?.(instante));

    expect(valores).toEqual([0, 2, 4]);
    // Al llegar al final no pide más cuadros.
    expect(cuadros.length).toBe(0);
  });

  it('con movimiento reducido entrega el valor final de inmediato (NFR5)', () => {
    spyOn(window, 'matchMedia').and.returnValue({ matches: true } as MediaQueryList);
    const pedirCuadro = spyOn(window, 'requestAnimationFrame');
    const valores: number[] = [];

    contarHasta(4, (valor) => valores.push(valor));

    expect(valores).toEqual([4]);
    expect(pedirCuadro).not.toHaveBeenCalled();
  });
});
