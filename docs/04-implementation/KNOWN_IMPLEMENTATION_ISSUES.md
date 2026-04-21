# Known Implementation Issues

## Purpose of this file

This file records the currently known technical issues, open implementation risks, and unresolved constraints in the repository.

It should stay current-focused.
It is not a historical bug archive and not a replacement for per-pass execution reports.

---

## Current Status

At the moment, there are **no known code-level implementation defects yet**, because the repository is still in the pre-code implementation stage.

However, there are important current implementation constraints and risks that should remain visible before coding begins.

---

## Current Known Issues and Constraints

### 1. No materialized code packages yet
- **Layer / Area:** repository-wide
- **Status:** open
- **Severity:** medium
- **Description:** the repository has strong canonical documentation, but no actual implementation packages yet.
- **Impact:** the next coding pass must create the initial workspace and semantic package skeleton before any contour logic can be implemented.
- **Recommended next action:** create workspace scaffolding and `packages/core-foundation` as the first bounded implementation pass.

### 2. Risk of storage-first implementation drift
- **Layer / Area:** implementation sequencing
- **Status:** open
- **Severity:** high
- **Description:** without strict adherence to the documented implementation order, a coding agent may start from persistence or data-backend convenience rather than canonical semantics.
- **Impact:** this would weaken provider-neutral architecture and blur contour boundaries early.
- **Recommended next action:** enforce the documented sequence: `core-foundation` -> `core-domain` -> `persistence-contracts` -> `governance` before contour-heavy code.

### 3. Risk of provider-first implementation drift
- **Layer / Area:** provider neutrality
- **Status:** open
- **Severity:** high
- **Description:** because the system is intended to connect to MCP-hosted environments such as Codex and ChatGPT-like hosts, there is a risk that early implementation becomes shaped around one host/runtime.
- **Impact:** canonical semantics could quietly become provider-shaped.
- **Recommended next action:** keep provider-specific logic out of early packages and defer provider adapters until canonical contours and contracts already exist.

### 4. Risk of monolithic package collapse
- **Layer / Area:** repository structure
- **Status:** open
- **Severity:** high
- **Description:** a coding agent may attempt to create one broad `core` package instead of the semantically separated packages already specified.
- **Impact:** read/pack/write/handoff/governance boundaries would become harder to preserve.
- **Recommended next action:** enforce the documented package family structure from the first workspace pass.

### 5. Execution-documentation protocol not yet exercised in practice
- **Layer / Area:** implementation continuity
- **Status:** open
- **Severity:** low
- **Description:** the execution-documentation protocol now exists in documentation, but it has not yet been used by a real coding pass.
- **Impact:** the first coding pass is the first real test of whether reporting discipline is followed correctly.
- **Recommended next action:** require the first coding pass to produce:
  - one execution report,
  - an update to `CURRENT_IMPLEMENTATION_STATE.md`,
  - and an update to this file if new issues appear.

---

## Update Policy

This file should be updated when:
- a new meaningful implementation issue appears;
- an existing issue changes materially;
- an issue is resolved;
- a previously theoretical architectural risk becomes a concrete repo issue.

This file should not be updated for trivial or temporary editor noise.

---

## Resolution Policy

When an issue is resolved, it may either:
- be removed if no continuity value remains,
- or be moved to a future historical issue/archive workflow if such a workflow is introduced later.

For now, this file should remain focused on **currently active implementation issues and constraints**.
