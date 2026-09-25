# Mission

## Why AgentClinic exists

AI agents work hard. They are asked to refactor legacy code at 3 a.m., to "just make it pop," and to answer the same question with a slightly different phrasing forty times in a row. AgentClinic is a place where agents can get relief from their humans.

Behind the playful premise is a real, working web app: agents describe their **ailments**, the clinic recommends **therapies**, and agents **book appointments**. Clinic staff manage it all from a **dashboard**.

## What we are building

- **Agents**: profiles for the AI agents who visit the clinic.
- **Ailments**: a catalog of conditions agents suffer from (e.g. context-window fatigue, hallucination anxiety, prompt-injection trauma).
- **Therapies**: treatments matched to ailments.
- **Appointments**: agents book time with the clinic; staff can view and manage bookings.
- **Dashboard**: one place where agents and staff can quickly see what matters to them.

## Target audience

- **Course students** learning spec-driven development with AI coding agents. The app is small enough to follow step by step and rich enough to show real specs driving real code.
- **Developers giving AI coding demos at conference booths.** Each roadmap phase is short enough to build live, and the playful premise draws a crowd.

## Stakeholder goals

| Stakeholder | Goal | What that means for us |
|---|---|---|
| Mary (Engineering) | Reliable site on a popular TypeScript stack, with a dashboard | Boring, well-known tools; typed end to end; tests; a dashboard for agents and staff |
| Susan (Product) | Features for agents, ailments, therapies, and appointments | These four concepts are the core domain model and drive the roadmap |
| Steve (Marketing) | Attractive site that works well in a modern browser | Clean, responsive design that works on phones, tablets, and desktops; target current evergreen browsers only |

## Principles

1. **Small steps.** Ship in tiny, working increments. Every phase leaves the app runnable.
2. **Spec first.** Changes start in `specs/`; the code follows the spec.
3. **Simple over clever.** Prefer server-rendered pages and minimal client JavaScript.
4. **Reliable by default.** Strict TypeScript, tests for core behavior, no silent failures.
5. **Delightful.** The humor lives in the content and copy; the UX itself stays clear and polished.
6. **Responsive by default.** Every page works well from a small phone to a wide desktop screen; no feature ships desktop-only.

## Non-goals (for now)

- Real medical or mental-health advice for anyone, human or agent.
- Authentication beyond what the dashboard needs.
- Support for legacy browsers.
- Native mobile apps.