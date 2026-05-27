import type { ExperienceLevel, TrainingInput } from '@/types/training';

export function classifyRunner(input: TrainingInput): ExperienceLevel {
  const {
    weeklyMileageCurrent,
    longestRecentRun,
    runDaysPerWeek,
    experienceLevel,
  } = input;

  if (
    weeklyMileageCurrent < 12 &&
    longestRecentRun < 5 &&
    runDaysPerWeek <= 3
  ) {
    return 'beginner';
  }

  if (
    weeklyMileageCurrent >= 45 &&
    longestRecentRun >= 16 &&
    runDaysPerWeek >= 5
  ) {
    return 'advanced';
  }

  return experienceLevel;
}
