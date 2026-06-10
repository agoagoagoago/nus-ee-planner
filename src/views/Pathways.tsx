import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Pathway } from '@/types';
import { moduleByCode, pathways } from '@/data/curriculum';
import { usePlannerStore } from '@/store/usePlannerStore';
import { ProfileRadar } from '@/components/ProfileRadar';
import { ProvenanceBadge } from '@/components/ProvenanceBadge';
import {
  DEFAULT_ANSWERS,
  INTEREST_OPTIONS,
  scorePathways,
  type Goal,
  type QuizAnswers,
} from '@/lib/recommender';

function CodeList({ codes }: { codes: string[] }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {codes.map((c) => {
        const m = moduleByCode[c];
        return (
          <span
            key={c}
            className="rounded border border-line bg-panel px-1.5 py-0.5 font-mono text-[11px] text-ink-soft"
            title={m?.title ?? c}
          >
            {c}
          </span>
        );
      })}
    </span>
  );
}

function PathwayCard({
  pathway,
  onApply,
  highlight,
}: {
  pathway: Pathway;
  onApply: (id: string) => void;
  highlight?: boolean;
}) {
  return (
    <article
      className={`rounded-2xl border bg-white p-5 shadow-sm ${
        highlight ? 'border-copper ring-1 ring-copper/40' : 'border-line'
      }`}
    >
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-lg font-bold text-ink">{pathway.name}</h3>
          <span className="mt-1 inline-block rounded bg-teal-tint px-2 py-0.5 font-mono text-[11px] text-teal-deep">
            {pathway.specialisation}
          </span>
        </div>
        <ProvenanceBadge type="interpretation" />
      </header>

      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_180px]">
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
              Foundational
            </dt>
            <dd className="mt-0.5">
              <CodeList codes={pathway.foundational} />
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
              Extended-core gateway
            </dt>
            <dd className="mt-0.5">
              <CodeList codes={pathway.extendedCore} />
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
              Technical electives
            </dt>
            <dd className="mt-0.5">
              <CodeList codes={pathway.technicalElectives} />
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">Skills</dt>
            <dd className="mt-0.5 text-ink-soft">{pathway.skills}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
              Careers
            </dt>
            <dd className="mt-0.5 text-ink-soft">{pathway.careers}</dd>
          </div>
        </dl>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
              Difficulty profile
            </span>
            <ProvenanceBadge type="heuristic" />
          </div>
          <ProfileRadar ratings={pathway.profile} height={170} />
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-[#C4E2CC] bg-[#E7F2E9] p-3 text-[13px]">
          <p className="font-mono text-[10px] uppercase tracking-wide text-[#2F6B45]">
            Good fit if
          </p>
          <p className="mt-0.5 text-ink-soft">{pathway.goodFit}</p>
        </div>
        <div className="rounded-lg border border-[#ECD2BF] bg-copper-tint p-3 text-[13px]">
          <p className="font-mono text-[10px] uppercase tracking-wide text-copper-deep">
            May want to avoid if
          </p>
          <p className="mt-0.5 text-ink-soft">{pathway.avoid}</p>
        </div>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={() => onApply(pathway.id)}
          className="rounded-lg bg-copper px-3.5 py-2 text-sm font-semibold text-white hover:bg-copper-deep"
        >
          Apply to my plan →
        </button>
      </div>
    </article>
  );
}

export function Pathways() {
  const navigate = useNavigate();
  const applyPathway = usePlannerStore((s) => s.applyPathway);
  const [answers, setAnswers] = useState<QuizAnswers>(DEFAULT_ANSWERS);
  const [submitted, setSubmitted] = useState(false);

  const ranked = useMemo(() => scorePathways(answers), [answers]);
  const topIds = submitted ? ranked.slice(0, 2).map((r) => r.pathway.id) : [];

  const handleApply = (id: string) => {
    applyPathway(id);
    navigate('/planner');
  };

  const toggleInterest = (id: string) =>
    setAnswers((a) => ({
      ...a,
      interests: a.interests.includes(id)
        ? a.interests.filter((x) => x !== id)
        : [...a.interests, id],
    }));

  return (
    <div>
      <header className="mb-5">
        <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">Career pathways</h1>
        <p className="mt-1 max-w-2xl text-ink-soft">
          Eight elective pathways, each mapping a career interest to a foundation, an extended-core
          gateway, technical electives and an honest fit check. The bundling into
          &ldquo;pathways&rdquo; is an <ProvenanceBadge type="interpretation" />; module codes and
          NUS specialisation names are <ProvenanceBadge type="official" />.
        </p>
      </header>

      {/* Quiz */}
      <section className="mb-8 rounded-2xl border border-line bg-white p-5">
        <h2 className="font-display text-lg font-bold text-ink">1-minute interest quiz</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Answer five quick questions and we&apos;ll surface your best-fit pathways. Heuristic — a
          starting point, not a verdict.
        </p>

        <div className="mt-4 space-y-5">
          <fieldset>
            <legend className="text-sm font-semibold text-ink">
              1. Which areas interest you? (pick any)
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((o) => {
                const active = answers.interests.includes(o.id);
                return (
                  <button
                    key={o.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleInterest(o.id)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                      active
                        ? 'border-copper bg-copper text-white'
                        : 'border-line bg-paper text-ink-soft hover:border-copper/50'
                    }`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <SliderQ
            label="2. How comfortable are you with heavy maths?"
            lo="Not my strength"
            hi="Bring it on"
            value={answers.mathComfort}
            onChange={(v) => setAnswers((a) => ({ ...a, mathComfort: v }))}
          />
          <SliderQ
            label="3. Do you prefer software or hardware?"
            lo="Pure software"
            hi="Hands-on hardware"
            value={answers.hardwareVsSoftware}
            onChange={(v) => setAnswers((a) => ({ ...a, hardwareVsSoftware: v }))}
          />
          <SliderQ
            label="4. How much do you enjoy big, long projects?"
            lo="Prefer exams"
            hi="Love building"
            value={answers.projectTolerance}
            onChange={(v) => setAnswers((a) => ({ ...a, projectTolerance: v }))}
          />

          <fieldset>
            <legend className="text-sm font-semibold text-ink">5. What&apos;s your goal?</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {(
                [
                  ['industry', 'Industry job'],
                  ['gradschool', 'Grad school / research'],
                  ['undecided', 'Undecided'],
                ] as [Goal, string][]
              ).map(([g, label]) => (
                <button
                  key={g}
                  type="button"
                  aria-pressed={answers.goal === g}
                  onClick={() => setAnswers((a) => ({ ...a, goal: g }))}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    answers.goal === g
                      ? 'border-teal bg-teal text-white'
                      : 'border-line bg-paper text-ink-soft hover:border-teal/50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink-soft"
          >
            Show my best-fit pathways
          </button>
          {submitted && (
            <button
              type="button"
              onClick={() => {
                setAnswers(DEFAULT_ANSWERS);
                setSubmitted(false);
              }}
              className="text-sm text-ink-soft underline"
            >
              Reset quiz
            </button>
          )}
        </div>

        {submitted && (
          <div className="mt-5 rounded-xl border border-copper/30 bg-copper-tint/50 p-4">
            <h3 className="font-display font-bold text-ink">Your top matches</h3>
            <ul className="mt-2 space-y-2">
              {ranked.slice(0, 2).map((r, i) => (
                <li key={r.pathway.id} className="flex flex-wrap items-baseline gap-2 text-sm">
                  <span className="font-mono text-xs text-copper-deep">#{i + 1}</span>
                  <span className="font-semibold text-ink">{r.pathway.name}</span>
                  <span className="text-ink-faint">→ {r.pathway.specialisation}</span>
                  {r.reasons[0] && (
                    <span className="text-ink-soft">· {r.reasons.slice(0, 2).join('; ')}</span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleApply(r.pathway.id)}
                    className="ml-auto rounded border border-copper px-2 py-1 text-xs font-medium text-copper-deep hover:bg-copper/10"
                  >
                    Apply to plan
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-ink-faint">
              Highlighted below. &ldquo;Apply&rdquo; loads the pathway&apos;s electives onto the
              recommended schedule in the Planner.
            </p>
          </div>
        )}
      </section>

      {/* All pathway cards */}
      <div className="grid gap-4 xl:grid-cols-2">
        {pathways.map((p) => (
          <PathwayCard
            key={p.id}
            pathway={p}
            onApply={handleApply}
            highlight={topIds.includes(p.id)}
          />
        ))}
      </div>
    </div>
  );
}

function SliderQ({
  label,
  lo,
  hi,
  value,
  onChange,
}: {
  label: string;
  lo: string;
  hi: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-ink">
        {label}
        <div className="mt-2 flex items-center gap-3">
          <span className="w-24 shrink-0 text-right text-xs font-normal text-ink-faint">{lo}</span>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="flex-1 accent-copper"
          />
          <span className="w-24 shrink-0 text-xs font-normal text-ink-faint">{hi}</span>
          <span className="w-5 text-right font-mono text-sm">{value}</span>
        </div>
      </label>
    </div>
  );
}
