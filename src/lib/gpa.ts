import type { Grade, PlannedItem } from '@/types';
import { moduleByCode } from '@/data/curriculum';
import { isCapstone } from './plan';
import { TERMS, termIndex } from './terms';

// NUS 5.00 CAP scale. NOTE: label this "confirm current NUS grade-point scale" in the UI.
export const GRADE_POINTS: Record<string, number> = {
  'A+': 5.0,
  A: 5.0,
  'A-': 4.5,
  'B+': 4.0,
  B: 3.5,
  'B-': 3.0,
  'C+': 2.5,
  C: 2.0,
  'D+': 1.5,
  D: 1.0,
  F: 0.0,
};

export const GRADE_OPTIONS: Grade[] = [
  'A+',
  'A',
  'A-',
  'B+',
  'B',
  'B-',
  'C+',
  'C',
  'D+',
  'D',
  'F',
  'S',
  'U',
];

/** One gradeable entry — capstone is collapsed to a single 8u entry. */
export interface GradeEntry {
  instanceId: string;
  code: string;
  title: string;
  units: number;
  termId: string;
  grade: Grade;
}

export function gradeEntries(plan: PlannedItem[], grades: Record<string, Grade>): GradeEntry[] {
  const entries: GradeEntry[] = [];
  const seenCapstone = new Set<string>();
  for (const item of plan) {
    const m = moduleByCode[item.code];
    if (!m) continue;
    if (isCapstone(m)) {
      if (seenCapstone.has(m.code)) continue; // collapse the two capstone halves
      seenCapstone.add(m.code);
    }
    entries.push({
      instanceId: item.instanceId,
      code: m.code,
      title: m.title,
      units: m.units,
      termId: item.termId,
      grade: grades[item.instanceId] ?? null,
    });
  }
  return entries;
}

/** Grade point for CAP, or null if the grade is unset or S/U (excluded from CAP). */
function gradePoint(g: Grade): number | null {
  if (g == null || g === 'S' || g === 'U') return null;
  return GRADE_POINTS[g] ?? null;
}

export interface GpaResult {
  cumulative: number | null;
  gradedUnits: number;
  perTerm: { termId: string; gpa: number | null; gradedUnits: number }[];
  sensitivity: { instanceId: string; code: string; units: number; swing: number }[];
}

export function computeGpa(entries: GradeEntry[]): GpaResult {
  let sumPoints = 0;
  let gradedUnits = 0;
  for (const e of entries) {
    const gp = gradePoint(e.grade);
    if (gp != null) {
      sumPoints += gp * e.units;
      gradedUnits += e.units;
    }
  }
  const cumulative = gradedUnits > 0 ? sumPoints / gradedUnits : null;

  // Per term (in schedule order)
  const perTerm = TERMS.map((t) => {
    let p = 0;
    let u = 0;
    for (const e of entries) {
      const gp = gradePoint(e.grade);
      if (e.termId === t.id && gp != null) {
        p += gp * e.units;
        u += e.units;
      }
    }
    return { termId: t.id, gpa: u > 0 ? p / u : null, gradedUnits: u };
  }).sort((a, b) => termIndex(a.termId) - termIndex(b.termId));

  // Sensitivity: for an ungraded module, the cumulative CAP can swing by 5u/(U+u).
  const sensitivity = entries
    .filter((e) => e.grade == null)
    .map((e) => ({
      instanceId: e.instanceId,
      code: e.code,
      units: e.units,
      swing: Math.round(((5 * e.units) / (gradedUnits + e.units)) * 100) / 100,
    }))
    .sort((a, b) => b.swing - a.swing)
    .slice(0, 8);

  return { cumulative, gradedUnits, perTerm, sensitivity };
}
