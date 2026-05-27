'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePlan } from '@/lib/hooks/usePlan';
import { getDailyNutritionTarget } from '@/lib/nutrition';
import type { DayType } from '@/types/nutrition';

const WORKOUT_TO_DAY_TYPE: Record<string, DayType> = {
  rest: 'rest',
  recovery_run: 'easy',
  easy_run: 'easy',
  long_run: 'long_run',
  tempo_run: 'workout',
  threshold_intervals: 'workout',
  intervals: 'workout',
  marathon_pace_run: 'workout',
  half_marathon_pace_run: 'workout',
  strides: 'easy',
  hill_work: 'workout',
};

const DAY_TYPE_LABELS: Record<
  DayType,
  { label: string; color: string; text: string }
> = {
  rest: {
    label: 'Rest day',
    color: 'bg-neutral-100',
    text: 'text-neutral-600',
  },
  easy: { label: 'Easy day', color: 'bg-sky-100', text: 'text-sky-700' },
  workout: {
    label: 'Workout day',
    color: 'bg-orange-100',
    text: 'text-orange-700',
  },
  long_run: {
    label: 'Long run day',
    color: 'bg-violet-100',
    text: 'text-violet-700',
  },
};

export default function NutritionPage() {
  const { plan, onboarding, loading } = usePlan();
  const todayISO = new Date().toISOString().split('T')[0];

  const { nutrition, dayType } = useMemo(() => {
    if (!plan || !onboarding)
      return { nutrition: null, dayType: 'easy' as DayType };

    let tw = null;
    for (const week of plan.weeks) {
      for (const w of week.workouts) {
        if (w.date === todayISO) {
          tw = w;
          break;
        }
      }
      if (tw) break;
    }
    if (!tw) tw = plan.weeks[0]?.workouts.find((w) => !w.isRestDay) ?? null;

    const dt: DayType =
      WORKOUT_TO_DAY_TYPE[tw?.workoutType ?? 'easy_run'] ?? 'easy';
    const exerciseCal = tw?.distanceMiles
      ? Math.round(tw.distanceMiles * onboarding.weightKg * 1.036)
      : 0;

    const nut = getDailyNutritionTarget({
      heightCm: onboarding.heightCm,
      weightKg: onboarding.weightKg,
      age: onboarding.age,
      sex: onboarding.sex,
      bodyGoal: onboarding.bodyGoal,
      dayType: dt,
      estimatedExerciseCalories: exerciseCal,
      runDaysPerWeek: onboarding.runDaysPerWeek,
    });

    return { nutrition: nut, dayType: dt };
  }, [plan, onboarding, todayISO]);

  const allTargets = useMemo(() => {
    if (!onboarding) return null;
    return (['rest', 'easy', 'workout', 'long_run'] as DayType[]).map((dt) => ({
      dayType: dt,
      ...getDailyNutritionTarget({
        heightCm: onboarding.heightCm,
        weightKg: onboarding.weightKg,
        age: onboarding.age,
        sex: onboarding.sex,
        bodyGoal: onboarding.bodyGoal,
        dayType: dt,
        estimatedExerciseCalories:
          dt === 'long_run'
            ? 700
            : dt === 'workout'
            ? 500
            : dt === 'easy'
            ? 300
            : 0,
        runDaysPerWeek: onboarding.runDaysPerWeek,
      }),
    }));
  }, [onboarding]);

  if (loading) return <Loading />;
  if (!nutrition || !onboarding) return null;

  const dtMeta = DAY_TYPE_LABELS[dayType];

  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-semibold tracking-tight text-neutral-900">
          Pacer
        </span>
        <div className="flex gap-6 text-sm font-medium text-neutral-500">
          <Link href="/dashboard" className="hover:text-neutral-900 transition">
            Dashboard
          </Link>
          <Link href="/calendar" className="hover:text-neutral-900 transition">
            Calendar
          </Link>
          <Link href="/nutrition" className="text-neutral-900">
            Nutrition
          </Link>
          <Link href="/progress" className="hover:text-neutral-900 transition">
            Progress
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900">Nutrition</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Daily targets adapt to your training load
          </p>
        </div>

        <div className={`rounded-2xl px-5 py-4 mb-6 ${dtMeta.color}`}>
          <span className={`text-sm font-medium ${dtMeta.text}`}>
            {dtMeta.label}
          </span>
          <p className={`text-xs mt-1 ${dtMeta.text} opacity-80`}>
            {nutrition.explanation}
          </p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-6 mb-4">
          <p className="text-xs font-medium uppercase tracking-widest text-neutral-400 mb-5">
            Today&apos;s targets
          </p>
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-4xl font-semibold text-neutral-900">
              {nutrition.calories.toLocaleString()}
            </span>
            <span className="text-neutral-400">kcal</span>
          </div>
          <div className="space-y-4">
            <MacroRow
              label="Carbohydrates"
              value={nutrition.carbsG}
              unit="g"
              cal={nutrition.carbsG * 4}
              totalCal={nutrition.calories}
              color="bg-emerald-500"
              note="Primary fuel source — scales with training load"
            />
            <MacroRow
              label="Protein"
              value={nutrition.proteinG}
              unit="g"
              cal={nutrition.proteinG * 4}
              totalCal={nutrition.calories}
              color="bg-blue-500"
              note="Muscle repair and adaptation — stays steady daily"
            />
            <MacroRow
              label="Fat"
              value={nutrition.fatG}
              unit="g"
              cal={nutrition.fatG * 9}
              totalCal={nutrition.calories}
              color="bg-amber-500"
              note="Hormonal health and sustained energy"
            />
          </div>
        </div>

        {allTargets && (
          <div className="bg-white border border-neutral-200 rounded-2xl p-6">
            <p className="text-xs font-medium uppercase tracking-widest text-neutral-400 mb-4">
              By day type
            </p>
            <div className="grid grid-cols-4 gap-3">
              {allTargets.map((t) => {
                const m = DAY_TYPE_LABELS[t.dayType];
                const isActive = t.dayType === dayType;
                return (
                  <div
                    key={t.dayType}
                    className={`rounded-xl p-3 border ${
                      isActive ? 'border-neutral-900' : 'border-neutral-100'
                    }`}
                  >
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-md inline-block mb-2 ${m.color} ${m.text}`}
                    >
                      {m.label}
                    </span>
                    <p className="text-base font-semibold text-neutral-900">
                      {t.calories.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      C {t.carbsG}g · P {t.proteinG}g · F {t.fatG}g
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MacroRow({
  label,
  value,
  unit,
  cal,
  totalCal,
  color,
  note,
}: {
  label: string;
  value: number;
  unit: string;
  cal: number;
  totalCal: number;
  color: string;
  note: string;
}) {
  const pct = Math.round((cal / totalCal) * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <div>
          <span className="text-sm font-medium text-neutral-800">{label}</span>
          <span className="text-xs text-neutral-400 ml-2">{note}</span>
        </div>
        <span className="text-sm font-semibold text-neutral-900">
          {value}
          {unit}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${color}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs text-neutral-400 w-8 text-right">{pct}%</span>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
