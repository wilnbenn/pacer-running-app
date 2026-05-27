import type {
  WorkoutDay,
  WorkoutType,
  TrainingPhase,
  PaceZones,
  RaceDistance,
  ExperienceLevel,
} from '@/types/training';
import { formatPace } from './paceCalculator';

interface WeekAssignmentInput {
  weekNumber: number;
  phase: TrainingPhase;
  targetMileage: number;
  isRecoveryWeek: boolean;
  isTaperWeek: boolean;
  runDaysPerWeek: number;
  raceDistance: RaceDistance;
  experienceLevel: ExperienceLevel;
  paceZones: PaceZones;
  weekStartDate: string;
  preferredLongRunDay: number;
  preferredWorkoutDay: number;
}

export function assignWorkoutsToWeek(input: WeekAssignmentInput): WorkoutDay[] {
  const {
    phase,
    targetMileage,
    isRecoveryWeek,
    runDaysPerWeek,
    raceDistance,
    paceZones,
    weekStartDate,
    preferredLongRunDay,
    preferredWorkoutDay,
  } = input;

  const slots = selectWorkoutSlots(
    runDaysPerWeek,
    phase,
    isRecoveryWeek,
    raceDistance
  );
  const runDayNums = layoutRunDays(
    runDaysPerWeek,
    preferredLongRunDay,
    preferredWorkoutDay
  );

  const result: WorkoutDay[] = [];

  for (let d = 0; d < 7; d++) {
    const date = addDays(weekStartDate, d);
    const slotIndex = runDayNums.indexOf(d);

    if (slotIndex === -1) {
      result.push({
        dayOfWeek: d,
        date,
        workoutType: 'rest',
        purpose: 'Rest & recovery',
        isRestDay: true,
      });
      continue;
    }

    const workoutType = slots[slotIndex];
    const details = buildWorkoutDetails(
      workoutType,
      targetMileage,
      runDaysPerWeek,
      paceZones
    );
    result.push({
      dayOfWeek: d,
      date,
      workoutType,
      isRestDay: false,
      ...details,
    });
  }

  return result;
}

function selectWorkoutSlots(
  days: number,
  phase: TrainingPhase,
  isRecovery: boolean,
  raceDistance: RaceDistance
): WorkoutType[] {
  if (isRecovery) {
    return Array(days - 1)
      .fill('easy_run')
      .concat(['long_run']) as WorkoutType[];
  }

  const quality = selectQualitySession(raceDistance, phase);

  if (days === 3) return [quality, 'easy_run', 'long_run'];
  if (days === 4) return [quality, 'easy_run', 'easy_run', 'long_run'];
  if (days === 5)
    return [quality, 'easy_run', 'easy_run', 'easy_run', 'long_run'];
  return [quality, 'easy_run', 'easy_run', 'easy_run', 'easy_run', 'long_run'];
}

function selectQualitySession(
  dist: RaceDistance,
  phase: TrainingPhase
): WorkoutType {
  if (phase === 'base') return 'tempo_run';
  if (dist === '5K')
    return phase === 'specific' ? 'intervals' : 'threshold_intervals';
  if (dist === '10K')
    return phase === 'specific' ? 'threshold_intervals' : 'tempo_run';
  if (dist === 'HALF')
    return phase === 'specific' ? 'half_marathon_pace_run' : 'tempo_run';
  return phase === 'specific' ? 'marathon_pace_run' : 'tempo_run';
}

function layoutRunDays(
  runDays: number,
  longRunDay: number,
  workoutDay: number
): number[] {
  const chosen = new Set<number>([longRunDay, workoutDay]);

  const candidates = [0, 1, 2, 3, 4, 5, 6]
    .filter((d) => !chosen.has(d))
    .sort((a, b) => {
      const aAdj = [...chosen].some((c) => Math.abs(c - a) === 1);
      const bAdj = [...chosen].some((c) => Math.abs(c - b) === 1);
      return Number(aAdj) - Number(bAdj);
    });

  while (chosen.size < runDays && candidates.length > 0) {
    chosen.add(candidates.shift()!);
  }

  return Array.from(chosen).sort((a, b) => a - b);
}

function buildWorkoutDetails(
  type: WorkoutType,
  weekMileage: number,
  runDays: number,
  pz: PaceZones
): Omit<WorkoutDay, 'dayOfWeek' | 'date' | 'workoutType' | 'isRestDay'> {
  const longFrac = 0.3;
  const qualFrac = 0.18;
  const easyFrac = (1 - longFrac - qualFrac) / Math.max(runDays - 2, 1);

  switch (type) {
    case 'long_run':
      return {
        distanceMiles: r(weekMileage * longFrac),
        targetPaceSec: pz.longRunPaceSec,
        paceLabel: `Easy @ ${formatPace(pz.longRunPaceSec)}`,
        purpose: 'Build aerobic endurance and fatigue resistance',
        notes: 'Stay fully conversational. Walk breaks are fine if needed.',
      };
    case 'tempo_run':
      return {
        distanceMiles: r(weekMileage * qualFrac),
        targetPaceSec: pz.tempoPaceSec,
        paceLabel: `Tempo @ ${formatPace(pz.tempoPaceSec)}`,
        purpose: 'Raise lactate threshold and improve sustained pace',
        notes: '10 min warm-up · 20–25 min comfortably hard · 10 min cool-down',
      };
    case 'threshold_intervals':
      return {
        distanceMiles: r(weekMileage * qualFrac),
        targetPaceSec: pz.tempoPaceSec,
        paceLabel: `Threshold @ ${formatPace(pz.tempoPaceSec)}`,
        purpose: 'Develop lactate threshold through structured repetitions',
        notes: '3–4 × 8 min at threshold effort w/ 2 min easy recovery',
      };
    case 'intervals':
      return {
        distanceMiles: r(weekMileage * qualFrac),
        targetPaceSec: pz.intervalPaceSec,
        paceLabel: `Intervals @ ${formatPace(pz.intervalPaceSec)}`,
        purpose: 'Improve VO2 max and running economy',
        notes: '4–6 × 1 mile w/ equal recovery jog. Hard but controlled.',
      };
    case 'marathon_pace_run':
      return {
        distanceMiles: r(weekMileage * qualFrac),
        targetPaceSec: pz.racePaceSec,
        paceLabel: `MP @ ${formatPace(pz.racePaceSec)}`,
        purpose: 'Practice goal marathon pace and build metabolic efficiency',
        notes: 'Steady and controlled. Should feel like a 7/10 effort.',
      };
    case 'half_marathon_pace_run':
      return {
        distanceMiles: r(weekMileage * qualFrac),
        targetPaceSec: pz.racePaceSec,
        paceLabel: `HMP @ ${formatPace(pz.racePaceSec)}`,
        purpose: 'Practice goal half marathon pace',
        notes: 'Moderately hard. Should feel like a controlled 7–8/10.',
      };
    default:
      return {
        distanceMiles: r(weekMileage * easyFrac),
        targetPaceSec: pz.easyPaceSec,
        paceLabel: `Easy @ ${formatPace(pz.easyPaceSec)}`,
        purpose: 'Aerobic base building with low physiological stress',
        notes: 'Fully conversational. This run should not feel hard.',
      };
  }
}

const r = (n: number) => Math.round(n * 10) / 10;

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}
