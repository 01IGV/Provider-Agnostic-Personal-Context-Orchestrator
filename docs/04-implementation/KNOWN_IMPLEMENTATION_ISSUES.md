# Known Implementation Issues

## Purpose of this file

This file records the currently known technical issues, open implementation risks, and unresolved constraints in the repository.

It should stay current-focused.
It is not a historical bug archive and not a replacement for per-pass execution reports.

---

## Current Status

The repository now has four materialized packages: `core-foundation`, `core-domain`, `persistence-contracts`, and `governance`.

No concrete code-level defects are currently confirmed for these packages, but key sequencing and architecture risks remain active.

---

## Current Known Issues and Constraints

### 1. Contour behavior packages are not yet materialized
- **Layer / Area:** repository-wide implementation depth
- **Status:** open
- **Severity:** medium
- **Description:** semantic, contract, and governance layers exist, but contour behavior layers (`read-path`, `pack-loop`, `write-path`, `handoff`) are still missing.
- **Impact:** system behavior is still non-executable at operational loop level.
- **Recommended next action:** implement `packages/read-path` as the next bounded pass.

### 2. Risk of storage-first implementation drift
- **Layer / Area:** implementation sequencing
- **Status:** open
- **Severity:** high
- **Description:** there is ongoing risk of jumping into concrete adapters before contour packages are stabilized.
- **Impact:** architecture can collapse into implementation-first persistence decisions.
- **Recommended next action:** enforce sequence `governance` -> contours -> integration -> provider adapters, while keeping concrete adapters deferred.

### 3. Risk of provider-first implementation drift
- **Layer / Area:** provider neutrality
- **Status:** open
- **Severity:** high
- **Description:** MCP/API/provider-specific implementation may appear too early and leak host-specific assumptions into core layers.
- **Impact:** canonical semantics may become provider-shaped.
- **Recommended next action:** keep provider logic out of current layers and defer adapters until canonical contours and integration contracts exist.

### 4. Risk of monolithic package collapse
- **Layer / Area:** repository structure
- **Status:** open
- **Severity:** medium
- **Description:** as contour code appears, there is still risk of collapsing governance and contour concerns into broad packages.
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
