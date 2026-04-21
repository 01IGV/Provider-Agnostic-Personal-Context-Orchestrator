# Execution Documentation and Reporting Protocol

## 0. Purpose of this document

This document defines how a coding agent should document implementation work after each meaningful execution step.

Its role is to prevent two opposite failure modes:
- implementation progress that exists only in code and is hard to reconstruct later;
- excessive narrative documentation that duplicates the codebase and creates noise.

This protocol defines the canonical balance:
- the architecture documents remain the source of truth for what the system is;
- execution documentation records what was actually implemented, changed, decided, verified, and left unresolved.

This document is not a replacement for code, tests, or architecture docs.
It is the canonical protocol for **technical execution reporting and implementation continuity**.

---

## 1. Core thesis

The coding agent should document execution in a way that preserves continuity, technical legibility, and implementation trust without rewriting the codebase in prose.

### Canonical statement

> After each meaningful implementation pass, the coding agent should leave behind a concise technical execution artifact that explains what changed, why it changed, what was verified, what remains open, and what the next safe step is.

The goal is not documentation volume.
The goal is reliable technical continuity.

---

## 2. Why this protocol must exist

Without a dedicated execution documentation protocol, implementation work usually degrades into one of these weak patterns:
- code changes exist without technical narrative;
- decisions are scattered across commit messages only;
- current system state is unclear after several passes;
- future agents must reverse-engineer intent from diffs;
- unresolved risks and known limitations disappear between sessions;
- architecture docs remain idealized while implementation reality diverges silently.

### Rule

> Execution documentation exists to preserve what architecture docs do not: implementation reality.

---

## 3. Separation of documentation layers

The repository should keep three distinct documentation layers.

### 3.1. Canonical architecture layer
Stored in the established `/docs/00-foundation`, `/docs/01-architecture`, `/docs/02-contracts`, `/docs/03-governance`, and `/docs/04-implementation` documents.

This layer answers:
- what the system is;
- how it should be designed;
- what its intended structure and rules are.

### 3.2. Execution documentation layer
Stored in execution reports and current implementation state documents.

This layer answers:
- what was actually implemented;
- what changed in this pass;
- what was verified;
- what remains open;
- what should happen next.

### 3.3. Code-native explanation layer
Stored in code comments, package READMEs, and module-local docs where needed.

This layer answers:
- how a specific module works in code terms;
- how to use a package;
- what assumptions or invariants a module has.

### Rule

> Architecture docs define intent, execution docs define reality, and code-native docs define module-level usage.

---

## 4. What the coding agent should document after each pass

After each meaningful implementation pass, the coding agent should produce an execution artifact that records at minimum:

1. what was the intended scope of the pass
2. what was actually changed
3. which files or modules were touched
4. what architectural boundary was preserved
5. what was verified
6. what remains unresolved
7. what the next bounded implementation step should be

### Rule

> A pass report should capture implementation signal, not generic progress narration.

---

## 5. What should count as a meaningful implementation pass

A report should be created after a pass that materially changes the technical state of the repo.

### Examples of meaningful passes
- creation of a new package
- creation of a new contour service
- introduction of a new canonical record family in code
- first implementation of a governance rule family
- introduction of a new integration surface
- implementation of provider adapter skeleton
- significant refactor that changes architectural shape
- important verification pass with meaningful findings

### Examples that do not necessarily require a full new report
- trivial formatting-only changes
- typo fixes
- tiny import cleanup
- superficial renaming with no architectural relevance

### Rule

> Reports should follow meaningful technical state changes, not every tiny edit.

---

## 6. Recommended execution documentation structure

The repository should maintain execution documentation in a dedicated area.

### Recommended structure

```text
/docs/04-implementation
  /execution-reports
    _TEMPLATE_EXECUTION_REPORT.md
    YYYY-MM-DD-01-<slug>.md
    YYYY-MM-DD-02-<slug>.md
  CURRENT_IMPLEMENTATION_STATE.md
  KNOWN_IMPLEMENTATION_ISSUES.md
```

### Meaning of each artifact

#### `execution-reports/`
Immutable or mostly append-only per-pass reports.

#### `CURRENT_IMPLEMENTATION_STATE.md`
Rolling summary of where implementation stands now.

#### `KNOWN_IMPLEMENTATION_ISSUES.md`
Rolling list of currently known technical issues, constraints, or unresolved risks.

### Rule

> Per-pass reports preserve history; rolling state files preserve current orientation.

---

## 7. Per-pass execution reports

Per-pass execution reports should be the default execution artifact after meaningful changes.

### Naming convention
Use a chronological convention such as:

`YYYY-MM-DD-01-<short-pass-slug>.md`

Examples:
- `2026-04-21-01-core-foundation-skeleton.md`
- `2026-04-21-02-core-domain-record-models.md`

### Why this format
- easy chronological sorting
- human-readable
- supports multiple passes per day
- helps future agent continuity

### Rule

> Each execution report should represent one bounded implementation pass, not a vague time period.

---

## 8. Recommended structure of each execution report

Each per-pass report should contain sections like these.

### 8.1. Pass title
Short technical name of the pass.

### 8.2. Objective
What this pass was meant to do.

### 8.3. Architectural scope
Which layer, contour, or package this pass touched.

### 8.4. Changes made
What was created, updated, or removed.

### 8.5. Files and modules affected
Concrete file/module list or grouped summary.

### 8.6. Technical decisions made
Important implementation decisions taken during the pass.

### 8.7. Verification performed
What was checked, tested, linted, reviewed, or otherwise validated.

### 8.8. Current outcome
What the repo can now do or express that it could not before.

### 8.9. Known limitations after this pass
What remains incomplete, fragile, or intentionally deferred.

### 8.10. Next recommended bounded step
What the next implementation pass should be.

### Rule

> Each execution report should be specific enough to resume work without diff archaeology.

---

## 9. What an execution report should not become

A good execution report should not become:
- a dump of all code contents;
- a copy of the diff;
- a marketing progress update;
- a vague diary entry;
- a replacement for commit messages;
- a replacement for architecture docs.

### Rule

> Execution reports should summarize implementation meaning, not reproduce implementation detail line by line.

---

## 10. Rolling current implementation state

The repository should also keep one rolling current-state file.

### Recommended file
`docs/04-implementation/CURRENT_IMPLEMENTATION_STATE.md`

### Purpose
Provide a fast orientation point for the next coding session or next agent.

### It should summarize at minimum
- which packages/modules exist now;
- which layer is currently in progress;
- what the current strongest implemented contour is;
- what is intentionally not yet implemented;
- what the next recommended pass is.

### Update policy
This file should be updated after each meaningful pass, but should remain concise and current-facing.

### Rule

> Current state should be optimized for restart orientation, not historical detail.

---

## 11. Rolling known implementation issues

The repository should also keep one rolling known-issues file.

### Recommended file
`docs/04-implementation/KNOWN_IMPLEMENTATION_ISSUES.md`

### Purpose
Record the current known technical issues, unresolved risks, and implementation constraints.

### It should include at minimum
- issue title
- affected layer/module
- current status
- severity or impact
- known workaround if any
- next investigation or fix path

### Rule

> Known issues should be explicit enough that the next pass does not rediscover them accidentally.

---

## 12. Module-level technical documentation

Execution reports are not enough by themselves.
Important packages should also have lightweight module-level technical documentation.

### Recommended pattern
Each package may later contain a small `README.md` explaining:
- what the package is for;
- what it owns;
- what it does not own;
- its major exports;
- its key invariants.

### Why
Execution reports explain a pass.
Module READMEs explain a stable technical unit.

### Rule

> Per-pass docs explain change over time; module docs explain stable code ownership.

---

## 13. Architecture decision records vs execution reports

Not every implementation report is an architecture decision.
These should remain separate.

### Execution report
Records what was implemented in a pass.

### ADR-like record
Should be used only when a meaningful architectural choice changes or is locked in.

### Good discipline
- routine implementation changes -> execution report
- major architecture tradeoff or direction lock -> separate ADR-style note if needed later

### Rule

> Do not inflate every pass into an architecture decision, but do not bury architecture changes inside ordinary pass notes.

---

## 14. Relationship between code, commits, and execution reports

All three should exist, but serve different purposes.

### Commit message
Short transactional summary of what changed.

### Code
The source of executable truth.

### Execution report
The technical narrative of the pass and its consequences.

### Good pattern
A report should refer to:
- main modules/files touched;
- what was verified;
- what remains open.

It does not need to embed the whole diff.

### Rule

> Commit messages are too small, code is too detailed, and execution reports sit in the useful middle.

---

## 15. Documentation cadence policy for the coding agent

The coding agent should follow a simple cadence.

### After each meaningful implementation pass
Create or update:
1. one new per-pass execution report
2. `CURRENT_IMPLEMENTATION_STATE.md`
3. `KNOWN_IMPLEMENTATION_ISSUES.md` if relevant changes occurred

### After purely trivial changes
Only commit message and code changes may be enough.

### Rule

> Documentation cadence should follow technical significance, not mechanical edit count.

---

## 16. Recommended minimum fields for each execution report

Each report should include at least the following fields:

- `Pass ID`
- `Date`
- `Objective`
- `Architectural Layer`
- `Modules Affected`
- `Files Affected`
- `Changes Made`
- `Verification Performed`
- `Outcome`
- `Known Limitations`
- `Next Recommended Step`

### Rule

> Standard fields make execution reports easier to scan and compare over time.

---

## 17. Recommended style of execution reports

The reports should be:
- technical;
- concise;
- architecture-aware;
- implementation-specific;
- forward-useful.

They should avoid:
- excessive prose;
- motivational language;
- vague phrases like “improved system” without specifics;
- generic status language with no technical content.

### Rule

> Execution reports should read like disciplined engineering continuity artifacts.

---

## 18. Recommended execution-report quality criteria

A good report should allow the next agent or engineer to answer quickly:
- what exactly was done;
- what changed technically;
- what is now true in the repo;
- what remains unsafe or incomplete;
- what the next bounded step should be.

If a report fails to answer those, it is too weak.

---

## 19. Failure modes in execution documentation

The system should explicitly guard against these documentation failures:

### 19.1. Code-only continuity
Only code and commits exist; no technical pass narrative exists.

### 19.2. Diff duplication
Reports merely repeat diffs with no technical synthesis.

### 19.3. Architectural drift silence
Implementation reality changes, but no execution doc captures it.

### 19.4. Missing current-state orientation
Future sessions cannot tell where implementation currently stands.

### 19.5. Missing known-issues memory
The same technical problem is rediscovered repeatedly.

### 19.6. Over-documentation noise
Reports become verbose enough that nobody can scan them quickly.

### Rule

> Good execution documentation preserves technical continuity without becoming another form of noise.

---

## 20. Canonical protocol summary

The coding agent should follow this protocol:

### After each meaningful pass
- create one new execution report in `execution-reports/`
- update `CURRENT_IMPLEMENTATION_STATE.md`
- update `KNOWN_IMPLEMENTATION_ISSUES.md` if needed

### Use execution reports for
- what changed
- why it changed
- what was verified
- what remains open
- what should happen next

### Use rolling files for
- current orientation
- current issues

### Rule

> This protocol should preserve implementation continuity without duplicating architecture docs or code.

---

## 21. What this enables next

Once this protocol is accepted, the next useful implementation artifact is a dedicated first coding-agent start prompt that instructs the agent to:
- read the canonical docs;
- follow the repo/module sequence;
- perform one bounded first pass;
- produce the required execution documentation after completion.

This creates a full bridge from architecture to disciplined implementation.

---

## 22. Final statement

Execution documentation is the technical memory of implementation work.

Its quality determines whether future passes build on clear technical reality — or whether each new session has to reconstruct progress from code, commit history, and guesswork.
