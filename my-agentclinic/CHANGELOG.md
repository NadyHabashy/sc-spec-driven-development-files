# Changelog

All notable changes to AgentClinic, grouped by date (newest first).

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
