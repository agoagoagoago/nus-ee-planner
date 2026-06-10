import type { Ratings, RatingAxis } from '@/types';
import { RATING_AXES } from '@/types';
import { AXIS_LABELS, AXIS_TIPS, heatClass } from '@/lib/ratings';

interface CellProps {
  axis: RatingAxis;
  value: number;
}

export function RatingCell({ axis, value }: CellProps) {
  if (value === 0) {
    return (
      <span
        className="inline-flex h-6 w-6 items-center justify-center rounded font-mono text-xs text-ink-faint"
        title={`${AXIS_LABELS[axis]}: varies (your choice).`}
        aria-label={`${AXIS_LABELS[axis]}: varies`}
      >
        –
      </span>
    );
  }
  return (
    <span
      className={`inline-flex h-6 w-6 items-center justify-center rounded font-mono text-xs font-semibold ${heatClass(value)}`}
      title={`${AXIS_LABELS[axis]}: ${value} / 5 — ${AXIS_TIPS[axis]}`}
      aria-label={`${AXIS_LABELS[axis]} ${value} out of 5`}
    >
      {value}
    </span>
  );
}

interface MeterProps {
  ratings: Ratings;
  /** compact = inline row of cells; full = labelled grid */
  variant?: 'compact' | 'full';
}

export function RatingMeter({ ratings, variant = 'compact' }: MeterProps) {
  if (variant === 'full') {
    return (
      <dl className="grid grid-cols-[110px_1fr] items-center gap-x-3 gap-y-1.5">
        {RATING_AXES.map((axis) => (
          <div key={axis} className="contents">
            <dt className="text-xs text-ink-soft" title={AXIS_TIPS[axis]}>
              {AXIS_LABELS[axis]}
            </dt>
            <dd className="flex items-center gap-2">
              <RatingCell axis={axis} value={ratings[axis]} />
              <span className="sr-only">{ratings[axis]} out of 5</span>
            </dd>
          </div>
        ))}
      </dl>
    );
  }
  return (
    <div
      className="flex flex-wrap gap-1"
      role="group"
      aria-label="Heuristic intensity ratings, 1 to 5"
    >
      {RATING_AXES.map((axis) => (
        <RatingCell key={axis} axis={axis} value={ratings[axis]} />
      ))}
    </div>
  );
}
