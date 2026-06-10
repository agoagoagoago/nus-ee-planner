/* eslint-disable no-console */
// Dev-only data assertion. Run with `npm run check:data` (tsx).
// `import type` from '@/types' inside curriculum.ts is erased at runtime, so the
// '@' alias never needs resolving here — a plain relative import is enough.
import {
  modules,
  pathways,
  recommendedSchedule,
  sources,
  specialisations,
  structure,
  moduleByCode,
  TOTAL_UNITS,
} from '../src/data/curriculum.ts';

const VALID_CATEGORIES = new Set([
  'Common Curriculum',
  'Engineering Core',
  'EE Core',
  'Extended-Core Elective',
  'Technical Elective',
  'Capstone',
  'Unrestricted/Other',
]);

const VALID_AREAS = new Set([
  'CN',
  'ICES',
  'CISR',
  'MTD',
  'PES',
  'SAMI',
  'MWRF',
  'DE',
  'GEN',
  'Unconfirmed',
]);

const errors: string[] = [];
const check = (cond: boolean, msg: string) => {
  if (!cond) errors.push(msg);
};

// 1. Top-level structure sums to 160, with the 40 / 80 / 40 split + sub-buckets.
const total = structure.reduce((s, b) => s + b.units, 0);
check(total === TOTAL_UNITS, `Structure buckets sum to ${total}, expected ${TOTAL_UNITS}.`);

const byName = Object.fromEntries(structure.map((b) => [b.name, b]));
check(byName['Common Curriculum']?.units === 40, 'Common Curriculum must be 40u.');
check(byName['Major Requirements']?.units === 80, 'Major Requirements must be 80u.');
check(byName['Unrestricted Electives']?.units === 40, 'Unrestricted Electives must be 40u.');
for (const b of structure) {
  if (b.sub) {
    const subSum = b.sub.reduce((s, x) => s + x.units, 0);
    check(subSum === b.units, `Sub-buckets of "${b.name}" sum to ${subSum}, expected ${b.units}.`);
  }
}

// 2. Every module has a valid category and area; ratings in range.
for (const m of modules) {
  check(VALID_CATEGORIES.has(m.category), `${m.code}: invalid category "${m.category}".`);
  if (m.area != null) check(VALID_AREAS.has(m.area), `${m.code}: invalid area "${m.area}".`);
  for (const [axis, v] of Object.entries(m.ratings)) {
    const ok = m.placeholder ? v >= 0 && v <= 5 : v >= 1 && v <= 5;
    check(ok, `${m.code}: rating ${axis}=${v} out of range.`);
  }
  // Prerequisite references must resolve to a known module code.
  for (const p of m.prerequisites) {
    check(!!moduleByCode[p], `${m.code}: prerequisite "${p}" is not a known module.`);
  }
}

// 3. Choose-one pairs are symmetric.
const pairs: [string, string][] = [
  ['EE2211', 'EE2213'],
  ['EE4002D', 'EE4002R'],
];
for (const [a, b] of pairs) {
  check(moduleByCode[a]?.chooseOneWith === b, `${a} must be chooseOneWith ${b}.`);
  check(moduleByCode[b]?.chooseOneWith === a, `${b} must be chooseOneWith ${a}.`);
}

// 4. Cross-listed modules carry their altCode (register once).
const crossListed: [string, string][] = [
  ['EE3305', 'ME3243'],
  ['EE3306', 'ME3163'],
  ['EE4802', 'IE4213'],
];
for (const [code, alt] of crossListed) {
  check(moduleByCode[code]?.altCode === alt, `${code} must be cross-listed as ${alt}.`);
}

// 5. Ungrouped courses marked area "Unconfirmed".
for (const code of ['EE3703', 'EE4434', 'EE4707']) {
  check(moduleByCode[code]?.area === 'Unconfirmed', `${code} must have area "Unconfirmed".`);
}

// 6. All 9 concentration areas present among the modules.
const presentAreas = new Set(modules.map((m) => m.area).filter(Boolean));
for (const area of ['CN', 'ICES', 'CISR', 'MTD', 'PES', 'SAMI', 'MWRF', 'DE', 'GEN']) {
  check(presentAreas.has(area as never), `No module found for area ${area}.`);
}

// 7. Recommended schedule: 8 terms, official unit pattern, each term sums correctly.
const pattern = [20, 20, 20, 20, 22, 18, 20, 20];
check(recommendedSchedule.length === 8, 'Recommended schedule must have 8 terms.');
let schedTotal = 0;
recommendedSchedule.forEach((t, i) => {
  check(
    t.targetUnits === pattern[i],
    `Term ${i + 1} targetUnits ${t.targetUnits}, expected ${pattern[i]}.`,
  );
  const termUnits = t.moduleCodes.reduce((s, code) => {
    const m = moduleByCode[code];
    if (!m) {
      errors.push(`Recommended term Y${t.year}S${t.sem} references unknown code "${code}".`);
      return s;
    }
    // Capstone (8u) spans two consecutive terms → counts 4u per term.
    return s + (m.category === 'Capstone' ? m.units / 2 : m.units);
  }, 0);
  check(
    termUnits === t.targetUnits,
    `Term Y${t.year}S${t.sem} units ${termUnits} != target ${t.targetUnits}.`,
  );
  schedTotal += termUnits;
});
check(
  schedTotal === TOTAL_UNITS,
  `Recommended schedule totals ${schedTotal}, expected ${TOTAL_UNITS}.`,
);

// 8. Counts: 8 pathways, 7 specialisations, 11 sources.
check(pathways.length === 8, `Expected 8 pathways, found ${pathways.length}.`);
check(specialisations.length === 7, `Expected 7 specialisations, found ${specialisations.length}.`);
check(sources.length === 11, `Expected 11 sources (S1–S11), found ${sources.length}.`);

// Pathway module references must resolve.
for (const p of pathways) {
  for (const code of [...p.foundational, ...p.extendedCore, ...p.technicalElectives]) {
    check(!!moduleByCode[code], `Pathway "${p.name}" references unknown module "${code}".`);
  }
}

if (errors.length) {
  console.error(`\n❌ Data check FAILED with ${errors.length} issue(s):`);
  for (const e of errors) console.error('  • ' + e);
  process.exit(1);
} else {
  console.log(
    `✅ Data check passed — ${modules.length} modules, ${pathways.length} pathways, ` +
      `${specialisations.length} specialisations, buckets sum to ${TOTAL_UNITS}.`,
  );
}
