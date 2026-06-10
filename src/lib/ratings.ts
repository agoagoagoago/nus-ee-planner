import type { RatingAxis } from '@/types';

export const AXIS_LABELS: Record<RatingAxis, string> = {
  difficulty: 'Difficulty',
  workload: 'Workload',
  math: 'Math',
  programming: 'Programming',
  hardware: 'Hardware / lab',
  project: 'Project',
};

export const AXIS_TIPS: Record<RatingAxis, string> = {
  difficulty: 'Conceptual hardness of the material (heuristic 1–5).',
  workload: 'Time and assessment load across the semester (heuristic 1–5).',
  math: 'How maths-intensive the course is (heuristic 1–5).',
  programming: 'How much coding the course demands (heuristic 1–5).',
  hardware: 'Lab / hardware / bring-up intensity (heuristic 1–5).',
  project: 'Project intensity — large, deadline-driven deliverables (heuristic 1–5).',
};

// Heat scale 1 (green) → 3 (amber) → 5 (red). The number is always shown alongside.
const HEAT: Record<number, string> = {
  0: 'bg-panel text-ink-faint',
  1: 'bg-[#E7F2E9] text-[#2F6B45]',
  2: 'bg-[#EEF3DD] text-[#5A6B22]',
  3: 'bg-[#FBF1D7] text-[#8A6310]',
  4: 'bg-[#F8E4D4] text-[#9C521F]',
  5: 'bg-[#F6D9D2] text-[#9E3A2B]',
};

export function heatClass(v: number): string {
  return HEAT[v] ?? HEAT[0]!;
}
