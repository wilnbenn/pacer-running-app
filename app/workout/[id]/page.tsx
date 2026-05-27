'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePlan } from '@/lib/hooks/usePlan';
import { getWorkoutMeta } from '@/lib/workoutMeta';
import { formatPace } from '@/lib/training/paceCalculator';
import type { WorkoutDay } from '@/types/training';

export default function WorkoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dateParam = params.id as string;
  const { plan, loading } = usePlan();

  const workout: WorkoutDay | null = useMemo(() => {
    if (!plan) return null;
    for (const week of plan.weeks) {
      for (const w of week.workouts) {
        if (w.date === dateParam) return w;
      }
    }
    return null;
  }, [plan, dateParam]);

  const [logged, setLogged] = useState(false);
  const [effort, setEffort] = useState(7);
  const [actualMiles, setActualMiles] = useState('');
  const [notes, setNotes] = useState('');

  if (loading)
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!workout)
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center text-neutral-500">
        Workout not found
      </div>
    );

  const meta = getWorkoutMeta(workout.workoutType);

  const dateDisplay = new Date(dateParam + 'T00:00:00').toLocaleDateString(
    'en-US',
    {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="text-sm text-neutral-500 hover:text-neutral-900 transition"
        >
          ← Back
        </button>
        <span className="text-lg font-semibold tracking-tight text-neutral-900 ml-2">
          Pacer
        </span>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-sm text-neutral-400 mb-2">{dateDisplay}</p>
          <div className="flex items-center gap-3 mb-3">
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-lg ${meta.color} ${meta.textColor}`}
            >
              {meta.label}
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-neutral-900">
            {workout.isRestDay ? 'Rest day' : `${workout.distanceMiles} miles`}
          </h1>
        </div>

        {!workout.isRestDay && (
          <>
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 mb-4">
              <p className="text-xs font-medium uppercase tracking-widest text-neutral-400 mb-4">
                Pace target
              </p>
              <div className="flex gap-6">
                <div>
                  <p className="text-2xl font-semibold text-neutral-900">
                    {formatPace(workout.targetPaceSec ?? 0)}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Target pace per mile
                  </p>
                </div>
                <div className="border-l border-neutral-100 pl-6">
                  <p className="text-sm text-neutral-600">
                    {workout.paceLabel}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-5 mb-4">
              <p className="text-xs font-medium uppercase tracking-widest text-neutral-400 mb-3">
                Purpose
              </p>
              <p className="text-sm text-neutral-700 leading-relaxed">
                {workout.purpose}
              </p>
              {workout.notes && (
                <p className="text-sm text-neutral-500 mt-3 leading-relaxed border-t border-neutral-100 pt-3">
                  {workout.notes}
                </p>
              )}
            </div>

            {logged ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
                <p className="text-emerald-700 font-medium">Workout logged ✓</p>
                <p className="text-emerald-600 text-sm mt-1">
                  Nice work. See you on the next one.
                </p>
                <Link
                  href="/dashboard"
                  className="inline-block mt-4 text-sm text-emerald-700 underline"
                >
                  Back to dashboard
                </Link>
              </div>
            ) : (
              <div className="bg-white border border-neutral-200 rounded-2xl p-5">
                <p className="text-xs font-medium uppercase tracking-widest text-neutral-400 mb-4">
                  Log this workout
                </p>
                <div className="mb-4">
                  <label className="block text-sm text-neutral-600 mb-1.5">
                    Actual distance (miles)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder={`${workout.distanceMiles ?? ''}`}
                    value={actualMiles}
                    onChange={(e) => setActualMiles(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm text-neutral-600 mb-2">
                    Perceived effort: <strong>{effort}/10</strong>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={effort}
                    onChange={(e) => setEffort(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-neutral-400 mt-1">
                    <span>Easy</span>
                    <span>Moderate</span>
                    <span>Max</span>
                  </div>
                </div>
                <div className="mb-5">
                  <label className="block text-sm text-neutral-600 mb-1.5">
                    Notes (optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="How did it go?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLogged(true)}
                    className="flex-1 py-3 rounded-xl bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-700 transition"
                  >
                    Mark as completed
                  </button>
                  <button
                    onClick={() => setLogged(true)}
                    className="px-4 py-3 rounded-xl border border-neutral-200 text-sm text-neutral-500 hover:bg-neutral-100 transition"
                  >
                    Skip
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {workout.isRestDay && (
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 text-center">
            <p className="text-neutral-500 text-sm leading-relaxed">
              Rest days are part of the plan. Your body adapts during recovery,
              not just during runs.
            </p>
            <Link
              href="/dashboard"
              className="inline-block mt-4 text-sm font-medium text-neutral-900 underline"
            >
              Back to dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
