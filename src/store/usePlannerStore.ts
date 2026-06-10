import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Grade, PlannedItem, RatingAxis } from '@/types';
import { moduleByCode, pathways, recommendedSchedule } from '@/data/curriculum';

const newId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2)}-${Date.now()}`;

/** Build the pre-loaded recommended plan as flat PlannedItems. */
export function buildRecommendedPlan(): PlannedItem[] {
  const items: PlannedItem[] = [];
  for (const term of recommendedSchedule) {
    const termId = `Y${term.year}S${term.sem}`;
    for (const code of term.moduleCodes) {
      items.push({ instanceId: newId(), code, termId });
    }
  }
  return items;
}

export interface IntensityPrefs {
  hardwareVsSoftware: number; // 1 (software) – 5 (hardware)
  mathComfort: number; // 1 – 5
  projectTolerance: number; // 1 – 5
}

export interface PlannerState {
  plan: PlannedItem[];
  grades: Record<string, Grade>; // keyed by instanceId
  targetSpecialisation: string | null;
  // explorer filter prefs (also set by the recommender)
  explorerFilters: Partial<Record<RatingAxis, [number, number]>>;
  // ui state
  onboardingSeen: boolean;
  disclaimerDismissedAt: number | null;

  // actions
  addItem: (code: string, termId: string) => void;
  removeItem: (instanceId: string) => void;
  moveItem: (instanceId: string, termId: string) => void;
  resetToRecommended: () => void;
  clearAll: () => void;
  setGrade: (instanceId: string, grade: Grade) => void;
  setTargetSpecialisation: (name: string | null) => void;
  setExplorerFilters: (f: Partial<Record<RatingAxis, [number, number]>>) => void;
  applyPathway: (pathwayId: string) => void;
  importPlan: (items: PlannedItem[]) => void;
  markOnboardingSeen: () => void;
  dismissDisclaimer: () => void;
}

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set) => ({
      plan: buildRecommendedPlan(),
      grades: {},
      targetSpecialisation: null,
      explorerFilters: {},
      onboardingSeen: false,
      disclaimerDismissedAt: null,

      addItem: (code, termId) =>
        set((s) => ({ plan: [...s.plan, { instanceId: newId(), code, termId }] })),

      removeItem: (instanceId) =>
        set((s) => {
          const grades = { ...s.grades };
          delete grades[instanceId];
          return { plan: s.plan.filter((p) => p.instanceId !== instanceId), grades };
        }),

      moveItem: (instanceId, termId) =>
        set((s) => ({
          plan: s.plan.map((p) => (p.instanceId === instanceId ? { ...p, termId } : p)),
        })),

      resetToRecommended: () => set({ plan: buildRecommendedPlan(), grades: {} }),

      clearAll: () => set({ plan: [], grades: {} }),

      setGrade: (instanceId, grade) =>
        set((s) => ({ grades: { ...s.grades, [instanceId]: grade } })),

      setTargetSpecialisation: (name) => set({ targetSpecialisation: name }),

      setExplorerFilters: (f) => set({ explorerFilters: f }),

      applyPathway: (pathwayId) => {
        const pathway = pathways.find((p) => p.id === pathwayId);
        if (!pathway) return;
        // Start from a fresh recommended scaffold, then fill its placeholder slots
        // with the pathway's recommended extended-core + technical electives.
        const plan = buildRecommendedPlan();
        const extPick = pathway.extendedCore.find((c) => moduleByCode[c] && c !== 'EE2022');
        const tePicks = pathway.technicalElectives.filter((c) => moduleByCode[c]).slice(0, 2);

        let teUsed = 0;
        for (const item of plan) {
          if (item.code === 'EXT-CORE' && extPick) {
            item.code = extPick;
          } else if (item.code === 'TECH-ELEC' && teUsed < tePicks.length) {
            item.code = tePicks[teUsed]!;
            teUsed += 1;
          }
        }
        // Mirror the pathway's profile into the Explorer's intensity filters.
        set({
          plan,
          targetSpecialisation: pathway.specialisation.includes('No single') ? null : pathway.name,
          explorerFilters: {
            math: [Math.max(1, pathway.profile.math - 1), 5],
          },
        });
      },

      importPlan: (items) => set({ plan: items, grades: {} }),

      markOnboardingSeen: () => set({ onboardingSeen: true }),

      dismissDisclaimer: () => set({ disclaimerDismissedAt: Date.now() }),
    }),
    {
      name: 'nus-ee-planner',
      version: 1,
      partialize: (s) => ({
        plan: s.plan,
        grades: s.grades,
        targetSpecialisation: s.targetSpecialisation,
        explorerFilters: s.explorerFilters,
        onboardingSeen: s.onboardingSeen,
        disclaimerDismissedAt: s.disclaimerDismissedAt,
      }),
    },
  ),
);
