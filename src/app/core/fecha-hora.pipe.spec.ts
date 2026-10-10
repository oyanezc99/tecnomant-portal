import { FechaHoraPipe } from './fecha-hora.pipe';

describe('FechaHoraPipe', () => {
  const pipe = new FechaHoraPipe();

  it('2026-10-09T14:30:00 se muestra como 09/10/2026 14:30 (FR8.2)', () => {
    expect(pipe.transform('2026-10-09T14:30:00')).toBe('09/10/2026 14:30');
  });

  it('un valor vacío o que no es una fecha se muestra como texto vacío (FR8.2)', () => {
    expect(pipe.transform('')).toBe('');
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform('no es una fecha')).toBe('');
    expect(pipe.transform('2026-13-45T99:99:00')).toBe('');
  });
});
