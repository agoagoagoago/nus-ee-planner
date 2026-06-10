import { useEffect, useRef } from 'react';
import { usePlannerStore } from '@/store/usePlannerStore';
import { ProvenanceBadge } from './ProvenanceBadge';

export function OnboardingModal() {
  const seen = usePlannerStore((s) => s.onboardingSeen);
  const markSeen = usePlannerStore((s) => s.markOnboardingSeen);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!seen) closeRef.current?.focus();
  }, [seen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') markSeen();
    };
    if (!seen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [seen, markSeen]);

  if (seen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl bg-paper p-6 shadow-xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-copper-deep">
          Before you start
        </p>
        <h2 id="onboarding-title" className="mt-1 font-display text-2xl font-bold text-ink">
          Three kinds of information
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          This planner blends data with different reliability. Everything is tagged so you always
          know what you&apos;re looking at:
        </p>

        <ul className="mt-4 space-y-3 text-sm">
          <li className="flex gap-3">
            <ProvenanceBadge type="official" />
            <span className="text-ink-soft">
              Taken from official NUS / CDE / ECE pages and curriculum PDFs. Authoritative — but
              still re-check against your own CourseReg checklist.
            </span>
          </li>
          <li className="flex gap-3">
            <ProvenanceBadge type="interpretation" />
            <span className="text-ink-soft">
              Groupings and readings of official material (career pathways, area descriptions).
              Reasonable, but not an official NUS classification.
            </span>
          </li>
          <li className="flex gap-3">
            <ProvenanceBadge type="heuristic" />
            <span className="text-ink-soft">
              Unofficial 1–5 difficulty / workload / intensity estimates invented for this tool.
              <strong> Not NUS ratings, not from grade data.</strong> Use them only to balance and
              sequence your plan.
            </span>
          </li>
        </ul>

        <div className="mt-5 rounded-lg border border-line bg-panel p-3 text-[13px] text-ink-soft">
          Data is for the <strong>AY2025/26</strong> cohort. This tool is not affiliated with or
          endorsed by NUS.
        </div>

        <div className="mt-6 flex justify-end">
          <button
            ref={closeRef}
            type="button"
            onClick={markSeen}
            className="rounded-lg bg-copper px-4 py-2 text-sm font-semibold text-white hover:bg-copper-deep"
          >
            Got it — explore the planner
          </button>
        </div>
      </div>
    </div>
  );
}
