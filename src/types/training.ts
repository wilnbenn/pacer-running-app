export type RaceDistance = '5K' | '10K' | 'HALF' | 'MARATHON';
export type PlanLength = 6 | 9 | 12 | 24;
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type TrainingPhase = 'base' | 'build' | 'specific' | 'taper';
export type WorkoutType =
  | 'easy_run'
  | 'recovery_run'
  | 'long_run'
  | 'tempo_run'
  | 'threshold_intervals'
  | 'intervals'
  | 'marathon_pace_run'
  | 'half_marathon_pace_run'
  | 'strides'
  | 'hill_work'
  | 'rest';

export type CompletionStatus = 'completed' | 'missed' | 'partial' | 'skipped';

export interface PaceZones {
  easyPaceSec: number;
  longRunPaceSec: number;
  tempoPaceSec: number;
  intervalPaceSec: number;
  racePaceSec: number;
}

export interface TrainingInput {
  raceDistance: RaceDistance;
  planLengthWeeks: PlanLength;
  weeklyMileageCurrent: number;
  longestRecentRun: number;
  runDaysPerWeek: number;
  goalRaceTimeSec: number;
  experienceLevel: ExperienceLevel;
  recentRaceDistance?: RaceDistance;
  recentRaceTimeSec?: number;
  averageEasyPaceSec?: number;
  preferredLongRunDay?: number;
  preferredWorkoutDay?: number;
  injuryNotes?: string;
}

export interface WorkoutDay {
  dayOfWeek: number;
  date: string;
  workoutType: WorkoutType;
  distanceMiles?: number;
  durationMinutes?: number;
  targetPaceSec?: number;
  paceLabel?: string;
  purpose: string;
  notes?: string;
  isRestDay: boolean;
}

export interface TrainingWeek {
  weekNumber: number;
  phase: TrainingPhase;
  totalMileage: number;
  isRecoveryWeek: boolean;
  isTaperWeek: boolean;
  workouts: WorkoutDay[];
}

export interface GoalRealismFlag {
  isRealistic: boolean;
  message?: string;
  realisticTargetSec?: number;
  stretchTargetSec?: number;
}

export interface GeneratedPlan {
  raceDistance: RaceDistance;
  planLengthWeeks: number;
  startDate: string;
  endDate: string;
  paceZones: PaceZones;
  weeks: TrainingWeek[];
  goalRealism: GoalRealismFlag;
}
