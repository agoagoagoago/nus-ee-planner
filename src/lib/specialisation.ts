import type { Area, Module, PlannedItem } from '@/types';
import { modules, moduleByCode, specialisations } from '@/data/curriculum';

export interface SpecialisationProgress {
  name: string;
  area: Area;
  required: number;
  plannedCourses: Module[]; // area courses already in the plan (incl. UEs that fit the area)
  stillNeeded: number;
  suggestions: Module[]; // area courses not yet planned
}

/** Count area courses in the plan toward a specialisation. Unrestricted electives that
 *  happen to be courses in the area are auto-counted (a real EE area course placed
 *  anywhere counts). Placeholder slots do not count until you pick a real course. */
export function specialisationProgress(
  plan: PlannedItem[],
  name: string,
): SpecialisationProgress | null {
  const spec = specialisations.find((s) => s.name === name);
  if (!spec) return null;

  const plannedCodes = new Set(plan.map((p) => p.code));

  const plannedCourses = modules.filter(
    (m) => !m.placeholder && m.area === spec.area && plannedCodes.has(m.code),
  );
  const suggestions = modules.filter(
    (m) => !m.placeholder && m.area === spec.area && !plannedCodes.has(m.code),
  );

  return {
    name: spec.name,
    area: spec.area,
    required: spec.approxCoursesRequired,
    plannedCourses,
    stillNeeded: Math.max(0, spec.approxCoursesRequired - plannedCourses.length),
    suggestions,
  };
}

export function moduleTitle(code: string): string {
  return moduleByCode[code]?.title ?? code;
}
