export type BodyGoal =
  | 'performance'
  | 'maintain'
  | 'conservative_fat_loss'
  | 'gain_support_muscle';

export type DayType = 'rest' | 'easy' | 'workout' | 'long_run';
export type Sex = 'male' | 'female' | 'other';

export interface NutritionInput {
  heightCm: number;
  weightKg: number;
  age: number;
  sex: Sex;
  bodyGoal: BodyGoal;
  dayType: DayType;
  estimatedExerciseCalories: number;
  runDaysPerWeek?: number;
}

export interface MacroTarget {
  calories: number;
  carbsG: number;
  proteinG: number;
  fatG: number;
  explanation: string;
}
