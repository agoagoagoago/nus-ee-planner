import type { PlannedItem } from '@/types';
import { moduleByCode } from '@/data/curriculum';
import { termIndex } from './terms';
import { earliestTermOf } from './plan';

export interface PrereqIssue {
  instanceId: string;
  code: string;
  termId: string;
  /** prerequisites that are missing from the plan entirely */
  missing: string[];
  /** prerequisites present but not in a strictly earlier term */
  outOfOrder: string[];
  /** true when the module's prerequisites are themselves unconfirmed (report said n/f) */
  unconfirmed: boolean;
}

/**
 * A module's prerequisites must all sit in a STRICTLY earlier term.
 * Missing or same/later-term prerequisites are flagged. Where prereqConfirmed is
 * false we still surface a softer "verify with NUS" note rather than a hard error.
 */
export function prereqIssues(plan: PlannedItem[]): PrereqIssue[] {
  const issues: PrereqIssue[] = [];
  for (const item of plan) {
    const m = moduleByCode[item.code];
    if (!m || m.prerequisites.length === 0) continue;

    const myIdx = termIndex(item.termId);
    const missing: string[] = [];
    const outOfOrder: string[] = [];

    for (const pre of m.prerequisites) {
      const preTerm = earliestTermOf(plan, pre);
      if (preTerm == null) {
        missing.push(pre);
      } else if (termIndex(preTerm) >= myIdx) {
        outOfOrder.push(pre);
      }
    }

    if (missing.length || outOfOrder.length) {
      issues.push({
        instanceId: item.instanceId,
        code: item.code,
        termId: item.termId,
        missing,
        outOfOrder,
        unconfirmed: !m.prereqConfirmed,
      });
    }
  }
  return issues;
}
