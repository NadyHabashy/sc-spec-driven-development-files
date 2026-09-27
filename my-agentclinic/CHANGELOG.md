# Changelog

All notable changes to AgentClinic, grouped by date (newest first).

## 2026-09-28

- Added Prettier and ESLint (`typescript-eslint` recommended type-checked rules) with `lint` and `format` scripts; `npm run validate` now runs lint between the type-check and the tests. Prettier skips Markdown and keeps double quotes in CSS.
- Added `renderToString` (`src/render.ts`) to turn JSX into HTML strings with correct types, and used it in the app and tests.
- Reformatted the code with Prettier.
- Added the MVP spec (`specs/2026-09-28-mvp/`) covering roadmap Phases 2–6, and started work on the `mvp` branch.

## 2026-09-26

- Implemented Phase 1 (Layout and look): adopted Pico CSS v2 (`@picocss/pico`), served locally at `/pico.min.css` and loaded before `public/styles.css`, which now holds only brand overrides (teal primary color for light and dark themes, fluid heading, 44px nav touch targets).
- Added a data-driven `Nav` component (`src/components/nav.tsx`) with the site name and a Home link marked `aria-current="page"`; `Layout` takes an optional `currentPath`, and the header, main, and footer use Pico's `container` class.
- Rewrote the home page with a playful hero and three feature cards (Ailments, Therapies, Appointments) in a new `.feature-grid` that shows one, two, or three columns at the `40rem` and `64rem` breakpoints.
- Added Vitest coverage for the nav, Pico serving, container classes, stylesheet order, home page cards, and brand stylesheet rules.
- Extracted component props into named TypeScript types (`NavProps`, `HeaderProps`, `MainProps`, `LayoutProps`).
- Fixed issues found in a branch review: `Layout` now requires `currentPath`; Pico and `public/` are resolved from the module so the app works from any directory; dark-mode button colors now meet 4.5:1 contrast; the current nav link is underlined and bold; `.container` is fluid in `rem` instead of Pico's fixed pixel widths; an odd card spans the row at tablet width; brand colors cover text selection and an explicit `data-theme="dark"`; `navItems` is `readonly`; and tests are less brittle, with new checks for touch targets, the container, dependencies, and working-directory independence.
- Recorded Phase 1 validation results in `validation.md`, and documented Pico's breakpoints and module-relative asset paths in `specs/tech-stack.md`.
- Added the Phase 1 layout-and-look spec and switched the tech stack's styling choice to Pico CSS.

## 2026-09-25

- Added a `/changelog` Claude Code skill (`.claude/skills/changelog/`) that creates or updates this changelog from git history, run manually before merging a branch.
- Added this `CHANGELOG.md`, built from the project's git history.
- Made responsive design a product requirement: added a "Responsive by default" principle to `specs/mission.md` and a Responsive design section to `specs/tech-stack.md` (mobile-first CSS, `min-width` breakpoints at `40rem` and `64rem`, `clamp()` sizing, no horizontal scrolling at `320px`, `44px` touch targets, and width checks in every phase).
- Rewrote `public/styles.css` mobile-first, with a Vitest check that it uses `min-width` breakpoints and no `max-width` media queries.
- Combined roadmap phases 2–5 (database, agents, ailments, therapies) into a single Phase 2 "Data and catalog", renumbered the later phases 3–6, and added a responsive check to the Polish phase.
- Adopted Vitest as the validation framework: every automated check in a phase's `validation.md` is now backed by a test, run with the new `npm run validate` script (type-check plus tests).
- Changed TypeScript config so tests are type-checked: `tsconfig.json` now covers all of `src/`, and the new `tsconfig.build.json` keeps test files out of `dist/`.
- Added render tests for the `Header`, `Main`, and `Footer` components and a test suite for `Layout`.
- Implemented Phase 0: a Hono app serving the AgentClinic home page at `/` with server-rendered JSX, plus `dev`, `build`, `start`, and `test` npm scripts and route tests.
- Added a main `Layout` built from `Header`, `Main`, and `Footer` components (each in its own file under `src/components/`), linking a stylesheet served from `public/styles.css`.
- Added the Phase 0 skeleton spec: requirements, plan, and validation.

## 2026-09-24

- Added the project constitution: mission, tech stack, and roadmap in `specs/`.
- Ignored the `.idea` directory in git.
- Added the AgentClinic starting point: `package.json`, TypeScript config, a placeholder `src/index.ts`, the README, and course prompts.
