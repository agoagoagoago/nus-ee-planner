import type { Module, PlannedItem, Ratings } from '@/types';
import { RATING_AXES } from '@/types';
import { moduleByCode } from '@/data/curriculum';
import { TERM_IDS, termIndex } from './terms';

export const isCapstone = (m: Module | undefined): boolean => m?.category === 'Capstone';

/** Units a module contributes to a single term. Capstone (8u) spans two terms → 4u each. */
export function moduleUnitsInTerm(m: Module | undefined): number {
  if (!m) return 0;
  return isCapstone(m) ? m.units / 2 : m.units;
}

export function itemsByTerm(plan: PlannedItem[]): Record<string, PlannedItem[]> {
  const map: Record<string, PlannedItem[]> = {};
  for (const id of TERM_IDS) map[id] = [];
  for (const item of plan) (map[item.termId] ??= []).push(item);
  return map;
}

export function termUnits(items: PlannedItem[]): number {
  return items.reduce((s, it) => s + moduleUnitsInTerm(moduleByCode[it.code]), 0);
}

export function termAxisSums(items: PlannedItem[]): Ratings {
  const sums: Ratings = {
    difficulty: 0,
    workload: 0,
    math: 0,
    programming: 0,
    hardware: 0,
    project: 0,
  };
  for (const it of items) {
    const m = moduleByCode[it.code];
    if (!m) continue;
    for (const axis of RATING_AXES) sums[axis] += m.ratings[axis];
  }
  return sums;
}

/** Total planned units, counting the 8u capstone once (4u in each of its two terms). */
export function totalPlannedUnits(plan: PlannedItem[]): number {
  return plan.reduce((s, it) => s + moduleUnitsInTerm(moduleByCode[it.code]), 0);
}

/** Term ids (sorted) where the capstone appears. */
export function capstoneTerms(plan: PlannedItem[]): string[] {
  return plan
    .filter((it) => isCapstone(moduleByCode[it.code]))
    .map((it) => it.termId)
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort((a, b) => termIndex(a) - termIndex(b));
}

/** First (earliest) term in which a given code appears, or null. */
export function earliestTermOf(plan: PlannedItem[], code: string): string | null {
  const terms = plan
    .filter((it) => it.code === code)
    .map((it) => it.termId)
    .sort((a, b) => termIndex(a) - termIndex(b));
  return terms[0] ?? null;
}
