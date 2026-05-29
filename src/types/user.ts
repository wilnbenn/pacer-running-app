import type { RaceDistance, PlanLength, ExperienceLevel } from './training';
import type { BodyGoal, Sex } from './nutrition';

export interface OnboardingData {
  name: string;
  age: number;
  heightCm: number;
  weightKg: number;
  sex: Sex;
  raceDistance: RaceDistance;
  planLengthWeeks: PlanLength;
  goalRaceTimeSec: number;
  experienceLevel: ExperienceLevel;
  weeklyMileageCurrent: number;
  longestRecentRun: number;
  runDaysPerWeek: number;
  recentRaceDistance?: RaceDistance;
  recentRaceTimeSec?: number;
  bodyGoal: BodyGoal;
}

export interface GeneratePlanRequest {
  onboarding: OnboardingData;
  startDate?: string;
}
