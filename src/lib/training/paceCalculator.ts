import type { PaceZones, RaceDistance, TrainingInput } from '@/types/training';

const DISTANCE_MILES: Record<RaceDistance, number> = {
  '5K': 3.107,
  '10K': 6.214,
  HALF: 13.1,
  MARATHON: 26.2,
};

export function calculatePaceZones(input: TrainingInput): PaceZones {
  let refTimeSec: number;
  let refMiles: number;

  if (input.recentRaceTimeSec && input.recentRaceDistance) {
    refTimeSec = input.recentRaceTimeSec;
    refMiles = DISTANCE_MILES[input.recentRaceDistance];
  } else {
    refTimeSec = input.goalRaceTimeSec;
    refMiles = DISTANCE_MILES[input.raceDistance];
  }

  const racePaceSec = refTimeSec / refMiles;

  return {
    racePaceSec: Math.round(racePaceSec),
    easyPaceSec: Math.round(racePaceSec * 1.3),
    longRunPaceSec: Math.round(racePaceSec * 1.25),
    tempoPaceSec: Math.round(racePaceSec * 1.08),
    intervalPaceSec: Math.round(racePaceSec * 0.97),
  };
}

export function formatPace(secPerMile: number): string {
  const min = Math.floor(secPerMile / 60);
  const sec = Math.round(secPerMile % 60);
  return `${min}:${sec.toString().padStart(2, '0')}/mi`;
}

export function formatTime(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0)
    return `${h}:${m.toString().padStart(2, '0')}:${s
      .toString()
      .padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function distanceToMiles(d: RaceDistance): number {
  return DISTANCE_MILES[d];
}
