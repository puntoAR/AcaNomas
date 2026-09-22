import { PunctualityStatus } from '@/types';

export interface PunctualityEvaluation {
  status: PunctualityStatus;
  minutesDiff: number;
  label: string;
  description: string;
  badgeColor: string;
}

/**
 * Evalúa automáticamente la puntualidad de llegada en base a la hora pactada
 * y la hora efectiva en que el profesional marca "Llegué al domicilio".
 * 
 * Regla de negocio especificada:
 * - Si llega dentro de la hora acordada (hasta +15 min de tolerancia estricta o dentro de la franja horaria): "A tiempo".
 * - Si hay retraso moderado (16 a 59 min): "Retraso moderado".
 * - Si hay retraso de más de 60 minutos sin reprogramación previa: "Incumplimiento".
 * - Si fue acordada una reprogramación: "Reprogramado".
 */
export function evaluatePunctuality(
  agreedDate: string, // "YYYY-MM-DD"
  agreedTime: string, // "HH:MM"
  arrivedAtISO: string, // ISO string
  isReprogrammed: boolean = false
): PunctualityEvaluation {
  if (isReprogrammed) {
    return {
      status: 'reprogramado',
      minutesDiff: 0,
      label: 'Reprogramado',
      description: 'El turno fue reprogramado de común acuerdo con el cliente.',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300'
    };
  }

  // Parse agreed datetime
  const [year, month, day] = agreedDate.split('-').map(Number);
  const [hours, minutes] = agreedTime.split(':').map(Number);
  const agreedDateTime = new Date(year, month - 1, day, hours, minutes, 0);

  const arrivedDateTime = new Date(arrivedAtISO);

  // Difference in minutes (positive means arrived late, negative means arrived early)
  const diffMs = arrivedDateTime.getTime() - agreedDateTime.getTime();
  const minutesDiff = Math.round(diffMs / (1000 * 60));

  if (minutesDiff <= 15) {
    // Llegó antes o con hasta 15 minutos de margen
    return {
      status: 'a_tiempo',
      minutesDiff,
      label: 'A tiempo',
      description: minutesDiff <= 0 
        ? `Llegó puntual (${Math.abs(minutesDiff)} min antes de lo pactado).`
        : `Llegó dentro del margen pactado (${minutesDiff} min).`,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
    };
  } else if (minutesDiff <= 60) {
    // Retraso moderado dentro de la hora
    return {
      status: 'retraso_moderado',
      minutesDiff,
      label: 'Retraso de aviso',
      description: `Llegó con ${minutesDiff} minutos de demora sobre el horario inicial.`,
      badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-300'
    };
  } else {
    // Retraso de más de 1 hora sin reprogramación: Incumplimiento
    return {
      status: 'incumplimiento',
      minutesDiff,
      label: 'Incumplimiento de horario',
      description: `Retraso severo de ${Math.round(minutesDiff / 60)} hora(s) sin reprogramación.`,
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300'
    };
  }
}

/**
 * Recalcula el puntaje porcentual de puntualidad de un prestador
 * (ej. 98% a tiempo) en base a su historial.
 */
export function calculateOverallPunctuality(
  evaluations: PunctualityStatus[]
): number {
  if (evaluations.length === 0) return 100;

  const validEvaluations = evaluations.filter(e => e !== 'pendiente');
  if (validEvaluations.length === 0) return 100;

  let totalPoints = 0;
  for (const status of validEvaluations) {
    switch (status) {
      case 'a_tiempo':
      case 'reprogramado':
        totalPoints += 100;
        break;
      case 'retraso_moderado':
        totalPoints += 50;
        break;
      case 'incumplimiento':
        totalPoints += 0;
        break;
    }
  }

  return Math.round(totalPoints / validEvaluations.length);
}
