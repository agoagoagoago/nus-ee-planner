// Shared types for the NUS EE Course Planner.
// The data that fills these shapes lives in src/data/curriculum.ts and is the
// app's single source of curriculum truth, hand-derived from docs/nus_ee_guide.html.

/**
 * Provenance is the report's three-way labelling, carried through into the UI so
 * users always know what they're looking at:
 *  - official        — sourced from NUS/CDE/ECE (has a source id like "S5")
 *  - interpretation  — groupings/readings (career pathways, area descriptions, the
 *                      derived per-semester recommended schedule)
 *  - heuristic       — the unofficial 1–5 difficulty/workload/etc. estimates
 */
export type Provenance = 'official' | 'interpretation' | 'heuristic';

export type Category =
  | 'Common Curriculum'
  | 'Engineering Core'
  | 'EE Core'
  | 'Extended-Core Elective'
  | 'Technical Elective'
  | 'Capstone'
  | 'Unrestricted/Other';

/** Technical-elective concentration areas (official, from the ECE electives page). */
export type Area =
  | 'CN'
  | 'ICES'
  | 'CISR'
  | 'MTD'
  | 'PES'
  | 'SAMI'
  | 'MWRF'
  | 'DE'
  | 'GEN'
  | 'Unconfirmed'
  | null;

export const RATING_AXES = [
  'difficulty',
  'workload',
  'math',
  'programming',
  'hardware',
  'project',
] as const;

export type RatingAxis = (typeof RATING_AXES)[number];

/** All values are HEURISTIC estimates on a 1–5 scale (0 = not applicable, e.g. a placeholder slot). */
export interface Ratings {
  difficulty: number;
  workload: number;
  math: number;
  programming: number;
  hardware: number;
  project: number;
}

export interface Module {
  code: string; // e.g. "EE2023"
  altCode?: string; // cross-listed code, e.g. "ME3243" (register once)
  title: string;
  units: number; // default 4; some 2; capstone/IA larger
  category: Category;
  area?: Area; // for electives (incl. extended-core gateways)
  compulsory: boolean;
  chooseOneWith?: string; // mutually-exclusive partner code
  prerequisites: string[]; // module codes; [] if none/unknown
  prereqConfirmed: boolean; // false where the report said "n/f" or "implied"
  ratings: Ratings; // heuristic
  source: string; // source id for code/title/units, e.g. "S5"
  notes?: string; // cross-list / ungrouped / conditional-prereq caveats
  placeholder?: boolean; // true for "your choice" slots (UE, generic elective, GE pillar)
}

export interface Pathway {
  id: string;
  name: string; // e.g. "Robotics & control"
  specialisation: string; // mapped NUS specialisation name
  foundational: string[]; // module codes
  extendedCore: string[];
  technicalElectives: string[];
  skills: string;
  careers: string;
  profile: Ratings; // pathway difficulty profile (heuristic)
  goodFit: string;
  avoid: string;
}

export interface Bucket {
  name: string;
  units: number;
  sub?: { name: string; units: number }[];
}

export interface RecommendedTerm {
  year: number; // 1–4
  sem: number; // 1–2
  targetUnits: number;
  moduleCodes: string[]; // real codes + placeholder tokens (UE / EXT-CORE / TECH-ELEC)
}

export interface Source {
  id: string;
  title: string;
  url: string;
}

/** A named NUS specialisation with the (interpreted) area whose courses count toward it. */
export interface Specialisation {
  name: string;
  area: Area; // primary concentration area its courses come from
  blurb: string;
  /** Typical "≥N courses, ≥M compulsory" rule — a GENERAL pattern, unconfirmed per cohort. */
  approxCoursesRequired: number;
}

// ---- Plan / store shapes (app state, not curriculum data) ----

export type Grade =
  | 'A+'
  | 'A'
  | 'A-'
  | 'B+'
  | 'B'
  | 'B-'
  | 'C+'
  | 'C'
  | 'D+'
  | 'D'
  | 'F'
  | 'S' // satisfactory (S/U) — excluded from CAP
  | 'U'
  | null;

/** One placed course instance in the planner. instanceId is unique (placeholders repeat codes). */
export interface PlannedItem {
  instanceId: string;
  code: string;
  termId: string; // e.g. "Y1S1"
}
