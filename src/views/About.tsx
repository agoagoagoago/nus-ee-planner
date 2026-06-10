import { sources } from '@/data/curriculum';
import { ProvenanceBadge } from '@/components/ProvenanceBadge';

const CAVEATS = [
  'The primary AY2025/26 EE curriculum-structure page (S10) was bot-blocked during research; the 40 / 80 / 40 split is corroborated from other official sources — confirm it for your exact cohort.',
  'Prerequisites & co-requisites: most are marked "not found" here because the structure pages don’t list them course-by-course. Confirm each on NUSMods / the live catalogue before planning a chain.',
  'Exact per-bucket course allocation (10 core + 1 extended-core + 2 technical electives + capstone) — confirm counts and any "at least N from area X" rules against your FFG / CourseReg checklist.',
  'Ungrouped courses EE3703, EE4434 and EE4707 appear on the Courses page but not under any technical-elective area — verify whether they currently count, and in which area.',
  'Specialisation requirements: the 7 names are official, but the exact course lists and the "≥5 courses (≥2 compulsory)" rule used here are a general pattern — confirm for your cohort.',
  'Industrial Attachment options (full attachment / vacation / NOC) and their unit values change periodically — confirm current codes and counts with ECE.',
  'Extended-core list for Power (PES): its gateway is less prominent because EE2022 already sits in the core — confirm which course officially satisfies the extended-core requirement for a power focus.',
  'Unit values: most electives are assumed to be 4 units (EE4032 is 2u; capstone/IA larger). A handful may differ — confirm on the catalogue.',
  'All Difficulty / Workload / Math / Programming / Hardware / Project ratings are unofficial heuristic estimates created for this tool — not NUS data, not from grade distributions.',
];

export function About() {
  return (
    <div className="max-w-3xl">
      <header className="mb-5">
        <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">
          About &amp; verify with NUS
        </h1>
        <p className="mt-1 text-ink-soft">
          What is solid, what is interpreted, what is estimated — and what you must confirm against
          official NUS sources before relying on it.
        </p>
      </header>

      <section className="mb-6 rounded-xl border border-copper/30 bg-copper-tint/40 p-4">
        <h2 className="font-display text-lg font-bold text-copper-deep">
          The non-negotiable caveat
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          This is an{' '}
          <strong>unofficial planning aid, not affiliated with or endorsed by NUS.</strong> All
          difficulty/workload/intensity ratings are heuristic estimates. NUS does not publish module
          difficulty ratings; these are not derived from grade data and will not match every
          student&apos;s experience or instructor. Use them to plan balance and sequence — never as
          the sole basis for a course decision, and never represent them as official NUS figures.
          Verify everything against the official NUS course catalogue / NUSMods and your
          faculty&apos;s CourseReg / Four-Year Guide.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-display text-lg font-bold text-ink">Three kinds of information</h2>
        <ul className="space-y-2 text-sm">
          <li className="flex gap-3">
            <ProvenanceBadge type="official" />
            <span className="text-ink-soft">
              Taken from official NUS / CDE / ECE pages and curriculum PDFs (each carries a source
              id below). Authoritative — but re-check against your own CourseReg checklist.
            </span>
          </li>
          <li className="flex gap-3">
            <ProvenanceBadge type="interpretation" />
            <span className="text-ink-soft">
              Groupings and readings of official material — career pathways, area descriptions, the
              per-semester recommended schedule. Reasonable, but not an official NUS classification.
            </span>
          </li>
          <li className="flex gap-3">
            <ProvenanceBadge type="heuristic" />
            <span className="text-ink-soft">
              Unofficial 1–5 difficulty / workload / intensity estimates invented for this tool.
            </span>
          </li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-display text-lg font-bold text-ink">
          Validate against NUS — checklist
        </h2>
        <ul className="space-y-2">
          {CAVEATS.map((c) => (
            <li
              key={c}
              className="flex items-start gap-2 rounded-lg border border-line bg-white p-3 text-[13px] text-ink-soft"
            >
              <span aria-hidden className="mt-0.5 text-copper-deep">
                ☐
              </span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-display text-lg font-bold text-ink">Sources</h2>
        <p className="mb-3 text-sm text-ink-soft">
          All official NUS / CDE / ECE pages and curriculum PDFs used to build this tool. Always
          re-check the live pages for your exact cohort.
        </p>
        <ol className="space-y-2 text-[13px]">
          {sources.map((s) => (
            <li key={s.id} className="flex gap-2">
              <span className="shrink-0 font-mono font-semibold text-copper-deep">[{s.id}]</span>
              <span>
                <span className="text-ink-soft">{s.title}</span>{' '}
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-teal-deep underline"
                >
                  {s.url}
                </a>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <p className="border-t border-line pt-4 text-xs text-ink-faint">
        Prepared as a planning aid for prospective and current NUS Electrical Engineering students
        (AY2025/26 cohort). Not affiliated with or endorsed by NUS.
      </p>
    </div>
  );
}
