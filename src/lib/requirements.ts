import type { Category, PlannedItem } from '@/types';
import { moduleByCode } from '@/data/curriculum';
import { termIndex } from './terms';
import { capstoneTerms } from './plan';

/** Sum units for a category. Non-placeholder modules count once per distinct code
 *  (so the 8u capstone and accidental duplicates don't double-count); placeholder
 *  slots (UE / TECH-ELEC / EXT-CORE) legitimately count per instance. */
function categoryUnits(plan: PlannedItem[], category: Category): number {
  let total = 0;
  const seen = new Set<string>();
  for (const it of plan) {
    const m = moduleByCode[it.code];
    if (!m || m.category !== category) continue;
    if (m.placeholder) {
      total += m.units;
    } else if (!seen.has(m.code)) {
      seen.add(m.code);
      total += m.units;
    }
  }
  return total;
}

export interface BucketProgress {
  name: string;
  have: number;
  target: number;
  hints: string[];
}

export interface CapstoneStatus {
  placed: boolean;
  terms: string[];
  consecutive: boolean;
}

export interface RequirementReport {
  buckets: BucketProgress[];
  totalHave: number;
  totalTarget: number;
  chooseOneConflicts: string[];
  capstone: CapstoneStatus;
}

const has = (plan: PlannedItem[], code: string) => plan.some((it) => it.code === code);

export function analyseRequirements(plan: PlannedItem[]): RequirementReport {
  const both = (a: string, b: string) => has(plan, a) && has(plan, b);

  // --- Common Curriculum (40u) ---
  let commonHave = categoryUnits(plan, 'Common Curriculum');
  if (both('EE2211', 'EE2213')) commonHave -= 4; // choose-one: count one
  commonHave = Math.min(commonHave, 40);

  // --- Engineering Core (20u) ---
  const engHave = Math.min(categoryUnits(plan, 'Engineering Core'), 20);

  // --- EE Major Programme (60u) ---
  const eeCoreHave = Math.min(categoryUnits(plan, 'EE Core'), 40);
  const extRaw = categoryUnits(plan, 'Extended-Core Elective');
  const teRaw = categoryUnits(plan, 'Technical Elective');
  const capPlaced = capstoneTerms(plan).length > 0;
  const capHave = capPlaced ? 8 : 0;

  const extCapped = Math.min(extRaw, 4);
  const teCapped = Math.min(teRaw, 8);
  const overflow = extRaw - extCapped + (teRaw - teCapped); // surplus electives spill to UE

  const eeMajorHave = eeCoreHave + extCapped + teCapped + capHave;

  // Major Requirements bucket = Engineering Core (20) + EE Major Programme (60)
  const majorHave = engHave + eeMajorHave;

  // --- Unrestricted Electives (40u) ---
  const ueHave = Math.min(categoryUnits(plan, 'Unrestricted/Other') + overflow, 40);

  // --- hints ---
  const commonHints: string[] = [];
  if (!both('EE2211', 'EE2213') && !has(plan, 'EE2211') && !has(plan, 'EE2213'))
    commonHints.push('Add the intro ML/AI course (EE2211 or EE2213).');
  if (commonHave < 40) commonHints.push(`${40 - commonHave}u of Common Curriculum still to place.`);

  const majorHints: string[] = [];
  if (eeCoreHave < 40) majorHints.push(`${(40 - eeCoreHave) / 4} EE core course(s) still missing.`);
  if (extCapped < 4) majorHints.push('Add 1 extended-core elective (a 3000-level gateway).');
  if (teCapped < 8)
    majorHints.push(`Add ${(8 - teCapped) / 4} more technical elective(s) (need 2).`);
  if (!capPlaced) majorHints.push('Add a capstone (EE4002D or EE4002R) across two terms.');
  if (engHave < 20) majorHints.push(`${20 - engHave}u of Engineering Core still to place.`);

  const ueHints: string[] = [];
  if (ueHave < 40) ueHints.push(`${40 - ueHave}u of Unrestricted Electives still to place.`);
  if (overflow > 0) ueHints.push(`${overflow}u of surplus electives are counting as UE.`);

  // --- choose-one conflicts ---
  const chooseOneConflicts: string[] = [];
  if (both('EE2211', 'EE2213'))
    chooseOneConflicts.push(
      'EE2211 and EE2213 are a choose-one — keep only one (only one counts).',
    );
  if (both('EE4002D', 'EE4002R'))
    chooseOneConflicts.push('EE4002D and EE4002R are a choose-one capstone — keep only one track.');

  // --- capstone adjacency ---
  const capTerms = capstoneTerms(plan);
  let consecutive = false;
  if (capTerms.length >= 2) {
    const idxs = capTerms.map(termIndex).sort((a, b) => a - b);
    consecutive = idxs[1]! - idxs[0]! === 1;
  } else if (capTerms.length === 1) {
    consecutive = false;
  }

  return {
    buckets: [
      { name: 'Common Curriculum', have: commonHave, target: 40, hints: commonHints },
      { name: 'Major Requirements', have: Math.min(majorHave, 80), target: 80, hints: majorHints },
      { name: 'Unrestricted Electives', have: ueHave, target: 40, hints: ueHints },
    ],
    totalHave: commonHave + Math.min(majorHave, 80) + ueHave,
    totalTarget: 160,
    chooseOneConflicts,
    capstone: { placed: capPlaced, terms: capTerms, consecutive },
  };
}
