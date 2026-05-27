'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { GeneratedPlan } from '@/types/training';
import type { OnboardingData } from '@/types/user';

export function usePlan() {
  const router = useRouter();
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const rawPlan = sessionStorage.getItem('activePlan');
    const rawOnboarding = sessionStorage.getItem('onboardingData');

    if (!rawPlan) {
      router.replace('/onboarding');
      return;
    }

    try {
      setPlan(JSON.parse(rawPlan));
      if (rawOnboarding) setOnboarding(JSON.parse(rawOnboarding));
    } catch {
      router.replace('/onboarding');
    } finally {
      setLoading(false);
    }
  }, [router]);

  return { plan, onboarding, loading };
}
