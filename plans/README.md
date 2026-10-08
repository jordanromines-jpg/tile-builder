# Build plans

Every plan for Tile Steps (the repo's working name: Tile Builder) lives here and is committed with the work it describes. Work beyond what Jordan has
approved is written into a plan first and waits for his go; adding detail to an idea isn't agreement. The format is
`web-agent`'s (`plans/README.md` there), adapted to one builder session.

## Start here

`2026-10-07-tots-and-trucks.md` is the plan in progress (0–3 batch 2, then Monster trucks); `2026-10-02-tile-builder.md` is the original plan. A session picking up work reads its build log (the last row says what is
next), then `PRODUCT.md`, `DESIGN.md`, `docs/research/README.md` and `web/README.md`, checks out the commit the log
names, runs the checks, and starts the next key.

| Folder or file | What is in it |
|---|---|
| `plans/` | The active plan and this README |
| `plans/archive/` | Plans that are done, superseded or dropped (none yet) |
| `plans/roadmap/` | The Archify definition that draws the plan as swimlanes; the built page is not in git |
| `plans/CHANGELOG.md` | One line per change to a plan, newest first, in the same commit as the change |

## Active plans

| Plan | Status | Carries |
|---|---|---|
| `2026-10-07-tots-and-trucks.md` | approved 7 Oct 2026, in progress | 2.6 (32 more 0–3 builds, big squares used well), 2.7 and 2.8 (Monster trucks: about 50 builds, engine R11, track kit, Library shelf and filter), 2.9 (50 native wildflower builds: Kansas, Chicago, North Carolina) |
| `2026-10-02-tile-builder.md` | approved 2 Oct 2026, in progress | PR 0.1 to 8.1; gates G1 (the brief) and G2 (the mockups) |

## One file per plan

`plans/YYYY-MM-DD-short-name.md`, dated the day the plan starts. A plan that grows keeps its file; a new direction
gets a new file.

## What a plan says

Every plan has these sections, in this order. A section that does not apply says "None" in one line.

```markdown
# <Name>

Status: draft | approved <date> | in progress | done <date> | dropped <date>

What started it: Jordan's words, dated. Where the plan came from, and what it replaces or carries over.

## Why
The problem, with the evidence: what was found, what was measured and what was not.

## Decisions
| # | Question | Answer |
|---|---|---|
| D1 | ... | Jordan's answer, dated, in his words where they matter |

## Phases, pull requests and keys
Keys are grouped under the pull request that carries them, and pull requests under phases.

### Phase 1 · <what this phase gets done>

**PR 1.1 · <what the pull request is> · branch `<name>` · GitHub #<n>**

| # | What | Files | Kind | Done when | Time |
|---|------|-------|------|-----------|------|
| 1a | ... | web/src/... | code | ... | 30 min |
| **G1** | **A gate: what Jordan reads or decides** | | gate | his words are in Decisions | |

## Gates that need Jordan
| Gate | When | What he does |
|---|---|---|

## Time bounds and self-checks
"As in plans/README.md", then anything this plan adds (checkpoints, run bounds).

## The rules of the build
"As in plans/README.md", then anything this plan adds.

## Critical files
What is read or reused and not rebuilt, with paths.

## Verification
Once, at the end.
| V | Check | Passes when |
|---|---|---|

## Jordan's testing after
T1, T2, ...: what he looks at or runs himself, and when.

## Build log (append, never rewrite)
| When (UTC) | PR · keys | Commit | Hours (est · used) | Result / re-evaluation | Next |
|---|---|---|---|---|---|

## Results
What happened: pull requests and commits, before and after, what's left.
```

Kind: design · document · code · check · setup · gate · live step (a merge to `main` that deploys, or a setting
changed on GitHub).

Update the status line, the Decisions, the build log and the Results as the work moves, and add a line to
`CHANGELOG.md` (newest first) in the same commit.

## Keys live under pull requests

- Every key belongs to exactly one pull request, named in the plan before the work starts. A key that turns out to
  need a second pull request gets a new key.
- A pull request is one branch from `main` and one reviewable change: its keys are done together or not at all.
- Every planned pull request is opened on GitHub as a draft when the plan is approved: its branch from `main` with one
  empty commit, its title starting "PR n.n · ", its description "Not started" with its keys. Every pull-request table
  has a "GitHub #" column, and each pull request's heading ends with its number.
- The pull request's description lists its keys with each "Done when" and the checks that were run. It is marked
  ready when its checks pass.
- A status report to Jordan is a table of pull requests with their keys under them.

## Time bounds and self-checks (every plan)

- **Every key has an estimate and a stop point**: 1.5 times the estimate, from its first edit to its pull request.
- **At the end of every pull request**, a build-log row: the estimate against the actual for each key, what was done
  against each "Done when", anything found.
- **Over the stop point**: stop and write in the log why; re-estimate the key and everything after it; go on only if
  the new total stays within 20 % of the plan's. Otherwise stop and ask Jordan, with the new table. At 2 times a key's
  estimate: always stop and ask.
- **Under half the estimate**: say so in the row, and re-read "Done when": something may have been skipped.
- **Checkpoints**, named in the plan: the whole plan against the clock, the keys left, the new finish estimate.
- **Run bounds**: each long run (end-to-end tests, thumbnails) has an expected time; at 2 times that, look.

## The rules of the build (every plan)

1. **One key at a time**, in the plan's order. A pull request starts with its row in the build log with a start time.
2. **Self-check before commit.** A key is done only when its "Done when" is true and its checks are green. The commit
   message names the key and the checks. Unchecked work is not committed.
3. **File size.** No source file over 500 lines (`web/scripts/size.mjs`, from PR 2.2).
4. **No workarounds.** A rule or tool that blocks correct work is changed in the plan, with Jordan's word, not worked
   around; the change is logged.
5. **Resume from the build log.** Every row ends with "Next". Nothing lives only in a chat.
6. **A key blocked on a gate waits**; the next key that does not depend on it goes ahead.
7. **Done for the plan** = the Verification table all green, the build log complete, Jordan's testing read. Then the
   Status line says done with the pull requests and commit ids.

## How a plan moves

| Stage | Where | What changes |
|---|---|---|
| Draft | plan mode, outside the repo (`~/.claude/plans/`) | Written and shown to Jordan; nothing in the repo yet |
| Approved | `plans/<date>-<name>.md` | The status line says "approved <date>", his words in Decisions; a line in `CHANGELOG.md`; the pull requests opened as drafts |
| In progress | the same file | One build-log row a pull request; the status line, Decisions and Results kept current in the same commit as the work |
| Done | the same file | The Verification table green, Results written, the status line says done |
| Archived | `plans/archive/` | Moved with `git mv`; only the status line and one note under it change |

## Roadmaps

`plans/roadmap/` holds the Archify workflow definition that draws the plan as swimlanes (one lane a stream of work,
one node a pull request, Jordan's gates in the top lane). Its README says how to draw it. The built page is drawn on
demand and never committed.

## No data

No photos or real names of children, no keys or tokens, no personal data of any family, in a plan or anywhere in the
repo. Examples use made-up projects and the set presets.
