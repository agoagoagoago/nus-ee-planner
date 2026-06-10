import { useMemo, useState } from 'react';
import type { Area, Category, RatingAxis } from '@/types';
import { RATING_AXES } from '@/types';
import { AREA_LABELS, modules } from '@/data/curriculum';
import { ModuleCard } from '@/components/ModuleCard';
import { AXIS_LABELS } from '@/lib/ratings';
import { ProvenanceBadge } from '@/components/ProvenanceBadge';
import { usePlannerStore } from '@/store/usePlannerStore';

const CATEGORIES: Category[] = [
  'Common Curriculum',
  'Engineering Core',
  'EE Core',
  'Extended-Core Elective',
  'Technical Elective',
  'Capstone',
];

const AREAS: Exclude<Area, null>[] = [
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
];

const realModules = modules.filter((m) => !m.placeholder);

export function Explore() {
  const storeFilters = usePlannerStore((s) => s.explorerFilters);

  const [q, setQ] = useState('');
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [area, setArea] = useState<Area | 'all'>('all');
  const [sortAxis, setSortAxis] = useState<RatingAxis | 'code'>('code');
  const [minFilters, setMinFilters] = useState<Partial<Record<RatingAxis, number>>>(() => {
    // seed from any recommender-set filters
    const seed: Partial<Record<RatingAxis, number>> = {};
    for (const axis of RATING_AXES) {
      const r = storeFilters[axis];
      if (r) seed[axis] = r[0];
    }
    return seed;
  });

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = realModules.filter((m) => {
      if (category !== 'all' && m.category !== category) return false;
      if (area !== 'all' && m.area !== area) return false;
      if (needle && !`${m.code} ${m.altCode ?? ''} ${m.title}`.toLowerCase().includes(needle))
        return false;
      for (const axis of RATING_AXES) {
        const min = minFilters[axis];
        if (min && m.ratings[axis] < min) return false;
      }
      return true;
    });
    if (sortAxis !== 'code') {
      list = [...list].sort((a, b) => b.ratings[sortAxis] - a.ratings[sortAxis]);
    } else {
      list = [...list].sort((a, b) => a.code.localeCompare(b.code));
    }
    return list;
  }, [q, category, area, sortAxis, minFilters]);

  const activeAxisFilters = RATING_AXES.filter((a) => minFilters[a]);

  return (
    <div>
      <header className="mb-5">
        <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">Module Explorer</h1>
        <p className="mt-1 max-w-2xl text-ink-soft">
          Every module on the official EE Courses &amp; Technical Electives pages. Filter by
          category or concentration area, and shortlist by the <em>kind</em> of difficulty you
          prefer (&ldquo;low programming, high hardware&rdquo;). Intensity ratings are{' '}
          <ProvenanceBadge type="heuristic" /> — see the note below.
        </p>
      </header>

      {/* Controls */}
      <div className="mb-5 space-y-3 rounded-xl border border-line bg-white p-4">
        <div className="flex flex-wrap gap-3">
          <label className="flex-1 min-w-[200px]">
            <span className="sr-only">Search modules</span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search code or title (e.g. EE2023, control, vision)…"
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm"
            />
          </label>

          <label className="text-sm">
            <span className="sr-only">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category | 'all')}
              className="rounded-lg border border-line bg-paper px-3 py-2 text-sm"
            >
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <span className="sr-only">Concentration area</span>
            <select
              value={area ?? 'all'}
              onChange={(e) => setArea(e.target.value as Area | 'all')}
              className="rounded-lg border border-line bg-paper px-3 py-2 text-sm"
            >
              <option value="all">All areas</option>
              {AREAS.map((a) => (
                <option key={a} value={a}>
                  {a} — {AREA_LABELS[a]}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <span className="sr-only">Sort by</span>
            <select
              value={sortAxis}
              onChange={(e) => setSortAxis(e.target.value as RatingAxis | 'code')}
              className="rounded-lg border border-line bg-paper px-3 py-2 text-sm"
            >
              <option value="code">Sort: code (A–Z)</option>
              {RATING_AXES.map((a) => (
                <option key={a} value={a}>
                  Sort: {AXIS_LABELS[a]} (high→low)
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Per-axis minimum filters */}
        <div>
          <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-ink-faint">
            Minimum intensity (heuristic) — drag to require at least N on an axis
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
            {RATING_AXES.map((axis) => (
              <label key={axis} className="flex items-center gap-2 text-xs text-ink-soft">
                <span className="w-24 shrink-0">{AXIS_LABELS[axis]}</span>
                <input
                  type="range"
                  min={0}
                  max={5}
                  step={1}
                  value={minFilters[axis] ?? 0}
                  onChange={(e) =>
                    setMinFilters((f) => ({ ...f, [axis]: Number(e.target.value) || undefined }))
                  }
                  className="flex-1 accent-copper"
                  aria-label={`Minimum ${AXIS_LABELS[axis]}`}
                />
                <span className="w-4 text-right font-mono">{minFilters[axis] ?? 0}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-ink-soft">
          <span>
            {results.length} module{results.length === 1 ? '' : 's'}
            {activeAxisFilters.length > 0 &&
              ` · filtering on ${activeAxisFilters.map((a) => AXIS_LABELS[a]).join(', ')}`}
          </span>
          {(activeAxisFilters.length > 0 || category !== 'all' || area !== 'all' || q) && (
            <button
              type="button"
              onClick={() => {
                setQ('');
                setCategory('all');
                setArea('all');
                setSortAxis('code');
                setMinFilters({});
              }}
              className="rounded border border-line px-2 py-1 hover:bg-panel"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-white p-8 text-center text-ink-soft">
          No modules match these filters. Try lowering an intensity minimum or clearing filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {results.map((m) => (
            <ModuleCard key={m.code} module={m} />
          ))}
        </div>
      )}
    </div>
  );
}
