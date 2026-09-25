---
name: changelog
description: Create or update CHANGELOG.md in the AgentClinic project root, with one heading per date and bullets summarizing the changes made that day. Builds the changelog from git history if it does not exist yet; otherwise adds the branch's new work. Run manually before merging a branch.
disable-model-invocation: true
---

# Changelog

Keep `CHANGELOG.md` in the project root (the `my-agentclinic/` folder) as a readable, dated history of what changed in AgentClinic. It is updated by hand-invoking this skill right before a branch is merged, so each merge lands with its changelog entry.

## Scope

The git repository root is the parent folder, which holds other projects. Only this project's history belongs in the changelog, so run every git command from the project folder and limit it to that path with `-- .` (for example, `git log ... -- .`). Never read or stage files outside the project folder.

## Format

```markdown
# Changelog

All notable changes to AgentClinic, grouped by date (newest first).

## 2026-09-25

- Made responsive design a product requirement: mobile-first CSS with `min-width` breakpoints, and a Vitest check that the stylesheet stays mobile-first.
- Combined roadmap phases 2–5 into a single "Data and catalog" phase.

## 2026-09-24

- Added the project constitution: mission, tech stack, and roadmap.
```

- One `## YYYY-MM-DD` heading per date, newest date first. Use the commit's author date (`--date=short`), not today's date, so the history reflects when work happened.
- Under each date, newest change first. Bullets within a day do not need to be in commit order if grouping related changes reads better.
- Each bullet describes a change for someone reading the project history: what changed and, when it is not obvious, why. Start with a past-tense verb ("Added", "Changed", "Fixed", "Removed"). Use backticks for file names, commands, and code.
- Write one bullet per meaningful change, not necessarily per commit. Combine commits that are really one change (a feature plus its follow-up fix). Split a commit into several bullets when it contains clearly separate changes.
- Leave out noise that tells a reader nothing: merge commits, and changelog-only commits. Small housekeeping (for example, ignoring an IDE folder) can be kept as a short bullet or folded into a related one; use judgment.

## Steps

### 1. Find the work to record

If `CHANGELOG.md` does **not** exist, record the project's whole history:

```bash
git log --reverse --no-merges --date=short --format='%ad %h %s%n%b' -- .
```

If `CHANGELOG.md` **does** exist, record only what the changelog does not cover yet. The work being merged is the branch's commits that are not on `main`:

```bash
git log --reverse --no-merges --date=short --format='%ad %h %s%n%b' main..HEAD -- .
```

If that range is empty (for example, you are on `main`), fall back to commits made since `CHANGELOG.md` last changed:

```bash
git log --reverse --no-merges --date=short --format='%ad %h %s%n%b' "$(git log -1 --format=%H -- CHANGELOG.md)"..HEAD -- .
```

If `CHANGELOG.md` has never been committed, that inner command prints nothing; use the full-history command instead.

Then compare the commits against the existing entries and skip anything already described, so running the skill twice does not duplicate bullets.

Also check `git status --short -- .`. If there are uncommitted changes, tell the user they are not in the changelog because they are not committed yet, and ask whether to include them under today's date or wait until they are committed.

Commit subjects can be terse. When a subject does not say enough to write a clear bullet, look at the commit with `git show --stat <hash>` (and the diff if needed) before writing it.

### 2. Write the entries

- New changelog: create `CHANGELOG.md` using the format above, with every date from the history.
- Existing changelog: add bullets under the matching date heading if it exists, or insert a new date heading in the right position (dates stay newest first). Do not rewrite or reorder existing entries; they are history.

### 3. Report and hand back

Show the user the entries you added (the new or changed date sections, not the whole file) and the commits they came from. Do not commit: the user reviews the entry and commits it with the branch before merging.

If there was nothing new to record, say so and leave the file unchanged.
