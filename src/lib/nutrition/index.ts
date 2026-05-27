import type {
  NutritionInput,
  MacroTarget,
  DayType,
  BodyGoal,
} from '@/types/nutrition';

function calcBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: string
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

function calcBaseTDEE(bmr: number, runDaysPerWeek = 4): number {
  const mult = runDaysPerWeek >= 5 ? 1.55 : runDaysPerWeek >= 3 ? 1.375 : 1.2;
  return Math.round(bmr * mult);
}

interface DayAdj {
  calorieAdd: number;
  carbMultiplier: number;
  explanation: string;
}

function getDayAdj(
  dayType: DayType,
  exerciseCal: number,
  bodyGoal: BodyGoal
): DayAdj {
  const goalMod = bodyGoal === 'conservative_fat_loss' ? 0.85 : 1.0;

  const map: Record<DayType, DayAdj> = {
    rest: {
      calorieAdd: 0,
      carbMultiplier: 0.7 * goalMod,
      explanation:
        "Today is a rest day. Carbohydrate needs are lower since there's no training stimulus.",
    },
    easy: {
      calorieAdd: exerciseCal * 0.75,
      carbMultiplier: 0.9 * goalMod,
      explanation:
        'Easy run day. Moderate carbohydrates support light aerobic work and daily energy.',
    },
    workout: {
      calorieAdd: exerciseCal,
      carbMultiplier: 1.15 * goalMod,
      explanation:
        'Hard workout day — carbohydrates are higher to fuel performance and replenish glycogen after intensity.',
    },
    long_run: {
      calorieAdd: exerciseCal,
      carbMultiplier: 1.3 * goalMod,
      explanation:
        'Long run day — your highest carbohydrate day. Maximum glycogen availability and strong post-run recovery nutrition.',
    },
  };

  return map[dayType];
}

export function getDailyNutritionTarget(input: NutritionInput): MacroTarget {
  const {
    heightCm,
    weightKg,
    age,
    sex,
    bodyGoal,
    dayType,
    estimatedExerciseCalories,
    runDaysPerWeek,
  } = input;

  const bmr = calcBMR(weightKg, heightCm, age, sex);
  const baseTDEE = calcBaseTDEE(bmr, runDaysPerWeek ?? 4);
  const { calorieAdd, carbMultiplier, explanation } = getDayAdj(
    dayType,
    estimatedExerciseCalories,
    bodyGoal
  );

  let totalCal = baseTDEE + calorieAdd;
  if (bodyGoal === 'conservative_fat_loss') totalCal -= 300;
  if (bodyGoal === 'gain_support_muscle') totalCal += 200;

  const proteinG = Math.round(weightKg * 2.0);
  const baseCarbsG = Math.round((totalCal * 0.45) / 4);
  const carbsG = Math.round(baseCarbsG * carbMultiplier);
  const fatCal = Math.max(totalCal - proteinG * 4 - carbsG * 4, 300);
  const fatG = Math.round(fatCal / 9);
  const calories = Math.round(proteinG * 4 + carbsG * 4 + fatG * 9);

  const recoveryLine =
    dayType === 'long_run' || dayType === 'workout'
      ? ' Protein stays steady to support muscle repair and adaptation.'
      : '';

  return {
    calories,
    carbsG,
    proteinG,
    fatG,
    explanation: explanation + recoveryLine,
  };
}
