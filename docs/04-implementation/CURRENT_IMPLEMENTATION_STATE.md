# Current Implementation State

## Purpose of this file

This file is the rolling orientation point for the current implementation state of the repository.

It should stay concise and current-facing.
It is not a historical changelog and not a replacement for per-pass execution reports.

---

## Current Phase

**Layer 4 entered: first contour primitives (`read-path`) are materialized on top of foundation/domain/contracts/governance.**

The repository now has five packages from the canonical sequence.

---

## Current Strongest Completed Layer

The strongest completed code layers are now:

1. `packages/core-foundation`
2. `packages/core-domain`
3. `packages/persistence-contracts`
4. `packages/governance`
5. `packages/read-path`

`read-path` now provides request normalization, intent/mode, scope resolution, candidate discovery/filter/rank, and pack-input preparation primitives.

---

## Current Code State

The repository now has:
- workspace scaffold for package-based implementation;
- `packages/core-foundation` semantic primitives;
- `packages/core-domain` canonical entity layer;
- `packages/persistence-contracts` persistence abstractions;
- `packages/governance` authority/evaluator primitives;
- `packages/read-path` selection and acquisition contour primitives.

The repository still does **not** have:
- `packages/pack-loop`;
- `packages/write-path`;
- `packages/handoff`;
- integration/provider surfaces and system assembly;
- any concrete persistence adapter implementation.

---

## Current Recommended Package Sequence

The preferred early implementation sequence remains:

1. `core-foundation` (done)
2. `core-domain` (done)
3. `persistence-contracts` (done)
4. `governance` (done)
5. `read-path` (done)
6. `pack-loop`
7. `write-path`
8. `handoff`
9. `audit-eval`
10. `integration-contracts`
11. `provider-adapters`
12. `system-assembly`

---

## Current Architectural Guardrails

The next coding pass must preserve these guardrails:
- do not mix read-path responsibilities into pack-loop/write-path/handoff layers;
- do not introduce concrete persistence implementation in contour packages;
- do not introduce MCP/API handlers before contour packages stabilize;
- keep runtime/provider logic out of core contour packages;
- keep governance authority separate from contour execution composition.

---

## Current Documentation Protocol Status

Execution documentation protocol is exercised across five bounded passes:
- `2026-04-21-01-core-foundation-skeleton.md`
- `2026-04-21-02-core-domain-canonical-entities.md`
- `2026-04-22-01-persistence-contracts-canonical-interfaces.md`
- `2026-04-22-02-governance-primitives-and-decisioning.md`
- `2026-04-22-03-read-path-primitives-and-selection.md`

---

## Current Known Implementation Limits

Current limits after this pass:
- no pack-loop contour package yet;
- no write-path contour package yet;
- no handoff contour package yet;
- no integration/provider layers yet;
- no concrete persistence adapters yet.

---

## Next Recommended Bounded Pass

**Bounded Pass:** materialize `packages/pack-loop` with packing strategy, section planning, assignment, and pack artifact assembly primitives, while keeping provider projection out of scope.

---

## Notes for Next Agent or Session

When resuming:
- use `@orchestrator/read-path` outputs as the only input contract into `pack-loop`;
- do not let pack-loop reopen raw discovery as a primary path;
- preserve strict contour separation and provider-neutral semantics.
