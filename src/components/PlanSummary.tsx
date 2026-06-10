import type { PlannedItem } from '@/types';
import { analyseRequirements } from '@/lib/requirements';

function Bar({ have, target }: { have: number; target: number }) {
  const pct = Math.min(100, Math.round((have / target) * 100));
  const done = have >= target;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-panel-2">
      <div
        className={`h-full rounded-full ${done ? 'bg-teal' : 'bg-copper'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function PlanSummary({ plan }: { plan: PlannedItem[] }) {
  const report = analyseRequirements(plan);

  return (
    <section
      aria-label="Graduation progress"
      className="rounded-xl border border-line bg-white p-4"
    >
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-base font-bold text-ink">Progress to graduation</h2>
        <span className="font-mono text-sm">
          <span className={report.totalHave >= 160 ? 'text-teal-deep' : 'text-copper-deep'}>
            {report.totalHave}
          </span>
          <span className="text-ink-faint"> / {report.totalTarget} units</span>
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {report.buckets.map((b) => (
          <div key={b.name}>
            <div className="mb-1 flex items-baseline justify-between text-xs">
              <span className="font-medium text-ink-soft">{b.name}</span>
              <span className="font-mono text-ink-faint">
                {b.have}/{b.target}
              </span>
            </div>
            <Bar have={b.have} target={b.target} />
            {b.hints.length > 0 && (
              <ul className="mt-1.5 space-y-0.5">
                {b.hints.slice(0, 2).map((h) => (
                  <li key={h} className="text-[11px] text-ink-faint">
                    • {h}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {(report.chooseOneConflicts.length > 0 ||
        (report.capstone.placed && !report.capstone.consecutive)) && (
        <div className="mt-3 space-y-1.5 border-t border-line-soft pt-3">
          {report.chooseOneConflicts.map((c) => (
            <p key={c} className="flex items-start gap-2 text-[13px] text-copper-deep">
              <span aria-hidden>⚠</span>
              {c}
            </p>
          ))}
          {report.capstone.placed && !report.capstone.consecutive && (
            <p className="flex items-start gap-2 text-[13px] text-copper-deep">
              <span aria-hidden>⚠</span>
              {report.capstone.terms.length === 1
                ? 'Capstone is in only one term — it must span two consecutive semesters.'
                : 'Capstone terms are not consecutive — place both halves in adjacent semesters.'}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
