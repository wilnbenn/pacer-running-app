'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePlan } from '@/lib/hooks/usePlan';
import { getWorkoutMeta } from '@/lib/workoutMeta';
import type { TrainingWeek } from '@/types/training';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const PHASE_COLORS: Record<string, string> = {
  base: 'bg-sky-100 text-sky-700',
  build: 'bg-violet-100 text-violet-700',
  specific: 'bg-orange-100 text-orange-700',
  taper: 'bg-emerald-100 text-emerald-700',
};

export default function CalendarPage() {
  const { plan, loading } = usePlan();
  const [activeWeekNum, setActiveWeekNum] = useState(1);
  const todayISO = new Date().toISOString().split('T')[0];

  if (loading) return <Loading />;
  if (!plan) return null;

  const currentWeekNum = (() => {
    for (const week of plan.weeks) {
      for (const w of week.workouts) {
        if (w.date === todayISO) return week.weekNumber;
      }
    }
    return 1;
  })();

  const activeWeek =
    plan.weeks.find((w) => w.weekNumber === activeWeekNum) ?? plan.weeks[0];

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
          <Link href="/calendar" className="text-neutral-900">
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

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">
              Training calendar
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              {plan.planLengthWeeks}-week plan · {plan.startDate} →{' '}
              {plan.endDate}
            </p>
          </div>
          <div className="flex gap-2">
            {Object.entries(PHASE_COLORS).map(([phase, cls]) => (
              <span
                key={phase}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium capitalize ${cls}`}
              >
                {phase}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {plan.weeks.map((week) => (
            <button
              key={week.weekNumber}
              onClick={() => setActiveWeekNum(week.weekNumber)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition ${
                week.weekNumber === activeWeekNum
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : week.weekNumber === currentWeekNum
                  ? 'bg-neutral-100 text-neutral-900 border-neutral-300'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
              }`}
            >
              W{week.weekNumber}
              {week.isRecoveryWeek && (
                <span className="ml-1 text-[10px] opacity-70">R</span>
              )}
              {week.isTaperWeek && (
                <span className="ml-1 text-[10px] opacity-70">T</span>
              )}
            </button>
          ))}
        </div>

        <WeekDetail week={activeWeek} todayISO={todayISO} />
      </div>
    </div>
  );
}

function WeekDetail({
  week,
  todayISO,
}: {
  week: TrainingWeek;
  todayISO: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-semibold text-neutral-900">
          Week {week.weekNumber}
        </h2>
        <span
          className={`text-xs px-2.5 py-1 rounded-lg font-medium capitalize ${
            PHASE_COLORS[week.phase] ?? 'bg-neutral-100 text-neutral-600'
          }`}
        >
          {week.phase}
        </span>
        {week.isRecoveryWeek && (
          <span className="text-xs px-2.5 py-1 rounded-lg font-medium bg-sky-50 text-sky-600">
            Recovery week
          </span>
        )}
        {week.isTaperWeek && (
          <span className="text-xs px-2.5 py-1 rounded-lg font-medium bg-emerald-50 text-emerald-600">
            Taper week
          </span>
        )}
        <span className="ml-auto text-sm text-neutral-400">
          {week.totalMileage} mi planned
        </span>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {week.workouts.map((workout) => {
          const meta = getWorkoutMeta(workout.workoutType);
          const isToday = workout.date === todayISO;
          const dateLabel = new Date(
            workout.date + 'T00:00:00'
          ).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });

          return (
            <Link
              key={workout.dayOfWeek}
              href={workout.isRestDay ? '#' : `/workout/${workout.date}`}
              className={`rounded-2xl border p-3 flex flex-col min-h-[120px] transition bg-white ${
                isToday
                  ? 'border-neutral-900 ring-2 ring-neutral-900 ring-offset-1'
                  : 'border-neutral-200 hover:border-neutral-400'
              } ${workout.isRestDay ? 'cursor-default' : 'hover:shadow-sm'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-neutral-400">
                  {DAY_NAMES[workout.dayOfWeek]}
                </span>
                {isToday && (
                  <span className="text-[10px] bg-neutral-900 text-white px-1.5 py-0.5 rounded-full">
                    Today
                  </span>
                )}
              </div>
              <span className="text-xs text-neutral-400 mb-2">{dateLabel}</span>
              {workout.isRestDay ? (
                <span className="text-xs text-neutral-300 mt-auto">Rest</span>
              ) : (
                <>
                  <span
                    className={`self-start text-[10px] font-medium px-2 py-0.5 rounded-md mb-2 ${meta.color} ${meta.textColor}`}
                  >
                    {meta.shortLabel}
                  </span>
                  <span className="text-sm font-semibold text-neutral-900 mt-auto">
                    {workout.distanceMiles} mi
                  </span>
                  {workout.paceLabel && (
                    <span className="text-[10px] text-neutral-400 mt-0.5 leading-tight">
                      {workout.paceLabel}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
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
