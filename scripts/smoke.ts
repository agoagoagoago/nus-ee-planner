/* eslint-disable no-console */
// Logic smoke test for the planner "intelligence" against the recommended plan.
// Run with: npx tsx scripts/smoke.ts
import type { PlannedItem } from '../src/types/index.ts';
import { recommendedSchedule } from '../src/data/curriculum.ts';
import { totalPlannedUnits } from '../src/lib/plan.ts';
import { computeTermLoads } from '../src/lib/loadBalance.ts';
import { prereqIssues } from '../src/lib/prerequisites.ts';
import { analyseRequirements } from '../src/lib/requirements.ts';

let id = 0;
const plan: PlannedItem[] = recommendedSchedule.flatMap((t) =>
  t.moduleCodes.map((code) => ({ instanceId: `i${id++}`, code, termId: `Y${t.year}S${t.sem}` })),
);

const fail: string[] = [];
const expect = (cond: boolean, msg: string) => {
  if (!cond) fail.push(msg);
};

// Total units
const total = totalPlannedUnits(plan);
expect(total === 160, `Recommended plan totals ${total}, expected 160.`);

// Prereqs: the recommended schedule should be order-clean (no missing/out-of-order).
const issues = prereqIssues(plan);
const hardIssues = issues.filter((i) => i.missing.length || i.outOfOrder.length);
expect(
  hardIssues.length === 0,
  `Recommended plan has ${hardIssues.length} prereq ordering issue(s): ${hardIssues.map((i) => `${i.code}@${i.termId}`).join(', ')}`,
);

// Requirements: 40 / 80 / 40, capstone consecutive, no choose-one conflicts.
const req = analyseRequirements(plan);
expect(req.totalHave === 160, `Requirement total ${req.totalHave}, expected 160.`);
for (const b of req.buckets) {
  expect(b.have === b.target, `Bucket "${b.name}" ${b.have}/${b.target} — expected full.`);
}
expect(
  req.capstone.placed && req.capstone.consecutive,
  'Capstone should be placed across two consecutive terms.',
);
expect(
  req.chooseOneConflicts.length === 0,
  `Unexpected choose-one conflicts: ${req.chooseOneConflicts.join('; ')}`,
);

// Loads: each term within the recommended pattern should not be flagged "overloaded".
const loads = computeTermLoads(plan);
const overloaded = loads.filter((l) => l.warnings.some((w) => w.message.startsWith('Overloaded')));
expect(
  overloaded.length === 0,
  `Recommended terms flagged overloaded: ${overloaded.map((l) => l.termId).join(', ')}`,
);

// Sanity: per-term units match the official pattern.
const pattern = [20, 20, 20, 20, 22, 18, 20, 20];
loads.forEach((l, i) => {
  expect(l.units === pattern[i], `Term ${l.termId} units ${l.units}, expected ${pattern[i]}.`);
});

if (fail.length) {
  console.error(`\n❌ Smoke test FAILED (${fail.length}):`);
  fail.forEach((f) => console.error('  • ' + f));
  process.exit(1);
} else {
  console.log(
    `✅ Planner logic smoke passed — 160u total, prereq-clean, buckets 40/80/40, capstone consecutive.`,
  );
  // Show that warnings DO fire on a deliberately bad plan.
  const badPlan: PlannedItem[] = [
    { instanceId: 'b1', code: 'PC2020', termId: 'Y2S1' },
    { instanceId: 'b2', code: 'EE2023', termId: 'Y2S1' },
    { instanceId: 'b3', code: 'EE2012', termId: 'Y2S1' },
  ];
  const badLoad = computeTermLoads(badPlan).find((l) => l.termId === 'Y2S1')!;
  console.log(
    `   Sanity (maths-crunch stack PC2020+EE2023+EE2012): ${badLoad.warnings.length} warning(s) fired.`,
  );
}
