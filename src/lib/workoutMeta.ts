import type { WorkoutType } from '@/types/training';

export interface WorkoutMeta {
  label: string;
  shortLabel: string;
  color: string;
  textColor: string;
  initial: string;
}

const META: Record<WorkoutType, WorkoutMeta> = {
  easy_run: {
    label: 'Easy run',
    shortLabel: 'Easy',
    initial: 'E',
    color: 'bg-emerald-100',
    textColor: 'text-emerald-800',
  },
  recovery_run: {
    label: 'Recovery run',
    shortLabel: 'Rec',
    initial: 'R',
    color: 'bg-sky-100',
    textColor: 'text-sky-800',
  },
  long_run: {
    label: 'Long run',
    shortLabel: 'Long',
    initial: 'L',
    color: 'bg-violet-100',
    textColor: 'text-violet-800',
  },
  tempo_run: {
    label: 'Tempo run',
    shortLabel: 'Tempo',
    initial: 'T',
    color: 'bg-orange-100',
    textColor: 'text-orange-800',
  },
  threshold_intervals: {
    label: 'Threshold intervals',
    shortLabel: 'Thr',
    initial: 'T',
    color: 'bg-orange-100',
    textColor: 'text-orange-800',
  },
  intervals: {
    label: 'Intervals',
    shortLabel: 'Int',
    initial: 'I',
    color: 'bg-red-100',
    textColor: 'text-red-800',
  },
  marathon_pace_run: {
    label: 'Marathon pace',
    shortLabel: 'MP',
    initial: 'M',
    color: 'bg-blue-100',
    textColor: 'text-blue-800',
  },
  half_marathon_pace_run: {
    label: 'HM pace run',
    shortLabel: 'HMP',
    initial: 'H',
    color: 'bg-blue-100',
    textColor: 'text-blue-800',
  },
  strides: {
    label: 'Strides',
    shortLabel: 'Str',
    initial: 'S',
    color: 'bg-yellow-100',
    textColor: 'text-yellow-800',
  },
  hill_work: {
    label: 'Hill work',
    shortLabel: 'Hill',
    initial: 'H',
    color: 'bg-amber-100',
    textColor: 'text-amber-800',
  },
  rest: {
    label: 'Rest',
    shortLabel: 'Rest',
    initial: '—',
    color: 'bg-neutral-100',
    textColor: 'text-neutral-400',
  },
};

export function getWorkoutMeta(type: WorkoutType): WorkoutMeta {
  return META[type] ?? META.rest;
}
