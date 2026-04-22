# Known Implementation Issues

## Purpose of this file

This file records the currently known technical issues, open implementation risks, and unresolved constraints in the repository.

It should stay current-focused.
It is not a historical bug archive and not a replacement for per-pass execution reports.

---

## Current Status

The repository now has three materialized packages: `core-foundation`, `core-domain`, and `persistence-contracts`.

No concrete code-level defects are currently confirmed for these packages, but key sequencing and architecture risks remain active.

---

## Current Known Issues and Constraints

### 1. Only canonical semantic and contract layers are materialized
- **Layer / Area:** repository-wide implementation depth
- **Status:** open
- **Severity:** medium
- **Description:** foundational semantics, domain entities, and persistence contracts exist, but governance and contour behavior layers are still missing.
- **Impact:** system behavior is still non-executable at orchestration level.
- **Recommended next action:** implement `packages/governance` as the next bounded pass.

### 2. Risk of storage-first implementation drift
- **Layer / Area:** implementation sequencing
- **Status:** open
- **Severity:** high
- **Description:** after introducing persistence contracts, there is elevated risk of jumping directly into concrete adapters before governance and contour packages.
- **Impact:** architecture can collapse into implementation-first persistence decisions.
- **Recommended next action:** enforce sequence `persistence-contracts` -> `governance` -> contours, and keep adapters deferred.

### 3. Risk of provider-first implementation drift
- **Layer / Area:** provider neutrality
- **Status:** open
- **Severity:** high
- **Description:** MCP/API/provider-specific implementation may appear too early and leak host-specific assumptions into core layers.
- **Impact:** canonical semantics may become provider-shaped.
- **Recommended next action:** keep provider logic out of current layers and defer adapters until canonical contours and contracts exist.

### 4. Risk of monolithic package collapse
- **Layer / Area:** repository structure
- **Status:** open
- **Severity:** medium
- **Description:** as more code appears, there is still risk of collapsing contour/governance concerns into broad packages.
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
