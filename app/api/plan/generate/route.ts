import { NextRequest, NextResponse } from 'next/server';
import { generatePlan } from '@/lib/training/planGenerator';
import type { GeneratePlanRequest } from '@/types/user';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GeneratePlanRequest;
    const { onboarding, startDate } = body;

    const plan = generatePlan(
      {
        raceDistance: onboarding.raceDistance,
        planLengthWeeks: onboarding.planLengthWeeks,
        weeklyMileageCurrent: onboarding.weeklyMileageCurrent,
        longestRecentRun: onboarding.longestRecentRun,
        runDaysPerWeek: onboarding.runDaysPerWeek,
        goalRaceTimeSec: onboarding.goalRaceTimeSec,
        experienceLevel: onboarding.experienceLevel,
        recentRaceDistance: onboarding.recentRaceDistance,
        recentRaceTimeSec: onboarding.recentRaceTimeSec,
      },
      startDate ? new Date(startDate) : new Date()
    );

    return NextResponse.json({ success: true, plan, onboarding });
  } catch (err) {
    console.error('[plan/generate]', err);
    return NextResponse.json(
      { success: false, error: 'Plan generation failed' },
      { status: 500 }
    );
  }
}
