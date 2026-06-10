import { recommendedSchedule } from '@/data/curriculum';

export interface TermMeta {
  id: string; // "Y1S1"
  year: number;
  sem: number;
  label: string; // "Year 1 · Sem 1"
  targetUnits: number;
}

export const TERMS: TermMeta[] = recommendedSchedule.map((t) => ({
  id: `Y${t.year}S${t.sem}`,
  year: t.year,
  sem: t.sem,
  label: `Year ${t.year} · Sem ${t.sem}`,
  targetUnits: t.targetUnits,
}));

export const TERM_IDS = TERMS.map((t) => t.id);

export const termIndex = (id: string): number => TERM_IDS.indexOf(id);

export const termById: Record<string, TermMeta> = Object.fromEntries(TERMS.map((t) => [t.id, t]));
