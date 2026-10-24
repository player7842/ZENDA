import { describe, expect, it } from 'vitest';
import {
  CUPO_MAXIMO,
  CUPO_MINIMO,
  CUPO_POR_DEFECTO,
  ESTADO_APROBADA,
  ESTADO_DESAPROBADA,
  ESTADO_EN_REVISION,
  ESTADO_PENDIENTE,
  RESULTADO_APROBADO,
  RESULTADO_REPROBADO,
  calcularEstadoCarpeta,
  calcularEstadoFase,
  calcularProgreso,
  normalizarResultado,
  puedeUnirse,
  validarCupo,
  validarFechasTarea,
} from '../src/domain/reglas.js';

describe('dominio/reglas', () => {
  it('valida cupo por defecto y rangos', () => {
    expect(validarCupo(CUPO_POR_DEFECTO).valido).toBe(true);
    expect(validarCupo(CUPO_MINIMO).valido).toBe(true);
    expect(validarCupo(CUPO_MAXIMO).valido).toBe(true);
    expect(validarCupo(0).valido).toBe(false);
    expect(validarCupo(51).valido).toBe(false);
    expect(validarCupo(6.5).valido).toBe(false);
    expect(validarCupo('').valido).toBe(false);
    expect(validarCupo(null).valido).toBe(false);
    expect(validarCupo(undefined).valido).toBe(false);
  });

  it('normaliza resultados a APROBADO/REPROBADO', () => {
    expect(normalizarResultado('APROBADO')).toBe(RESULTADO_APROBADO);
    expect(normalizarResultado('aprobado')).toBe(RESULTADO_APROBADO);
    expect(normalizarResultado(' REPROBADO ')).toBe(RESULTADO_REPROBADO);
    expect(normalizarResultado('reprobado')).toBe(RESULTADO_REPROBADO);
    expect(normalizarResultado('otro')).toBe(null);
    expect(normalizarResultado(null)).toBe(null);
  });

  it('puedeUnirse respeta el cupo (el líder cuenta como integrante)', () => {
    expect(puedeUnirse(6, 3)).toBe(true);
    expect(puedeUnirse(6, 5)).toBe(true);
    expect(puedeUnirse(6, 6)).toBe(false);
    expect(puedeUnirse(1, 1)).toBe(false);
    expect(puedeUnirse('6', '5')).toBe(true);
  });

  it('calcularEstadoCarpeta: sin evidencias Pendiente', () => {
    expect(calcularEstadoCarpeta([])).toBe(ESTADO_PENDIENTE);
    expect(calcularEstadoCarpeta()).toBe(ESTADO_PENDIENTE);
  });

  it('calcularEstadoCarpeta: alguna reprobada -> Desaprobada', () => {
    expect(calcularEstadoCarpeta([RESULTADO_APROBADO, RESULTADO_REPROBADO])).toBe(
      ESTADO_DESAPROBADA
    );
    expect(calcularEstadoCarpeta(['aprobado', 'reprobado'])).toBe(ESTADO_DESAPROBADA);
  });

  it('calcularEstadoCarpeta: todas aprobadas -> Aprobada', () => {
    expect(calcularEstadoCarpeta([RESULTADO_APROBADO, RESULTADO_APROBADO])).toBe(
      ESTADO_APROBADA
    );
  });

  it('calcularEstadoCarpeta: con sin evaluar -> En revisión', () => {
    expect(calcularEstadoCarpeta([RESULTADO_APROBADO, null])).toBe(ESTADO_EN_REVISION);
    expect(calcularEstadoCarpeta([null])).toBe(ESTADO_EN_REVISION);
    expect(calcularEstadoCarpeta(['APROBADO', 'x'])).toBe(ESTADO_EN_REVISION);
  });

  it('calcularEstadoFase usa las evidencias (cascada)', () => {
    expect(calcularEstadoFase([RESULTADO_REPROBADO])).toBe(ESTADO_DESAPROBADA);
    expect(calcularEstadoFase([RESULTADO_APROBADO])).toBe(ESTADO_APROBADA);
    expect(calcularEstadoFase([])).toBe(ESTADO_PENDIENTE);
  });

  it('validarFechasTarea rechaza una fecha límite anterior al inicio', () => {
    expect(validarFechasTarea('2026-05-10', '2026-05-01')).toBe(
      'La fecha límite no puede ser anterior a la fecha de inicio'
    );
    expect(validarFechasTarea('2026-05-01', '2026-05-10')).toBe(null);
    expect(validarFechasTarea('2026-05-10', '2026-05-10')).toBe(null);
    // Fechas opcionales: si falta una, no se compara.
    expect(validarFechasTarea(null, '2026-05-10')).toBe(null);
    expect(validarFechasTarea('2026-05-10', undefined)).toBe(null);
    // Formatos inválidos.
    expect(validarFechasTarea('no-es-fecha', '2026-05-10')).toBe(
      'Las fechas de la tarea no son válidas'
    );
  });

  it('calcularProgreso cuenta aprobadas/reprobadas/sin evaluar', () => {
    const p = calcularProgreso([RESULTADO_APROBADO, RESULTADO_REPROBADO, null]);
    expect(p.total).toBe(3);
    expect(p.aprobadas).toBe(1);
    expect(p.reprobadas).toBe(1);
    expect(p.sinEvaluar).toBe(1);
    expect(p.porcentaje).toBe(33);

    const p2 = calcularProgreso([RESULTADO_APROBADO, RESULTADO_APROBADO]);
    expect(p2.porcentaje).toBe(100);

    const p3 = calcularProgreso([]);
    expect(p3.total).toBe(0);
    expect(p3.porcentaje).toBe(0);
  });
});
