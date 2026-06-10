import type { Module } from '@/types';
import { AREA_LABELS, moduleByCode } from '@/data/curriculum';
import { ProvenanceBadge } from './ProvenanceBadge';
import { RatingMeter } from './RatingMeter';

const CATEGORY_STYLE: Record<string, string> = {
  'Common Curriculum': 'bg-teal-tint text-teal-deep',
  'Engineering Core': 'bg-[#EEF0F4] text-[#475068]',
  'EE Core': 'bg-copper-tint text-copper-deep',
  'Extended-Core Elective': 'bg-[#EEF3DD] text-[#5A6B22]',
  'Technical Elective': 'bg-[#E3F0F0] text-teal-deep',
  Capstone: 'bg-[#F8E4D4] text-[#9C521F]',
  'Unrestricted/Other': 'bg-panel text-ink-soft',
};

interface Props {
  module: Module;
  action?: React.ReactNode;
  compact?: boolean;
}

export function ModuleCard({ module: m, action, compact = false }: Props) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-line bg-white p-4 shadow-sm">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-semibold text-copper-deep">{m.code}</span>
            {m.altCode && (
              <span
                className="font-mono text-xs text-ink-faint"
                title="Cross-listed — register once"
              >
                / {m.altCode}
              </span>
            )}
            <span className="font-mono text-xs text-ink-faint">{m.units}u</span>
          </div>
          <h3 className="mt-0.5 font-display text-[15px] font-semibold leading-tight text-ink">
            {m.title}
          </h3>
        </div>
        {action}
      </header>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span
          className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${CATEGORY_STYLE[m.category] ?? 'bg-panel text-ink-soft'}`}
        >
          {m.category}
        </span>
        {m.area && (
          <span
            className="rounded bg-panel px-1.5 py-0.5 font-mono text-[11px] text-ink-soft"
            title={AREA_LABELS[m.area] ?? m.area}
          >
            {m.area}
          </span>
        )}
        {m.area === 'Unconfirmed' && <ProvenanceBadge type="interpretation" />}
      </div>

      {!compact && (
        <>
          {/* Prerequisites */}
          <div className="mt-3">
            <p className="mb-1 font-mono text-[10px] uppercase tracking-wide text-ink-faint">
              Prerequisites
            </p>
            {m.prerequisites.length === 0 ? (
              <p className="text-xs text-ink-soft">
                {m.prereqConfirmed
                  ? 'None.'
                  : 'Not found in sources — verify on NUSMods / the live catalogue.'}
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {m.prerequisites.map((p) => (
                  <span
                    key={p}
                    className="rounded border border-line bg-panel px-1.5 py-0.5 font-mono text-[11px] text-ink-soft"
                    title={moduleByCode[p]?.title ?? p}
                  >
                    {p}
                  </span>
                ))}
                {!m.prereqConfirmed && (
                  <span className="text-[11px] italic text-copper-deep" title="Verify with NUS">
                    (unconfirmed)
                  </span>
                )}
              </div>
            )}
          </div>

          {m.chooseOneWith && (
            <p className="mt-2 text-xs text-ink-soft">
              Choose one with{' '}
              <span className="font-mono font-medium text-copper-deep">{m.chooseOneWith}</span>.
            </p>
          )}
          {m.notes && <p className="mt-2 text-xs italic text-ink-faint">{m.notes}</p>}

          {/* Ratings */}
          {!m.placeholder && (
            <div className="mt-3 border-t border-line-soft pt-3">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                  Intensity (1–5)
                </span>
                <ProvenanceBadge type="heuristic" />
              </div>
              <RatingMeter ratings={m.ratings} />
            </div>
          )}
        </>
      )}
    </article>
  );
}
