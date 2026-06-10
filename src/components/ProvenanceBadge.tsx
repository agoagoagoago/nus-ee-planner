import type { Provenance } from '@/types';

const STYLES: Record<Provenance, { label: string; cls: string; tip: string }> = {
  official: {
    label: 'Official',
    cls: 'bg-teal-tint text-teal-deep border-teal/30',
    tip: 'Sourced from official NUS / CDE / ECE pages or curriculum PDFs. Still verify against your own CourseReg / FFG checklist.',
  },
  interpretation: {
    label: 'Interpretation',
    cls: 'bg-[#EEF0F4] text-[#475068] border-[#D7DCE5]',
    tip: "The guide author's reading or grouping of official material (e.g. mapping a module to a career pathway). Reasonable, but not an official NUS classification.",
  },
  heuristic: {
    label: 'Heuristic',
    cls: 'bg-copper-tint text-copper-deep border-copper/30',
    tip: 'Unofficial difficulty / workload estimate invented for this tool on a 1–5 scale. NOT official NUS data and not based on grade data. Use only to plan balance.',
  },
};

interface Props {
  type: Provenance;
  className?: string;
}

export function ProvenanceBadge({ type, className = '' }: Props) {
  const s = STYLES[type];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide ${s.cls} ${className}`}
      title={s.tip}
    >
      {s.label}
    </span>
  );
}
