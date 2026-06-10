import type { PlannedItem } from '@/types';
import { TERM_IDS } from './terms';
import { moduleByCode } from '@/data/curriculum';

const newId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2)}`;

/** Compact, URL-safe encoding: a list of [code, termId] pairs (instance ids are regenerated). */
export function encodePlan(plan: PlannedItem[]): string {
  const pairs = plan.map((p) => [p.code, p.termId]);
  return encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(pairs)))));
}

export function decodePlan(encoded: string): PlannedItem[] | null {
  try {
    const json = decodeURIComponent(escape(atob(decodeURIComponent(encoded))));
    const pairs = JSON.parse(json) as [string, string][];
    if (!Array.isArray(pairs)) return null;
    return pairs
      .filter(
        ([code, termId]) =>
          typeof code === 'string' && moduleByCode[code] && TERM_IDS.includes(termId),
      )
      .map(([code, termId]) => ({ instanceId: newId(), code, termId }));
  } catch {
    return null;
  }
}

export function exportPlanJson(plan: PlannedItem[]): string {
  const grouped: Record<string, string[]> = {};
  for (const t of TERM_IDS) grouped[t] = [];
  for (const p of plan) (grouped[p.termId] ??= []).push(p.code);
  return JSON.stringify({ cohort: 'AY2025/26', schedule: grouped }, null, 2);
}
