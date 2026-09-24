# Roadmap

The app is built in very small phases. Each phase is shippable on its own: the app runs, and its tests pass.

## Phase 0: Skeleton
- [ ] Install Hono, `@hono/node-server`, `tsx`, and Vitest
- [ ] Serve "Welcome to AgentClinic" at `/`
- [ ] Add `dev`, `build`, `start`, and `test` npm scripts
- [ ] Add one passing route test

## Phase 1: Layout and look
- [ ] Shared JSX layout with header, nav, and footer
- [ ] Base CSS: colors, typography, responsive grid
- [ ] Home page with playful clinic copy

## Phase 2: Database foundation
- [ ] SQLite connection with `better-sqlite3`
- [ ] Simple migration runner plus a first empty migration
- [ ] Seed script scaffold

## Phase 3: Agents
- [ ] `agents` table and seed data
- [ ] Agents list page
- [ ] Agent detail page

## Phase 4: Ailments
- [ ] `ailments` table and seed data
- [ ] Ailments catalog page
- [ ] Link agents to their ailments

## Phase 5: Therapies
- [ ] `therapies` table and seed data
- [ ] Therapies page
- [ ] Map therapies to the ailments they treat

## Phase 6: Appointments (read)
- [ ] `appointments` table and seed data
- [ ] Appointments list page

## Phase 7: Appointments (booking)
- [ ] Booking form, validated with Zod
- [ ] Create an appointment and confirm it
- [ ] Prevent double-booking

## Phase 8: Dashboard
- [ ] Staff dashboard: today's appointments and counts
- [ ] Agent view: my ailments, therapies, and upcoming appointments

## Phase 9: Polish
- [ ] Empty states, error pages, and a 404 page
- [ ] Accessibility pass
- [ ] Cross-browser check in evergreen browsers