'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePlan } from '@/lib/hooks/usePlan';
import { getWorkoutMeta } from '@/lib/workoutMeta';
import { getDailyNutritionTarget } from '@/lib/nutrition';
import { formatPace } from '@/lib/training/paceCalculator';
import type { WorkoutDay, TrainingWeek } from '@/types/training';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DashboardPage() {
  const { plan, onboarding, loading } = usePlan();

  const todayISO = new Date().toISOString().split('T')[0];

  const { currentWeek, todayWorkout } = useMemo(() => {
    if (!plan) return { currentWeek: null, todayWorkout: null };

    let cw: TrainingWeek | null = null;
    let tw: WorkoutDay | null = null;

    for (const week of plan.weeks) {
      for (const workout of week.workouts) {
        if (workout.date === todayISO) {
          cw = week;
          tw = workout;
          break;
        }
      }
      if (tw) break;
    }

    if (!cw) cw = plan.weeks[0];
    if (!tw)
      tw = cw?.workouts.find((w) => !w.isRestDay) ?? cw?.workouts[0] ?? null;

    return { currentWeek: cw, todayWorkout: tw };
  }, [plan, todayISO]);

  const nutrition = useMemo(() => {
    if (!onboarding || !todayWorkout) return null;
    const dayTypeMap: Record<string, 'rest' | 'easy' | 'workout' | 'long_run'> =
      {
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
    return getDailyNutritionTarget({
      heightCm: onboarding.heightCm,
      weightKg: onboarding.weightKg,
      age: onboarding.age,
      sex: onboarding.sex,
      bodyGoal: onboarding.bodyGoal,
      dayType: dayTypeMap[todayWorkout.workoutType] ?? 'easy',
      estimatedExerciseCalories: todayWorkout.distanceMiles
        ? Math.round(todayWorkout.distanceMiles * onboarding.weightKg * 1.036)
        : 0,
      runDaysPerWeek: onboarding.runDaysPerWeek,
    });
  }, [onboarding, todayWorkout]);

  if (loading) return <LoadingScreen />;
  if (!plan || !currentWeek || !todayWorkout) return null;

  const meta = getWorkoutMeta(todayWorkout.workoutType);

  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-semibold tracking-tight text-neutral-900">
          Pacer
        </span>
        <div className="flex gap-6 text-sm font-medium text-neutral-500">
          <Link href="/dashboard" className="text-neutral-900">
            Dashboard
          </Link>
          <Link href="/calendar" className="hover:text-neutral-900 transition">
            Calendar
          </Link>
          <Link href="/nutrition" className="hover:text-neutral-900 transition">
            Nutrition
          </Link>
          <Link href="/progress" className="hover:text-neutral-900 transition">
            Progress
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">
              {onboarding ? `Good morning, ${onboarding.name}` : 'Good morning'}
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Week {currentWeek.weekNumber} of {plan.planLengthWeeks} ·{' '}
              {plan.raceDistance === 'HALF'
                ? 'Half Marathon'
                : plan.raceDistance}{' '}
              plan ·{' '}
              <span className="capitalize">{currentWeek.phase} phase</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white border border-neutral-200 rounded-2xl p-5">
            <p className="text-xs font-medium uppercase tracking-widest text-neutral-400 mb-3">
              Today&apos;s workout
            </p>
            <span
              className={`inline-block text-xs font-medium px-2.5 py-1 rounded-lg mb-3 ${meta.color} ${meta.textColor}`}
            >
              {meta.label}
            </span>
            {todayWorkout.isRestDay ? (
              <div>
                <p className="text-xl font-semibold text-neutral-900 mb-1">
                  Rest day
                </p>
                <p className="text-sm text-neutral-500">
                  Recovery matters. Take it easy today.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xl font-semibold text-neutral-900 mb-1">
                  {todayWorkout.distanceMiles} miles
                </p>
                <p className="text-sm text-neutral-500 mb-3">
                  {todayWorkout.paceLabel}
                </p>
                <p className="text-xs text-neutral-400 leading-relaxed border-l-2 border-neutral-200 pl-3 mb-4">
                  {todayWorkout.purpose}
                </p>
                <Link
                  href={`/workout/${todayWorkout.date}`}
                  className="block w-full text-center py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-700 transition"
                >
                  View workout →
                </Link>
              </div>
            )}
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-5">
            <p className="text-xs font-medium uppercase tracking-widest text-neutral-400 mb-3">
              Today&apos;s nutrition
            </p>
            {nutrition ? (
              <>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-semibold text-neutral-900">
                    {nutrition.calories.toLocaleString()}
                  </span>
                  <span className="text-sm text-neutral-400">kcal</span>
                </div>
                <div className="space-y-2.5 mb-3">
                  <MacroBar
                    label="Carbs"
                    value={nutrition.carbsG}
                    max={400}
                    color="bg-emerald-500"
                    unit="g"
                  />
                  <MacroBar
                    label="Protein"
                    value={nutrition.proteinG}
                    max={200}
                    color="bg-blue-500"
                    unit="g"
                  />
                  <MacroBar
                    label="Fat"
                    value={nutrition.fatG}
                    max={150}
                    color="bg-amber-500"
                    unit="g"
                  />
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {nutrition.explanation}
                </p>
              </>
            ) : (
              <p className="text-sm text-neutral-400">No nutrition data</p>
            )}
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-5 mb-4">
          <p className="text-xs font-medium uppercase tracking-widest text-neutral-400 mb-4">
            This week
          </p>
          <div className="grid grid-cols-7 gap-2">
            {currentWeek.workouts.map((w) => {
              const m = getWorkoutMeta(w.workoutType);
              const isToday = w.date === todayISO;
              return (
                <div
                  key={w.dayOfWeek}
                  className="flex flex-col items-center gap-1.5"
                >
                  <span className="text-xs text-neutral-400">
                    {DAY_NAMES[w.dayOfWeek]}
                  </span>
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition ${
                      isToday
                        ? 'bg-neutral-900 text-white ring-2 ring-neutral-900 ring-offset-2'
                        : w.isRestDay
                        ? 'bg-neutral-100 text-neutral-300'
                        : `${m.color} ${m.textColor}`
                    }`}
                  >
                    {m.initial}
                  </div>
                  <span className="text-[10px] text-neutral-400 text-center leading-tight">
                    {w.isRestDay ? 'Rest' : `${w.distanceMiles}mi`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <StatCard
            label="Weekly miles"
            value={`${currentWeek.totalMileage}`}
            sub="planned"
          />
          <StatCard label="Adherence" value="88%" sub="last 4 weeks" />
          <StatCard
            label="Race pace"
            value={formatPace(plan.paceZones.racePaceSec)}
            sub="current fitness"
          />
        </div>
      </div>
    </div>
  );
}

function MacroBar({
  label,
  value,
  max,
  color,
  unit,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  unit: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-neutral-500">{label}</span>
        <span className="font-medium text-neutral-700">
          {value}
          {unit}
        </span>
      </div>
      <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-4">
      <p className="text-xs text-neutral-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-xl font-semibold text-neutral-900">{value}</p>
      <p className="text-xs text-neutral-400">{sub}</p>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-neutral-500">Loading your plan…</p>
      </div>
    </div>
  );
}
