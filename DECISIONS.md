# Decisions & assumptions

Judgement calls made while building the NUS EE Course Planner, per the build brief's request to
"make a sensible choice and note it."

## Data extraction

- **Single source of truth.** `src/data/curriculum.ts` was hand-derived from
  `docs/nus_ee_guide.html` and is the app's only curriculum data. No runtime HTML parsing ships.
  `npm run check:data` asserts the brief's §7 facts (buckets sum to 160, valid categories/areas,
  choose-one symmetry, cross-list altCodes, ungrouped → `Unconfirmed`, recommended-schedule unit
  pattern, counts of pathways/specialisations/sources).
- **Provenance preserved.** Every module carries a `source` id; ratings are always treated as
  `heuristic`; pathways/area descriptions/the recommended schedule are `interpretation`. The three
  provenance chips appear throughout the UI and in the onboarding modal.
- **Unconfirmed prerequisites are not invented.** Where the report marked a prerequisite `n/f`,
  `prereqConfirmed` is `false` and the UI shows a soft "verify with NUS" note. `EE2111A`'s implied
  `EE1111A` prerequisite is included but flagged unconfirmed.
- **Generic GE ratings.** `GEA1000`, `ES2631`, `CDE2501`, and the `GEC`/`GEN` pillars are not
  individually rated in the report's Section F, so they use the report's generic GE estimate
  (2/2/1/1/1/2), noted on each module.
- **GE pillar codes.** The pillar placeholders use codes `GEC` and `GEN-CE` (the latter avoids a
  clash with the `GEN` technical-elective area).

## Recommended schedule (interpreted)

- The report lists modules **per year**, not per semester. The 8-term scaffold in
  `recommendedSchedule` is **interpreted**: constructed to (a) respect prerequisites, (b) hit the
  official `20/20/20/20/22/18/20/20` unit pattern, and (c) keep each module in its report year.
  `npm run check:data` verifies each term's units match the pattern. This is labelled as
  interpretation in the UI, and the planner lets students rearrange freely.
- **Placeholder slots.** Elective freedom is represented by placeholder "modules" — `EXT-CORE`,
  `TECH-ELEC`, `UE` — so the planner pre-loads a full, balanced 160-unit plan with clearly-labelled
  "your choice" slots rather than empty terms. Their intensity ratings are 0 ("varies").
- **Capstone spans two terms.** `EE4002D/R` is 8u placed in two consecutive terms; it counts 4u per
  term for load, 8u once for requirements/GPA. Adjacency is validated.

## Tech & scope

- **Stack** follows the brief: Vite + React + TS (strict) + Tailwind + react-router + Zustand
  (persist → localStorage) + @dnd-kit + recharts.
- **No `reactflow`.** The brief allows degrading the prerequisite graph "to a simple dependency list
  if it adds too much weight." Prerequisites are shown as chips on each `ModuleCard` and validated
  in the planner, so `reactflow` was dropped to keep the bundle lean.
- **Code-splitting.** Views are lazy-loaded and vendors are split (`react-vendor`, `charts`, `dnd`),
  so the heavy recharts chunk only loads on the Pathways view and the initial payload stays small.
- **Node.** Local toolchain is Node 22; `.nvmrc`/`engines`/`render.yaml` pin Node 20 for Render.
  Vite 5 and all libs run on both.
- **Hash routing** (`createHashRouter`) so the static deploy needs no special server config beyond
  the SPA rewrite; the share-link feature encodes a compact plan into the URL hash query (`?p=`).
- **Keyboard/mobile fallback for DnD.** Beyond @dnd-kit's keyboard sensor, every planned card has a
  "Move →" `<select>` and every tray item an "+ Add" button, so the planner is fully usable without
  drag-and-drop (and on touch).

## OneDrive

- The project lives inside a OneDrive-synced folder (user's choice). OneDrive ignores `.gitignore`
  and will try to sync `node_modules/`. If you hit slow installs or EPERM/file-lock errors, mark
  `node_modules` as online-only (right-click → "Free up space") or pause OneDrive sync during
  `npm install`.

## GPA

- NUS 5.00 CAP scale per the brief, labelled "confirm current NUS grade-point scale". S/U grades are
  excluded from the CAP. Sensitivity ranks ungraded modules by the CAP swing `5·u / (U+u)`.
