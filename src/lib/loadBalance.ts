import type { PlannedItem, Ratings } from '@/types';
import { moduleByCode } from '@/data/curriculum';
import { TERMS } from './terms';
import { itemsByTerm, termAxisSums, termUnits } from './plan';

/** All load-balancing thresholds live here so they are easy to tune in one place. */
export const THRESHOLDS = {
  overloadUnits: 24,
  lightUnits: 12,
  mathHeavyAxis: 4, // a module counts as "maths-heavy" at math >= 4
  mathCrunchCount: 2, // >= 2 such modules => warning
  difficultySpikeAxis: 5,
  difficultySpikeCount: 2,
  projectHeavyAxis: 4,
  projectCrunchCount: 2,
} as const;

export type WarningLevel = 'info' | 'warn' | 'danger';

export interface TermWarning {
  level: WarningLevel;
  message: string;
}

export interface TermLoad {
  termId: string;
  units: number;
  targetUnits: number;
  axisSums: Ratings;
  loadScore: number; // sum of difficulty — used to find the heaviest term
  warnings: TermWarning[];
  isFinalYear: boolean;
}

function modulesNamed(items: PlannedItem[], axis: keyof Ratings, min: number): string[] {
  return items
    .map((it) => moduleByCode[it.code])
    .filter((m) => m && m.ratings[axis] >= min)
    .map((m) => m!.code);
}

export function computeTermLoads(plan: PlannedItem[]): TermLoad[] {
  const byTerm = itemsByTerm(plan);

  return TERMS.map((term) => {
    const items = byTerm[term.id] ?? [];
    const units = termUnits(items);
    const axisSums = termAxisSums(items);
    const warnings: TermWarning[] = [];
    const isFinalYear = term.year === 4;

    if (units > THRESHOLDS.overloadUnits) {
      warnings.push({
        level: 'danger',
        message: `Overloaded: ${units} units (recommended ≤ ${THRESHOLDS.overloadUnits}).`,
      });
    } else if (units > 0 && units < THRESHOLDS.lightUnits && !isFinalYear) {
      warnings.push({
        level: 'info',
        message: `Light term (${units} units) — fine for balance, or pull a course forward.`,
      });
    }

    const mathy = modulesNamed(items, 'math', THRESHOLDS.mathHeavyAxis);
    if (mathy.length >= THRESHOLDS.mathCrunchCount) {
      warnings.push({
        level: 'warn',
        message: `Heavy maths term — ${mathy.join(', ')} are all maths-intense. Consider spreading them out.`,
      });
    }

    const spikes = modulesNamed(items, 'difficulty', THRESHOLDS.difficultySpikeAxis);
    if (spikes.length >= THRESHOLDS.difficultySpikeCount) {
      warnings.push({
        level: 'danger',
        message: `Difficulty spike — ${spikes.join(', ')} are each rated 5/5. This will be a brutal term.`,
      });
    }

    const projects = modulesNamed(items, 'project', THRESHOLDS.projectHeavyAxis);
    if (projects.length >= THRESHOLDS.projectCrunchCount) {
      warnings.push({
        level: 'warn',
        message: `Project-heavy term — ${projects.join(', ')} all carry large projects competing for the same deadline weeks.`,
      });
    }

    return {
      termId: term.id,
      units,
      targetUnits: term.targetUnits,
      axisSums,
      loadScore: axisSums.difficulty,
      warnings,
      isFinalYear,
    };
  });
}

/** Returns the term id with the highest difficulty load (ties → earliest), or null. */
export function heaviestTerm(loads: TermLoad[]): string | null {
  let best: TermLoad | null = null;
  for (const l of loads) {
    if (l.loadScore > 0 && (!best || l.loadScore > best.loadScore)) best = l;
  }
  return best?.termId ?? null;
}
