import { useMemo } from 'react';
import type { Grade } from '@/types';
import { usePlannerStore } from '@/store/usePlannerStore';
import { TERMS } from '@/lib/terms';
import { computeGpa, gradeEntries, GRADE_OPTIONS } from '@/lib/gpa';
import { ProvenanceBadge } from '@/components/ProvenanceBadge';

function fmt(n: number | null): string {
  return n == null ? '—' : n.toFixed(2);
}

export function Gpa() {
  const plan = usePlannerStore((s) => s.plan);
  const grades = usePlannerStore((s) => s.grades);
  const setGrade = usePlannerStore((s) => s.setGrade);

  const entries = useMemo(() => gradeEntries(plan, grades), [plan, grades]);
  const result = useMemo(() => computeGpa(entries), [entries]);

  const byTerm = useMemo(() => {
    const map: Record<string, typeof entries> = {};
    for (const t of TERMS) map[t.id] = [];
    for (const e of entries) (map[e.termId] ??= []).push(e);
    return map;
  }, [entries]);

  const sensitivityById = useMemo(
    () => Object.fromEntries(result.sensitivity.map((s) => [s.instanceId, s.swing])),
    [result.sensitivity],
  );

  return (
    <div>
      <header className="mb-5">
        <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">GPA what-if</h1>
        <p className="mt-1 max-w-2xl text-ink-soft">
          Enter real and hypothetical grades for your planned modules to project your CAP. The grade
          points use the NUS 5.00 scale (<ProvenanceBadge type="official" />{' '}
          <span className="italic">confirm the current NUS grade-point scale</span>). S/U grades are
          excluded from the CAP.
        </p>
      </header>

      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-white p-8 text-center text-ink-soft">
          Your plan is empty. Add modules in the{' '}
          <a href="#/planner" className="font-medium text-teal-deep underline">
            Planner
          </a>{' '}
          first, then come back to simulate grades.
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          {/* Grade entry by term */}
          <div className="space-y-4">
            {TERMS.map((t) => {
              const list = byTerm[t.id] ?? [];
              if (list.length === 0) return null;
              const termGpa = result.perTerm.find((p) => p.termId === t.id);
              return (
                <section key={t.id} className="rounded-xl border border-line bg-white p-4">
                  <div className="mb-2 flex items-baseline justify-between">
                    <h2 className="font-display text-sm font-bold text-ink">{t.label}</h2>
                    <span className="font-mono text-xs text-ink-soft">
                      Sem GPA:{' '}
                      <span className="font-semibold text-ink">{fmt(termGpa?.gpa ?? null)}</span>
                    </span>
                  </div>
                  <ul className="divide-y divide-line-soft">
                    {list.map((e) => (
                      <li key={e.instanceId} className="flex items-center gap-3 py-1.5">
                        <span className="w-20 shrink-0 font-mono text-xs font-semibold text-copper-deep">
                          {e.code}
                        </span>
                        <span
                          className="min-w-0 flex-1 truncate text-xs text-ink-soft"
                          title={e.title}
                        >
                          {e.title}
                        </span>
                        <span className="shrink-0 font-mono text-[10px] text-ink-faint">
                          {e.units}u
                        </span>
                        {sensitivityById[e.instanceId] != null && (
                          <span
                            className="shrink-0 rounded bg-copper-tint px-1 font-mono text-[10px] text-copper-deep"
                            title="How much this grade can swing your cumulative CAP"
                          >
                            ±{sensitivityById[e.instanceId]}
                          </span>
                        )}
                        <select
                          value={e.grade ?? ''}
                          onChange={(ev) =>
                            setGrade(e.instanceId, (ev.target.value || null) as Grade)
                          }
                          className="shrink-0 rounded border border-line bg-paper px-1.5 py-1 text-xs"
                          aria-label={`Grade for ${e.code}`}
                        >
                          <option value="">—</option>
                          {GRADE_OPTIONS.map((g) => (
                            <option key={g} value={g ?? ''}>
                              {g}
                            </option>
                          ))}
                        </select>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-line bg-white p-4">
              <p className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                Projected cumulative CAP
              </p>
              <p className="mt-1 font-display text-4xl font-bold text-ink">
                {fmt(result.cumulative)}
              </p>
              <p className="mt-1 text-xs text-ink-soft">
                over {result.gradedUnits} graded units (out of 5.00)
              </p>

              {result.sensitivity.length > 0 && (
                <div className="mt-4 border-t border-line-soft pt-3">
                  <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                    Moves the needle most
                  </p>
                  <ul className="space-y-1">
                    {result.sensitivity.slice(0, 5).map((s) => (
                      <li key={s.instanceId} className="flex items-center justify-between text-xs">
                        <span className="font-mono text-copper-deep">{s.code}</span>
                        <span className="text-ink-faint">
                          {s.units}u · ±{s.swing} swing
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[11px] text-ink-faint">
                    Swing = how far your cumulative CAP could move once this ungraded module is
                    graded.
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
