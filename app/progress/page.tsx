'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePlan } from '@/lib/hooks/usePlan';
import type { TrainingWeek } from '@/types/training';

export default function ProgressPage() {
  const { plan, loading } = usePlan();
  const todayISO = new Date().toISOString().split('T')[0];

  const stats = useMemo(() => {
    if (!plan) return null;

    let totalPlanned = 0;
    let totalWorkouts = 0;
    const weeksElapsed: typeof plan.weeks = [];

    for (const week of plan.weeks) {
      const lastDayOfWeek = week.workouts[week.workouts.length - 1]?.date;
      if (lastDayOfWeek && lastDayOfWeek <= todayISO) {
        weeksElapsed.push(week);
        for (const w of week.workouts) {
          if (!w.isRestDay) {
            totalPlanned += w.distanceMiles ?? 0;
            totalWorkouts++;
          }
        }
      }
    }

    const simulatedAdherence = 88;
    const simulatedCompleted = Math.round(
      (totalWorkouts * simulatedAdherence) / 100
    );

    return {
      weeksElapsed: weeksElapsed.length,
      totalWeeks: plan.planLengthWeeks,
      totalPlanned: Math.round(totalPlanned * 10) / 10,
      totalWorkouts,
      simulatedCompleted,
      simulatedAdherence,
      recentWeeks: plan.weeks.slice(0, 6),
    };
  }, [plan, todayISO]);

  if (loading) return <Loading />;
  if (!plan || !stats) return null;

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
          <Link href="/nutrition" className="hover:text-neutral-900 transition">
            Nutrition
          </Link>
          <Link href="/progress" className="text-neutral-900">
            Progress
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900">Progress</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Week {stats.weeksElapsed} of {stats.totalWeeks} complete
          </p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-5 mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-neutral-600 font-medium">Plan progress</span>
            <span className="text-neutral-400">
              {stats.weeksElapsed}/{stats.totalWeeks} weeks
            </span>
          </div>
          <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-neutral-900 rounded-full transition-all"
              style={{
                width: `${Math.round(
                  (stats.weeksElapsed / stats.totalWeeks) * 100
                )}%`,
              }}
            />
          </div>
          <p className="text-xs text-neutral-400 mt-2">
            {Math.round((stats.weeksElapsed / stats.totalWeeks) * 100)}% of
            training complete
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <StatCard
            label="Miles planned"
            value={`${stats.totalPlanned}`}
            sub="so far"
          />
          <StatCard
            label="Workouts"
            value={`${stats.simulatedCompleted}/${stats.totalWorkouts}`}
            sub="completed"
          />
          <StatCard
            label="Adherence"
            value={`${stats.simulatedAdherence}%`}
            sub="completion rate"
          />
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-5">
          <p className="text-xs font-medium uppercase tracking-widest text-neutral-400 mb-5">
            Weekly mileage
          </p>
          <WeeklyMileageChart weeks={stats.recentWeeks} todayISO={todayISO} />
        </div>
      </div>
    </div>
  );
}

function WeeklyMileageChart({
  weeks,
  todayISO,
}: {
  weeks: TrainingWeek[];
  todayISO: string;
}) {
  const maxMileage = Math.max(...weeks.map((w) => w.totalMileage), 1);

  return (
    <div className="flex items-end gap-2 h-32">
      {weeks.map((week) => {
        const lastDay = week.workouts[week.workouts.length - 1]?.date ?? '';
        const isPast = lastDay < todayISO;
        const isCurrent =
          !isPast && week.workouts.some((w) => w.date === todayISO);
        const heightPct = (week.totalMileage / maxMileage) * 100;

        return (
          <div
            key={week.weekNumber}
            className="flex-1 flex flex-col items-center gap-1.5"
          >
            <span className="text-[10px] text-neutral-400">
              {week.totalMileage}mi
            </span>
            <div className="w-full flex items-end" style={{ height: '80px' }}>
              <div
                className={`w-full rounded-t-lg transition-all ${
                  isCurrent
                    ? 'bg-neutral-900'
                    : isPast
                    ? 'bg-neutral-300'
                    : 'bg-neutral-100'
                }`}
                style={{ height: `${heightPct}%` }}
              />
            </div>
            <span className="text-[10px] text-neutral-400">
              W{week.weekNumber}
            </span>
          </div>
        );
      })}
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

function Loading() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
