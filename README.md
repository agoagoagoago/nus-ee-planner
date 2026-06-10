# NUS EE Course Planner

> Explore modules, find your pathway, and plan a balanced four years of Electrical Engineering at NUS.

A fast, friendly, single-page web app that helps prospective and incoming **NUS Electrical
Engineering (AY2025/26 cohort)** students understand the curriculum, find a specialisation pathway
that fits their interests, and plan a balanced four-year module schedule with smart warnings about
overloaded semesters, prerequisites and graduation requirements.

**🔗 Live site: <https://nus-ee-planner.onrender.com>**

> ⚠️ **Unofficial planning aid — not affiliated with or endorsed by NUS.** Difficulty/workload/
> intensity ratings are **heuristic estimates** created for this tool, not official NUS data and not
> based on grade distributions. Verify all requirements against the official NUS course catalogue /
> NUSMods and your faculty's CourseReg / Four-Year Guide before relying on anything.

## Features

- **Module Explorer** — search and filter every EE module by category, concentration area, and any
  of six heuristic intensity axes ("show me low-programming, high-hardware power electives").
- **Pathways** — eight career pathways with difficulty radars and an honest fit check, plus a
  one-minute interest quiz that surfaces your best-fit pathway and applies it to your plan.
- **Four-year planner** — drag modules (or use keyboard/touch controls) across eight terms, with
  live unit totals, 40/80/40 bucket progress, and warnings for overloaded terms, maths/difficulty/
  project crunches, out-of-order prerequisites, choose-one conflicts, and capstone adjacency.
- **Specialisation tracker** — progress toward any of the 7 NUS specialisations, auto-counting
  unrestricted electives.
- **GPA what-if** — project your cumulative CAP on the NUS 5.00 scale with per-module sensitivity.
- **About / verify-with-NUS** — the full disclaimer, the provenance model, a caveats checklist, and
  every source (S1–S11) linked.

Everything you do is saved to your browser (`localStorage`); nothing leaves your device. Plans can be
exported as JSON or shared via a link that encodes the plan in the URL.

## Data & provenance

The single source of curriculum truth is **`src/data/curriculum.ts`**, hand-derived from the source
report at **`docs/nus_ee_guide.html`**. Three kinds of information are tagged throughout the UI:

| Badge            | Meaning                                                                     |
| ---------------- | --------------------------------------------------------------------------- |
| `Official`       | From NUS / CDE / ECE pages and curriculum PDFs (each carries a source id).   |
| `Interpretation` | Groupings/readings — pathways, area descriptions, the per-semester schedule. |
| `Heuristic`      | Unofficial 1–5 difficulty/workload/intensity estimates invented for this tool. |

### Regenerating the data

`curriculum.ts` is committed and hand-verified — there is no runtime HTML parser. To update it,
edit the report in `docs/nus_ee_guide.html`, transcribe the changes into `src/data/curriculum.ts`,
then run the assertions:

```bash
npm run check        # data integrity (§7 facts) + planner-logic smoke test
```

## Local development

Requires **Node 20+** (see `.nvmrc`).

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check + production build → dist/
npm run preview  # serve the production build (http://localhost:4173)

npm run lint     # ESLint (zero warnings)
npm run format   # Prettier
npm run check    # data + logic assertions
```

## Deployment (Render — free Static Site)

No backend, no API keys — a pure static site.

### Option A — Blueprint

The repo includes `render.yaml`. In Render: **New → Blueprint**, connect this repo, and apply.
(Field names evolve — verify against <https://render.com/docs/blueprint-spec>.)

### Option B — Manual

1. Render dashboard → **New → Static Site** → connect `agoagoagoago/nus-ee-planner`.
2. **Build Command:** `npm ci && npm run build`
3. **Publish Directory:** `dist`
4. Add a **Rewrite** rule: `/*` → `/index.html` (SPA fallback).
5. Set env var `NODE_VERSION=20`. Create.
6. Put the resulting `*.onrender.com` URL here:

   **Live site:** <https://nus-ee-planner.onrender.com>

## Tech stack

Vite · React · TypeScript (strict) · Tailwind CSS · react-router-dom (hash routing) · Zustand
(persist) · @dnd-kit · recharts. See [`DECISIONS.md`](./DECISIONS.md) for judgement calls.

## Sources

Built from official NUS / CDE / ECE pages and curriculum PDFs (S1–S11), listed with links on the
in-app **About** page. Always re-check the live pages for your exact cohort.

## Licence

MIT — see [`LICENSE`](./LICENSE). Not affiliated with or endorsed by NUS.
