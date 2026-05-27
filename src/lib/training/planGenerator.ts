import type {
  TrainingInput,
  GeneratedPlan,
  TrainingWeek,
  GoalRealismFlag,
} from '@/types/training';
import { classifyRunner } from './classifier';
import { calculatePaceZones, distanceToMiles } from './paceCalculator';
import {
  buildPhaseSchedule,
  buildWeeklyProgression,
  estimatePeakMileage,
} from './progressionLogic';
import { assignWorkoutsToWeek } from './workoutAssigner';

export function generatePlan(
  input: TrainingInput,
  startDate: Date = new Date()
): GeneratedPlan {
  const experienceLevel = classifyRunner(input);
  const paceZones = calculatePaceZones(input);
  const goalRealism = checkGoalRealism(input, paceZones.racePaceSec);

  const peakMileage = estimatePeakMileage(
    input.raceDistance,
    experienceLevel,
    input.weeklyMileageCurrent
  );

  const phases = buildPhaseSchedule(input.planLengthWeeks);
  const blueprints = buildWeeklyProgression(
    input.planLengthWeeks,
    input.weeklyMileageCurrent,
    peakMileage,
    phases
  );

  const monday = getMondayOf(startDate);

  const weeks: TrainingWeek[] = blueprints.map((bp) => {
    const weekStart = new Date(monday);
    weekStart.setDate(weekStart.getDate() + (bp.weekNumber - 1) * 7);
    const weekStartISO = weekStart.toISOString().split('T')[0];

    const workouts = assignWorkoutsToWeek({
      ...bp,
      runDaysPerWeek: input.runDaysPerWeek,
      raceDistance: input.raceDistance,
      experienceLevel,
      paceZones,
      weekStartDate: weekStartISO,
      preferredLongRunDay: input.preferredLongRunDay ?? 6,
      preferredWorkoutDay: input.preferredWorkoutDay ?? 2,
    });

    return { ...bp, totalMileage: bp.targetMileage, workouts };
  });

  const endDate = new Date(monday);
  endDate.setDate(endDate.getDate() + input.planLengthWeeks * 7);

  return {
    raceDistance: input.raceDistance,
    planLengthWeeks: input.planLengthWeeks,
    startDate: monday.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    paceZones,
    weeks,
    goalRealism,
  };
}

function checkGoalRealism(
  input: TrainingInput,
  currentFitnessPaceSec: number
): GoalRealismFlag {
  if (!input.recentRaceTimeSec || !input.recentRaceDistance) {
    return { isRealistic: true };
  }

  const goalPaceSec =
    input.goalRaceTimeSec / distanceToMiles(input.raceDistance);
  const improvement =
    (currentFitnessPaceSec - goalPaceSec) / currentFitnessPaceSec;

  if (improvement > 0.08) {
    const miles = distanceToMiles(input.raceDistance);
    return {
      isRealistic: false,
      message:
        'Your goal time is more aggressive than your recent fitness suggests. ' +
        'Training paces will be based on your current fitness, not your goal.',
      realisticTargetSec: Math.round(currentFitnessPaceSec * miles * 0.97),
      stretchTargetSec: input.goalRaceTimeSec,
    };
  }

  return { isRealistic: true };
}

function getMondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
