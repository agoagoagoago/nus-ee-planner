import { useState } from 'react';
import { AREA_BLURBS, AREA_LABELS, specialisations } from '@/data/curriculum';
import { usePlannerStore } from '@/store/usePlannerStore';
import { specialisationProgress } from '@/lib/specialisation';
import { ProvenanceBadge } from '@/components/ProvenanceBadge';
import { ModuleCard } from '@/components/ModuleCard';

export function Specialisation() {
  const plan = usePlannerStore((s) => s.plan);
  const target = usePlannerStore((s) => s.targetSpecialisation);
  const setTarget = usePlannerStore((s) => s.setTargetSpecialisation);

  // Tracker uses a specialisation name; fall back to the first if the stored target is a pathway name.
  const [picked, setPicked] = useState<string>(
    specialisations.find((s) => s.name === target)?.name ?? specialisations[0]!.name,
  );

  const progress = specialisationProgress(plan, picked);
  const pct = progress
    ? Math.min(100, Math.round((progress.plannedCourses.length / progress.required) * 100))
    : 0;

  return (
    <div>
      <header className="mb-5">
        <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">
          Specialisation tracker
        </h1>
        <p className="mt-1 max-w-2xl text-ink-soft">
          Pick a target specialisation and see how many of its area courses you&apos;ve planned —
          unrestricted electives that are area courses count automatically. Specialisation{' '}
          <em>names</em> are <ProvenanceBadge type="official" />; the exact required-course list and
          the &ldquo;≥5 courses&rdquo; rule are an <ProvenanceBadge type="interpretation" /> —
          confirm with ECE (see About).
        </p>
      </header>

      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-white p-4">
        <label className="text-sm font-medium text-ink">
          Target specialisation
          <select
            value={picked}
            onChange={(e) => {
              setPicked(e.target.value);
              setTarget(e.target.value);
            }}
            className="ml-2 rounded-lg border border-line bg-paper px-3 py-2 text-sm font-normal"
          >
            {specialisations.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {progress && (
        <>
          <section className="mb-5 rounded-xl border border-line bg-white p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2 className="font-display text-lg font-bold text-ink">{progress.name}</h2>
                <p className="text-sm text-ink-soft">
                  Area{' '}
                  <span
                    className="font-mono text-teal-deep"
                    title={AREA_LABELS[progress.area ?? '']}
                  >
                    {progress.area}
                  </span>{' '}
                  — {AREA_BLURBS[progress.area ?? '']}
                </p>
              </div>
              <span className="font-mono text-sm">
                <span
                  className={progress.stillNeeded === 0 ? 'text-teal-deep' : 'text-copper-deep'}
                >
                  {progress.plannedCourses.length}
                </span>
                <span className="text-ink-faint"> / ~{progress.required} courses</span>
              </span>
            </div>

            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-panel-2">
              <div
                className={`h-full rounded-full ${progress.stillNeeded === 0 ? 'bg-teal' : 'bg-copper'}`}
                style={{ width: `${pct}%` }}
              />
            </div>

            <p className="mt-3 text-sm text-ink-soft">
              {progress.stillNeeded === 0
                ? `You have planned enough ${progress.area} courses to typically qualify — confirm the exact list with ECE.`
                : `Plan ${progress.stillNeeded} more ${progress.area} course${
                    progress.stillNeeded === 1 ? '' : 's'
                  } (use technical electives and unrestricted electives).`}
            </p>
          </section>

          {progress.plannedCourses.length > 0 && (
            <section className="mb-6">
              <h3 className="mb-2 font-display text-base font-bold text-ink">
                Planned {progress.area} courses ({progress.plannedCourses.length})
              </h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {progress.plannedCourses.map((m) => (
                  <ModuleCard key={m.code} module={m} compact />
                ))}
              </div>
            </section>
          )}

          {progress.suggestions.length > 0 && (
            <section>
              <h3 className="mb-2 font-display text-base font-bold text-ink">
                Other {progress.area} courses you could add
              </h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {progress.suggestions.map((m) => (
                  <ModuleCard key={m.code} module={m} compact />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
