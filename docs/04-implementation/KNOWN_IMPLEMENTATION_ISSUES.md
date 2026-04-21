# Known Implementation Issues

## Purpose of this file

This file records the currently known technical issues, open implementation risks, and unresolved constraints in the repository.

It should stay current-focused.
It is not a historical bug archive and not a replacement for per-pass execution reports.

---

## Current Status

The repository now has its first materialized package (`core-foundation`) and is no longer in pure pre-code state.

There are no detected code defects in the new foundation package at this stage, but several implementation risks and constraints remain active.

---

## Current Known Issues and Constraints

### 1. Only first package is materialized
- **Layer / Area:** repository-wide implementation depth
- **Status:** open
- **Severity:** medium
- **Description:** workspace scaffold and `packages/core-foundation` exist, but the rest of the planned package sequence is still missing.
- **Impact:** the system cannot execute canonical behavior yet; only semantic primitives are available.
- **Recommended next action:** implement `packages/core-domain` as the next bounded pass.

### 2. Risk of storage-first implementation drift
- **Layer / Area:** implementation sequencing
- **Status:** open
- **Severity:** high
- **Description:** subsequent passes may drift into concrete persistence before domain/governance boundaries are stable.
- **Impact:** provider-neutral architecture and contour boundaries can weaken early.
- **Recommended next action:** enforce sequence `core-foundation` -> `core-domain` -> `persistence-contracts` -> `governance` before contour-heavy code.

### 3. Risk of provider-first implementation drift
- **Layer / Area:** provider neutrality
- **Status:** open
- **Severity:** high
- **Description:** MCP/API/provider-specific implementation may appear too early and leak host-specific assumptions into core layers.
- **Impact:** canonical semantics may become provider-shaped.
- **Recommended next action:** keep provider logic out of early packages and defer adapters until canonical contours and contracts exist.

### 4. Risk of monolithic package collapse
- **Layer / Area:** repository structure
- **Status:** open
- **Severity:** medium
- **Description:** as more code appears, there is still risk of collapsing contour/governance concerns into broad core packages.
- **Impact:** architectural legibility and authority boundaries degrade.
- **Recommended next action:** preserve package ownership boundaries exactly as documented.

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
