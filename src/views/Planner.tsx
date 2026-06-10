import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import type { Module, PlannedItem } from '@/types';
import { moduleByCode, modules } from '@/data/curriculum';
import { usePlannerStore } from '@/store/usePlannerStore';
import { TERMS, termById } from '@/lib/terms';
import { itemsByTerm, moduleUnitsInTerm } from '@/lib/plan';
import { computeTermLoads, heaviestTerm, type TermWarning } from '@/lib/loadBalance';
import { prereqIssues } from '@/lib/prerequisites';
import { decodePlan, encodePlan, exportPlanJson } from '@/lib/share';
import { PlanSummary } from '@/components/PlanSummary';
import { ProvenanceBadge } from '@/components/ProvenanceBadge';

const TRAY_EXTRA = ['EXT-CORE', 'TECH-ELEC', 'UE', 'EE4002D', 'EE4002R'];
const trayModules = modules.filter((m) => !m.placeholder || TRAY_EXTRA.includes(m.code));

function warnColour(level: TermWarning['level']): string {
  return level === 'danger'
    ? 'text-[#9E3A2B]'
    : level === 'warn'
      ? 'text-copper-deep'
      : 'text-ink-faint';
}

// ---- draggable tray item ----
function TrayItem({ m, onAdd }: { m: Module; onAdd: (code: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `tray:${m.code}`,
  });
  return (
    <div
      ref={setNodeRef}
      style={
        transform
          ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 50 }
          : undefined
      }
      className={`flex items-center justify-between gap-2 rounded-lg border border-line bg-white px-2.5 py-1.5 ${
        isDragging ? 'opacity-60 shadow-lg' : ''
      }`}
    >
      <button
        type="button"
        className="flex min-w-0 cursor-grab items-center gap-2 text-left active:cursor-grabbing"
        {...listeners}
        {...attributes}
        aria-label={`Drag ${m.code} ${m.title}`}
      >
        <span className="font-mono text-xs font-semibold text-copper-deep">{m.code}</span>
        <span className="truncate text-xs text-ink-soft">{m.title}</span>
        <span className="shrink-0 font-mono text-[10px] text-ink-faint">{m.units}u</span>
      </button>
      <button
        type="button"
        onClick={() => onAdd(m.code)}
        className="shrink-0 rounded border border-line px-1.5 py-0.5 text-[11px] text-ink-soft hover:bg-panel"
        aria-label={`Add ${m.code} to plan`}
      >
        + Add
      </button>
    </div>
  );
}

// ---- draggable planned card ----
function PlannedCard({
  item,
  onRemove,
  onMove,
  flagged,
}: {
  item: PlannedItem;
  onRemove: (id: string) => void;
  onMove: (id: string, termId: string) => void;
  flagged?: string;
}) {
  const m = moduleByCode[item.code];
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `item:${item.instanceId}`,
  });
  if (!m) return null;
  return (
    <div
      ref={setNodeRef}
      style={
        transform
          ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 50 }
          : undefined
      }
      className={`rounded-lg border bg-white p-2 ${
        flagged ? 'border-copper/60' : 'border-line'
      } ${isDragging ? 'opacity-60 shadow-lg' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          className="flex-1 cursor-grab text-left active:cursor-grabbing"
          {...listeners}
          {...attributes}
          aria-label={`Drag ${m.code}`}
        >
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-semibold text-copper-deep">{m.code}</span>
            <span className="font-mono text-[10px] text-ink-faint">{moduleUnitsInTerm(m)}u</span>
            {m.placeholder && <ProvenanceBadge type="interpretation" className="scale-90" />}
          </div>
          <p className="truncate text-[11px] text-ink-soft" title={m.title}>
            {m.title}
          </p>
        </button>
        <button
          type="button"
          onClick={() => onRemove(item.instanceId)}
          className="shrink-0 rounded px-1 text-ink-faint hover:bg-panel hover:text-copper-deep"
          aria-label={`Remove ${m.code}`}
        >
          ✕
        </button>
      </div>
      {flagged && <p className="mt-1 text-[10px] text-copper-deep">{flagged}</p>}
      <label className="mt-1 block">
        <span className="sr-only">Move {m.code} to term</span>
        <select
          value={item.termId}
          onChange={(e) => onMove(item.instanceId, e.target.value)}
          className="w-full rounded border border-line-soft bg-paper px-1 py-0.5 text-[10px] text-ink-soft"
        >
          {TERMS.map((t) => (
            <option key={t.id} value={t.id}>
              Move → {t.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

// ---- droppable term column ----
function TermColumn({
  termId,
  children,
  units,
  target,
  warnings,
  isHeaviest,
}: {
  termId: string;
  children: React.ReactNode;
  units: number;
  target: number;
  warnings: TermWarning[];
  isHeaviest: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `term:${termId}` });
  const term = termById[termId]!;
  const over = units > target;
  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-xl border bg-panel/40 p-2 transition-colors ${
        isOver ? 'border-copper bg-copper-tint/40' : 'border-line'
      }`}
    >
      <div className="mb-2 flex items-baseline justify-between px-1">
        <span className="font-display text-sm font-semibold text-ink">{term.label}</span>
        <span className="font-mono text-xs">
          <span className={over ? 'text-[#9E3A2B]' : 'text-ink-soft'}>{units}</span>
          <span className="text-ink-faint">/{target}u</span>
        </span>
      </div>
      {isHeaviest && (
        <p className="mb-1 px-1 font-mono text-[10px] uppercase tracking-wide text-copper-deep">
          ▲ heaviest term
        </p>
      )}
      <div className="flex-1 space-y-1.5">{children}</div>
      {warnings.length > 0 && (
        <ul className="mt-2 space-y-1 border-t border-line-soft pt-2">
          {warnings.map((w, i) => (
            <li key={i} className={`flex gap-1 text-[11px] ${warnColour(w.level)}`}>
              <span aria-hidden>⚠</span>
              <span>{w.message}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Planner() {
  const plan = usePlannerStore((s) => s.plan);
  const addItem = usePlannerStore((s) => s.addItem);
  const removeItem = usePlannerStore((s) => s.removeItem);
  const moveItem = usePlannerStore((s) => s.moveItem);
  const resetToRecommended = usePlannerStore((s) => s.resetToRecommended);
  const clearAll = usePlannerStore((s) => s.clearAll);
  const importPlan = usePlannerStore((s) => s.importPlan);

  const [addTerm, setAddTerm] = useState('Y1S1');
  const [trayQuery, setTrayQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Import a shared plan from ?p= on first mount.
  useEffect(() => {
    const p = searchParams.get('p');
    if (p) {
      const imported = decodePlan(p);
      if (imported && imported.length) importPlan(imported);
      searchParams.delete('p');
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  const byTerm = useMemo(() => itemsByTerm(plan), [plan]);
  const loads = useMemo(() => computeTermLoads(plan), [plan]);
  const heaviest = useMemo(() => heaviestTerm(loads), [loads]);
  const prereq = useMemo(() => prereqIssues(plan), [plan]);
  const flagByInstance = useMemo(() => {
    const map: Record<string, string> = {};
    for (const issue of prereq) {
      const parts: string[] = [];
      if (issue.missing.length) parts.push(`needs ${issue.missing.join(', ')}`);
      if (issue.outOfOrder.length) parts.push(`${issue.outOfOrder.join(', ')} not earlier`);
      let msg = parts.join('; ');
      if (issue.unconfirmed) msg += ' (prereq unconfirmed)';
      map[issue.instanceId] = msg;
    }
    return map;
  }, [prereq]);

  const trayList = useMemo(() => {
    const q = trayQuery.trim().toLowerCase();
    if (!q) return trayModules;
    return trayModules.filter((m) => `${m.code} ${m.title}`.toLowerCase().includes(q));
  }, [trayQuery]);

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const overId = String(over.id);
    if (!overId.startsWith('term:')) return;
    const term = overId.slice(5);
    const aid = String(active.id);
    if (aid.startsWith('tray:')) addItem(aid.slice(5), term);
    else if (aid.startsWith('item:')) moveItem(aid.slice(5), term);
  };

  const activeModule = activeId
    ? moduleByCode[
        activeId.startsWith('tray:')
          ? activeId.slice(5)
          : (plan.find((p) => `item:${p.instanceId}` === activeId)?.code ?? '')
      ]
    : undefined;

  const handleExport = () => {
    const blob = new Blob([exportPlanJson(plan)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nus-ee-plan.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}${window.location.pathname}#/planner?p=${encodePlan(plan)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy your shareable plan link:', url);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div>
        <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              Four-year planner
            </h1>
            <p className="mt-1 max-w-2xl text-ink-soft">
              Drag modules from the tray into any term (or use the + Add and Move ▾ controls). Live
              unit totals, load warnings and prerequisite checks update as you plan. Warnings are{' '}
              <ProvenanceBadge type="heuristic" />.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={resetToRecommended}
              className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-panel"
            >
              Reset to recommended
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-panel"
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-panel"
            >
              Export JSON
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-panel"
            >
              {copied ? '✓ Link copied' : 'Share link'}
            </button>
          </div>
        </header>

        <div className="mb-4">
          <PlanSummary plan={plan} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
          {/* Tray */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-line bg-white p-3">
              <h2 className="font-display text-sm font-bold text-ink">Module tray</h2>
              <label className="mt-2 block">
                <span className="sr-only">Search the tray</span>
                <input
                  type="search"
                  value={trayQuery}
                  onChange={(e) => setTrayQuery(e.target.value)}
                  placeholder="Search modules…"
                  className="w-full rounded-lg border border-line bg-paper px-2.5 py-1.5 text-xs"
                />
              </label>
              <label className="mt-2 flex items-center gap-2 text-xs text-ink-soft">
                <span className="shrink-0">+ Add to</span>
                <select
                  value={addTerm}
                  onChange={(e) => setAddTerm(e.target.value)}
                  className="flex-1 rounded border border-line bg-paper px-1.5 py-1 text-xs"
                >
                  {TERMS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="mt-2 max-h-[60vh] space-y-1.5 overflow-auto pr-1">
                {trayList.map((m) => (
                  <TrayItem key={m.code} m={m} onAdd={(code) => addItem(code, addTerm)} />
                ))}
              </div>
            </div>
          </aside>

          {/* Term grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {TERMS.map((t) => (
              <TermColumn
                key={t.id}
                termId={t.id}
                units={loads.find((l) => l.termId === t.id)?.units ?? 0}
                target={t.targetUnits}
                warnings={loads.find((l) => l.termId === t.id)?.warnings ?? []}
                isHeaviest={heaviest === t.id}
              >
                {(byTerm[t.id] ?? []).length === 0 ? (
                  <p className="px-1 py-3 text-center text-[11px] text-ink-faint">
                    Drop modules here
                  </p>
                ) : (
                  (byTerm[t.id] ?? []).map((item) => (
                    <PlannedCard
                      key={item.instanceId}
                      item={item}
                      onRemove={removeItem}
                      onMove={moveItem}
                      flagged={flagByInstance[item.instanceId]}
                    />
                  ))
                )}
              </TermColumn>
            ))}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeModule ? (
          <div className="rounded-lg border border-copper bg-white px-2.5 py-1.5 shadow-lg">
            <span className="font-mono text-xs font-semibold text-copper-deep">
              {activeModule.code}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
