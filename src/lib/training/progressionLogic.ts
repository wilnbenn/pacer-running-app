import type { TrainingPhase, PlanLength } from '@/types/training';

export interface WeekBlueprint {
  weekNumber: number;
  phase: TrainingPhase;
  targetMileage: number;
  isRecoveryWeek: boolean;
  isTaperWeek: boolean;
}

export function buildPhaseSchedule(
  weeks: PlanLength
): { phase: TrainingPhase; weeks: number }[] {
  switch (weeks) {
    case 6:
      return [
        { phase: 'specific', weeks: 4 },
        { phase: 'taper', weeks: 2 },
      ];
    case 9:
      return [
        { phase: 'build', weeks: 4 },
        { phase: 'specific', weeks: 3 },
        { phase: 'taper', weeks: 2 },
      ];
    case 12:
      return [
        { phase: 'base', weeks: 3 },
        { phase: 'build', weeks: 4 },
        { phase: 'specific', weeks: 3 },
        { phase: 'taper', weeks: 2 },
      ];
    case 24:
    default:
      return [
        { phase: 'base', weeks: 8 },
        { phase: 'build', weeks: 8 },
        { phase: 'specific', weeks: 5 },
        { phase: 'taper', weeks: 3 },
      ];
  }
}

const TAPER_FACTORS = [0.8, 0.65, 0.4, 0.3];

export function buildWeeklyProgression(
  planLengthWeeks: PlanLength,
  startingMileage: number,
  peakMileage: number,
  phases: { phase: TrainingPhase; weeks: number }[]
): WeekBlueprint[] {
  const blueprints: WeekBlueprint[] = [];
  let weekNum = 1;

  for (const { phase, weeks: phaseWeeks } of phases) {
    const isTaper = phase === 'taper';

    for (let w = 0; w < phaseWeeks; w++) {
      const isRecovery = !isTaper && weekNum % 4 === 0;
      const progress = phaseWeeks > 1 ? w / (phaseWeeks - 1) : 1;

      let mileage: number;

      if (isTaper) {
        const factor = TAPER_FACTORS[w] ?? 0.3;
        mileage = peakMileage * factor;
      } else if (isRecovery) {
        mileage =
          startingMileage + (peakMileage - startingMileage) * progress * 0.75;
      } else {
        mileage = startingMileage + (peakMileage - startingMileage) * progress;
      }

      if (blueprints.length > 0 && !isRecovery && !isTaper) {
        const prev = blueprints[blueprints.length - 1].targetMileage;
        mileage = Math.min(mileage, prev * 1.1);
      }

      blueprints.push({
        weekNumber: weekNum,
        phase,
        targetMileage: Math.round(mileage * 10) / 10,
        isRecoveryWeek: isRecovery,
        isTaperWeek: isTaper,
      });

      weekNum++;
    }
  }

  return blueprints;
}

export function estimatePeakMileage(
  raceDistance: string,
  level: string,
  currentMileage: number
): number {
  const peaks: Record<string, Record<string, number>> = {
    '5K': { beginner: 25, intermediate: 35, advanced: 45 },
    '10K': { beginner: 30, intermediate: 40, advanced: 55 },
    HALF: { beginner: 35, intermediate: 45, advanced: 60 },
    MARATHON: { beginner: 40, intermediate: 55, advanced: 70 },
  };
  const target = peaks[raceDistance]?.[level] ?? 40;
  return Math.min(target, currentMileage * 1.5);
}
