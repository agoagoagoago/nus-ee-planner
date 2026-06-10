import type { Area, Pathway } from '@/types';
import { pathways } from '@/data/curriculum';

export type Goal = 'industry' | 'gradschool' | 'undecided';

export interface QuizAnswers {
  interests: string[]; // interest option ids (see INTEREST_OPTIONS)
  mathComfort: number; // 1–5
  hardwareVsSoftware: number; // 1 (software) – 5 (hardware)
  projectTolerance: number; // 1–5
  goal: Goal;
}

export interface InterestOption {
  id: string;
  label: string;
  areas: Area[];
}

export const INTEREST_OPTIONS: InterestOption[] = [
  { id: 'robotics', label: 'Robots, drones & control', areas: ['CISR'] },
  { id: 'ai', label: 'AI, machine learning & computer vision', areas: ['SAMI', 'DE'] },
  { id: 'chips', label: 'Chips & semiconductors (device physics, fabs)', areas: ['MTD'] },
  { id: 'embedded', label: 'Embedded systems, FPGAs & IC design', areas: ['ICES'] },
  { id: 'power', label: 'Power, energy, EVs & renewables', areas: ['PES'] },
  { id: 'rf', label: 'Wireless, RF, satellites & comms', areas: ['MWRF', 'CN'] },
  { id: 'data', label: 'Data engineering & IoT', areas: ['DE', 'CN'] },
];

// Which concentration areas each pathway leans on (for interest matching).
const PATHWAY_AREAS: Record<string, Area[]> = {
  robotics: ['CISR', 'SAMI'],
  'ai-vision': ['SAMI', 'DE'],
  semiconductors: ['MTD'],
  embedded: ['ICES'],
  power: ['PES'],
  'comms-rf': ['MWRF', 'CN'],
  'data-iot': ['CN', 'DE'],
  open: [],
};

// Pathways that lean theoretical/research vs applied/industry (for the goal nudge).
const RESEARCH_LEANING = new Set(['ai-vision', 'comms-rf', 'semiconductors']);
const INDUSTRY_LEANING = new Set(['embedded', 'data-iot', 'power', 'robotics']);

export interface ScoredPathway {
  pathway: Pathway;
  score: number;
  reasons: string[];
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export function scorePathways(a: QuizAnswers): ScoredPathway[] {
  const selectedAreas = new Set<Area>(
    a.interests.flatMap((id) => INTEREST_OPTIONS.find((o) => o.id === id)?.areas ?? []),
  );

  const scored = pathways.map((pathway) => {
    const reasons: string[] = [];
    let score = 0;

    // 1. Interest/area match (strongest signal).
    const pAreas = PATHWAY_AREAS[pathway.id] ?? [];
    const overlap = pAreas.filter((ar) => selectedAreas.has(ar)).length;
    if (overlap > 0) {
      score += overlap * 6;
      reasons.push('Matches an interest area you picked');
    }
    if (pathway.id === 'open' && a.interests.length === 0) {
      score += 8;
      reasons.push('You did not commit to a single area');
    }
    if (pathway.id === 'open' && a.interests.length >= 4) {
      score += 4;
      reasons.push('You are curious about many areas');
    }

    // 2. Maths fit — reward pathways whose math intensity is near (and not far above) your comfort.
    const mathGap = pathway.profile.math - a.mathComfort;
    score += 5 - clamp(Math.abs(mathGap), 0, 5);
    if (mathGap > 1.5) reasons.push('Note: more maths-intense than your stated comfort');
    else if (Math.abs(mathGap) <= 1) reasons.push('Maths intensity suits your comfort');

    // 3. Hardware vs software preference.
    const p = a.hardwareVsSoftware / 5; // 0..1, 1 = hardware
    const hwSwFit = p * pathway.profile.hardware + (1 - p) * pathway.profile.programming;
    score += hwSwFit; // 0..5-ish
    if (a.hardwareVsSoftware >= 4 && pathway.profile.hardware >= 4)
      reasons.push('Hands-on / hardware-heavy, as you prefer');
    if (a.hardwareVsSoftware <= 2 && pathway.profile.programming >= 4)
      reasons.push('Software-heavy, as you prefer');

    // 4. Project tolerance.
    const projGap = pathway.profile.project - a.projectTolerance;
    score += 5 - clamp(Math.abs(projGap), 0, 5);
    if (projGap > 1.5) reasons.push('Heavy on large projects');

    // 5. Goal nudge.
    if (a.goal === 'gradschool' && RESEARCH_LEANING.has(pathway.id)) {
      score += 3;
      reasons.push('Theory-forward — good for grad school');
    }
    if (a.goal === 'industry' && INDUSTRY_LEANING.has(pathway.id)) {
      score += 3;
      reasons.push('Strong industry demand');
    }
    if (a.goal === 'undecided' && pathway.id === 'open') {
      score += 3;
      reasons.push('Keeps your options open');
    }

    return { pathway, score: Math.round(score * 10) / 10, reasons };
  });

  return scored.sort((x, y) => y.score - x.score);
}

export const DEFAULT_ANSWERS: QuizAnswers = {
  interests: [],
  mathComfort: 3,
  hardwareVsSoftware: 3,
  projectTolerance: 3,
  goal: 'undecided',
};
