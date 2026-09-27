# Roadmap

The app is built in very small phases. Each phase is shippable on its own: the app runs, its tests pass, and every page it adds is responsive (see `specs/tech-stack.md`).

## Phase 0: Skeleton
- [x] Install Hono, `@hono/node-server`, `tsx`, and Vitest
- [x] Serve "Welcome to AgentClinic" at `/`
- [x] Add `dev`, `build`, `start`, `test`, and `validate` npm scripts
- [x] Add passing Vitest tests for every automated validation check

## Phase 1: Layout and look
- [x] Shared JSX layout with header, nav, and footer
- [x] Base CSS: colors, typography, responsive grid
- [x] Home page with playful clinic copy

## Phase 2: Data and catalog
- [x] SQLite connection with `better-sqlite3`
- [x] Simple migration runner
- [x] Seed script
- [x] `agents`, `ailments`, and `therapies` tables and seed data
- [x] Agents list page and agent detail page
- [x] Ailments catalog page, with agents linked to their ailments
- [x] Therapies page, with therapies mapped to the ailments they treat

## Phase 3: Appointments (read)
- [ ] `appointments` table and seed data
- [ ] Appointments list page

## Phase 4: Appointments (booking)
- [ ] Booking form, validated with Zod
- [ ] Create an appointment and confirm it
- [ ] Prevent double-booking

## Phase 5: Dashboard
- [ ] Staff dashboard: today's appointments and counts
- [ ] Agent view: my ailments, therapies, and upcoming appointments

## Phase 6: Polish
- [ ] Empty states, error pages, and a 404 page
- [ ] Accessibility pass
- [ ] Cross-browser check in evergreen browsers
- [ ] Responsive check of every page at phone, tablet, and desktop widths