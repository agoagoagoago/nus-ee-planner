import { usePlannerStore } from '@/store/usePlannerStore';

// Recurs after this long even if dismissed (load-bearing honesty requirement).
const RECUR_MS = 1000 * 60 * 60 * 12; // 12 hours

export function DisclaimerBanner() {
  const dismissedAt = usePlannerStore((s) => s.disclaimerDismissedAt);
  const dismiss = usePlannerStore((s) => s.dismissDisclaimer);

  const hidden = dismissedAt != null && Date.now() - dismissedAt < RECUR_MS;
  if (hidden) return null;

  return (
    <div className="border-b border-copper/30 bg-copper-tint" role="note">
      <div className="mx-auto flex max-w-content items-start gap-3 px-4 py-2.5 text-[13px] text-copper-deep">
        <span aria-hidden className="mt-0.5 font-mono text-xs font-bold">
          ⚠
        </span>
        <p className="flex-1">
          <strong>Unofficial planning aid.</strong> Difficulty, workload and intensity ratings are
          heuristic estimates created for this tool — <strong>not official NUS data</strong>. Verify
          all requirements against the official NUS course catalogue / NUSMods and your
          faculty&apos;s CourseReg. Not affiliated with NUS.
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded border border-copper/40 px-2 py-0.5 text-xs font-medium hover:bg-copper/10"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
