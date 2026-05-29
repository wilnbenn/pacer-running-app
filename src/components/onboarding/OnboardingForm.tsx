'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { OnboardingData } from '@/types/user';
import type {
  RaceDistance,
  PlanLength,
  ExperienceLevel,
} from '@/types/training';
import type { BodyGoal, Sex } from '@/types/nutrition';

const STEPS = [
  'About you',
  'Your race',
  'Training background',
  'Body goal',
] as const;
type StepIndex = 0 | 1 | 2 | 3;

const EMPTY: OnboardingData = {
  name: '',
  age: 30,
  heightCm: 175,
  weightKg: 70,
  sex: 'male',
  raceDistance: 'HALF',
  planLengthWeeks: 12,
  goalRaceTimeSec: 6900,
  experienceLevel: 'intermediate',
  weeklyMileageCurrent: 20,
  longestRecentRun: 8,
  runDaysPerWeek: 4,
  bodyGoal: 'performance',
};

function timeToSec(h: string, m: string, s: string): number {
  return (
    parseInt(h || '0') * 3600 + parseInt(m || '0') * 60 + parseInt(s || '0')
  );
}

function secToHMS(total: number) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return {
    h: h.toString(),
    m: m.toString().padStart(2, '0'),
    s: s.toString().padStart(2, '0'),
  };
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium text-neutral-500 uppercase tracking-widest mb-1.5">
      {children}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
    />
  );
}

function OptionButton({
  active,
  onClick,
  children,
  description,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  description?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm transition ${
        active
          ? 'border-neutral-900 bg-neutral-900 text-white'
          : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400'
      }`}
    >
      <span className="font-medium">{children}</span>
      {description && (
        <span
          className={`block text-xs mt-0.5 ${
            active ? 'text-neutral-300' : 'text-neutral-400'
          }`}
        >
          {description}
        </span>
      )}
    </button>
  );
}

function TimeInput({
  label,
  totalSec,
  onChange,
  showHours = false,
}: {
  label: string;
  totalSec: number;
  onChange: (sec: number) => void;
  showHours?: boolean;
}) {
  const { h, m, s } = secToHMS(totalSec);
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex gap-2">
        {showHours && (
          <div className="flex flex-col items-center gap-1">
            <input
              type="number"
              min="0"
              max="9"
              value={h}
              onChange={(e) => onChange(timeToSec(e.target.value, m, s))}
              className="w-16 text-center bg-white border border-neutral-200 rounded-xl px-2 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
            <span className="text-xs text-neutral-400">hrs</span>
          </div>
        )}
        <div className="flex flex-col items-center gap-1">
          <input
            type="number"
            min="0"
            max="59"
            value={m}
            onChange={(e) =>
              onChange(timeToSec(showHours ? h : '0', e.target.value, s))
            }
            className="w-16 text-center bg-white border border-neutral-200 rounded-xl px-2 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
          <span className="text-xs text-neutral-400">min</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <input
            type="number"
            min="0"
            max="59"
            value={s}
            onChange={(e) =>
              onChange(timeToSec(showHours ? h : '0', m, e.target.value))
            }
            className="w-16 text-center bg-white border border-neutral-200 rounded-xl px-2 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
          <span className="text-xs text-neutral-400">sec</span>
        </div>
      </div>
    </div>
  );
}

function StepAboutYou({
  data,
  set,
}: {
  data: OnboardingData;
  set: (k: keyof OnboardingData, v: unknown) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <FieldLabel>First name</FieldLabel>
        <TextInput
          value={data.name}
          onChange={(v) => set('name', v)}
          placeholder="Alex"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel>Age</FieldLabel>
          <TextInput
            type="number"
            value={data.age}
            onChange={(v) => set('age', parseInt(v))}
          />
        </div>
        <div>
          <FieldLabel>Sex</FieldLabel>
          <div className="flex gap-2">
            {(['male', 'female', 'other'] as Sex[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => set('sex', s)}
                className={`flex-1 py-3 rounded-xl border text-xs font-medium capitalize transition ${
                  data.sex === s
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel>Height (cm)</FieldLabel>
          <TextInput
            type="number"
            value={data.heightCm}
            onChange={(v) => set('heightCm', parseFloat(v))}
          />
        </div>
        <div>
          <FieldLabel>Weight (kg)</FieldLabel>
          <TextInput
            type="number"
            value={data.weightKg}
            onChange={(v) => set('weightKg', parseFloat(v))}
          />
        </div>
      </div>
    </div>
  );
}

function StepYourRace({
  data,
  set,
}: {
  data: OnboardingData;
  set: (k: keyof OnboardingData, v: unknown) => void;
}) {
  const distances: { value: RaceDistance; label: string; detail: string }[] = [
    { value: '5K', label: '5K', detail: '3.1 miles' },
    { value: '10K', label: '10K', detail: '6.2 miles' },
    { value: 'HALF', label: 'Half Marathon', detail: '13.1 miles' },
    { value: 'MARATHON', label: 'Marathon', detail: '26.2 miles' },
  ];

  const plans: { value: PlanLength; label: string }[] = [
    { value: 6, label: '6 weeks' },
    { value: 9, label: '9 weeks' },
    { value: 12, label: '12 weeks' },
    { value: 24, label: '24 weeks' },
  ];

  const needsHours =
    data.raceDistance === 'MARATHON' || data.raceDistance === 'HALF';

  return (
    <div className="space-y-6">
      <div>
        <FieldLabel>Race distance</FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          {distances.map(({ value, label, detail }) => (
            <OptionButton
              key={value}
              active={data.raceDistance === value}
              onClick={() => set('raceDistance', value)}
              description={detail}
            >
              {label}
            </OptionButton>
          ))}
        </div>
      </div>
      <div>
        <FieldLabel>Plan length</FieldLabel>
        <div className="grid grid-cols-4 gap-2">
          {plans.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => set('planLengthWeeks', value)}
              className={`py-3 rounded-xl border text-sm font-medium transition ${
                data.planLengthWeeks === value
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <TimeInput
        label="Goal race time"
        totalSec={data.goalRaceTimeSec}
        onChange={(sec) => set('goalRaceTimeSec', sec)}
        showHours={needsHours}
      />
    </div>
  );
}

function StepTrainingBackground({
  data,
  set,
}: {
  data: OnboardingData;
  set: (k: keyof OnboardingData, v: unknown) => void;
}) {
  const levels: {
    value: ExperienceLevel;
    label: string;
    description: string;
  }[] = [
    {
      value: 'beginner',
      label: 'Beginner',
      description: 'New to structured training or returning after a long break',
    },
    {
      value: 'intermediate',
      label: 'Intermediate',
      description: 'Some race experience, comfortable with a training plan',
    },
    {
      value: 'advanced',
      label: 'Advanced',
      description: 'Consistent high-mileage training, multiple races completed',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <FieldLabel>Experience level</FieldLabel>
        <div className="space-y-2">
          {levels.map(({ value, label, description }) => (
            <OptionButton
              key={value}
              active={data.experienceLevel === value}
              onClick={() => set('experienceLevel', value)}
              description={description}
            >
              {label}
            </OptionButton>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel>Current weekly miles</FieldLabel>
          <TextInput
            type="number"
            value={data.weeklyMileageCurrent}
            onChange={(v) => set('weeklyMileageCurrent', parseFloat(v))}
          />
        </div>
        <div>
          <FieldLabel>Longest recent run (mi)</FieldLabel>
          <TextInput
            type="number"
            value={data.longestRecentRun}
            onChange={(v) => set('longestRecentRun', parseFloat(v))}
          />
        </div>
      </div>
      <div>
        <FieldLabel>Run days per week</FieldLabel>
        <div className="flex gap-2">
          {[3, 4, 5, 6].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => set('runDaysPerWeek', d)}
              className={`flex-1 py-3 rounded-xl border text-sm font-medium transition ${
                data.runDaysPerWeek === d
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepBodyGoal({
  data,
  set,
}: {
  data: OnboardingData;
  set: (k: keyof OnboardingData, v: unknown) => void;
}) {
  const goals: { value: BodyGoal; label: string; description: string }[] = [
    {
      value: 'performance',
      label: 'Performance',
      description: 'Optimize energy for training. Eat to fuel.',
    },
    {
      value: 'maintain',
      label: 'Maintain weight',
      description:
        'Support training without significant body composition change.',
    },
    {
      value: 'conservative_fat_loss',
      label: 'Conservative fat loss',
      description: 'Modest deficit. Training quality is protected.',
    },
    {
      value: 'gain_support_muscle',
      label: 'Support muscle gain',
      description: 'Slight surplus to support strength and recovery.',
    },
  ];

  return (
    <div className="space-y-3">
      <p className="text-sm text-neutral-500 mb-4">
        Your nutrition targets will adapt to each day&apos;s training load. This goal
        shapes the overall calorie level.
      </p>
      {goals.map(({ value, label, description }) => (
        <OptionButton
          key={value}
          active={data.bodyGoal === value}
          onClick={() => set('bodyGoal', value)}
          description={description}
        >
          {label}
        </OptionButton>
      ))}
    </div>
  );
}

export default function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState<StepIndex>(0);
  const [data, setData] = useState<OnboardingData>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(key: keyof OnboardingData, value: unknown) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function canAdvance(): boolean {
    if (step === 0) return !!data.name && data.age > 0;
    if (step === 1) return data.goalRaceTimeSec > 0;
    if (step === 2) return data.weeklyMileageCurrent > 0;
    return true;
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onboarding: data }),
      });

      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.error ?? 'Unknown error');

      sessionStorage.setItem('activePlan', JSON.stringify(json.plan));
      sessionStorage.setItem('onboardingData', JSON.stringify(json.onboarding));

      router.push('/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const stepComponents: React.ReactNode[] = [
    <StepAboutYou key="0" data={data} set={set} />,
    <StepYourRace key="1" data={data} set={set} />,
    <StepTrainingBackground key="2" data={data} set={set} />,
    <StepBodyGoal key="3" data={data} set={set} />,
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-10 text-center">
          <span className="text-2xl font-semibold tracking-tight text-neutral-900">
            Pacer
          </span>
          <span className="ml-1 text-2xl text-neutral-300">·</span>
        </div>
        <div className="flex gap-1.5 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i <= step ? 'bg-neutral-900' : 'bg-neutral-200'
              }`}
            />
          ))}
        </div>
        <div className="mb-7">
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-widest mb-1">
            Step {step + 1} of {STEPS.length}
          </p>
          <h1 className="text-2xl font-semibold text-neutral-900">
            {STEPS[step]}
          </h1>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 mb-6 shadow-sm">
          {stepComponents[step]}
        </div>
        {error && <p className="text-sm text-red-500 mb-4 px-1">{error}</p>}
        <div className="flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as StepIndex)}
              className="px-5 py-3.5 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition"
            >
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              disabled={!canAdvance()}
              onClick={() => setStep((s) => (s + 1) as StepIndex)}
              className="flex-1 py-3.5 rounded-xl bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="flex-1 py-3.5 rounded-xl bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-700 disabled:opacity-60 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Generating your plan…
                </>
              ) : (
                'Generate my plan →'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
