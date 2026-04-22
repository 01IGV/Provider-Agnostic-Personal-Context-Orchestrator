# Known Implementation Issues

## Purpose of this file

This file records the currently known technical issues, open implementation risks, and unresolved constraints in the repository.

It should stay current-focused.
It is not a historical bug archive and not a replacement for per-pass execution reports.

---

## Current Status

The repository now has six materialized packages: `core-foundation`, `core-domain`, `persistence-contracts`, `governance`, `read-path`, and `pack-loop`.

No concrete code-level defects are currently confirmed for these packages, but architecture and sequencing risks remain active.

---

## Current Known Issues and Constraints

### 1. Remaining contour packages are not yet materialized
- **Layer / Area:** implementation depth
- **Status:** open
- **Severity:** medium
- **Description:** `read-path` and `pack-loop` exist, but `write-path` and `handoff` contour packages are still missing.
- **Impact:** full canonical execution loop is not yet materialized end-to-end.
- **Recommended next action:** implement `packages/write-path` as the next bounded pass.

### 2. Risk of contour boundary drift
- **Layer / Area:** contour separation
- **Status:** open
- **Severity:** high
- **Description:** once multiple contours exist, there is elevated risk of leaking write/handoff behavior into read or pack contours.
- **Impact:** contour invariants degrade and auditability weakens.
- **Recommended next action:** keep write-path and handoff responsibilities isolated to their dedicated packages.

### 3. Risk of provider-first implementation drift
- **Layer / Area:** provider neutrality
- **Status:** open
- **Severity:** high
- **Description:** MCP/API/provider-specific implementation may appear too early and leak host-specific assumptions into contour/core layers.
- **Impact:** canonical semantics may become provider-shaped.
- **Recommended next action:** defer integration/provider layers until contour packages stabilize.

### 4. Risk of premature concrete persistence adapters
- **Layer / Area:** persistence strategy
- **Status:** open
- **Severity:** medium
- **Description:** with contours now appearing, there is pressure to add concrete adapters before contour behavior stabilizes.
- **Impact:** contracts can be bypassed and architecture can lock into early storage assumptions.
- **Recommended next action:** keep concrete persistence deferred until contour + governance paths are stable.

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
