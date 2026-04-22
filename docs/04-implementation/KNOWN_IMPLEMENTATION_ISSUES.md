# Known Implementation Issues

## Purpose of this file

This file records the currently known technical issues, open implementation risks, and unresolved constraints in the repository.

It should stay current-focused.
It is not a historical bug archive and not a replacement for per-pass execution reports.

---

## Current Status

The repository now has nine materialized packages: `core-foundation`, `core-domain`, `persistence-contracts`, `governance`, `read-path`, `pack-loop`, `write-path`, `handoff`, and `audit-eval`.

No concrete code-level defects are currently confirmed for these packages, but architecture and sequencing risks remain active.

---

## Current Known Issues and Constraints

### 1. Risk of trust-layer boundary drift
- **Layer / Area:** audit/evaluation layer boundaries
- **Status:** open
- **Severity:** high
- **Description:** now that `audit-eval` exists, there is elevated risk of mixing trust contracts with runtime monitoring, transport integration, or provider execution behavior.
- **Impact:** `audit-eval` can drift from canonical trust/quality contracts into runtime-specific implementation logic.
- **Recommended next action:** keep `audit-eval` type/contract focused and move any execution/runtime behavior to future integration/provider packages.

### 2. Risk of contour boundary drift
- **Layer / Area:** contour separation
- **Status:** open
- **Severity:** high
- **Description:** once all core contours exist, there is elevated risk of leaking integration/provider behavior into contour packages.
- **Impact:** contour invariants degrade and auditability weakens.
- **Recommended next action:** keep integration/provider responsibilities isolated to dedicated future packages.

### 3. Risk of provider-first implementation drift
- **Layer / Area:** provider neutrality
- **Status:** open
- **Severity:** high
- **Description:** MCP/API/provider-specific implementation may appear too early and leak host-specific assumptions into core layers.
- **Impact:** canonical semantics may become provider-shaped.
- **Recommended next action:** defer integration/provider layers until audit-eval and contracts layers stabilize.

### 4. Risk of premature concrete persistence adapters
- **Layer / Area:** persistence strategy
- **Status:** open
- **Severity:** medium
- **Description:** with core contours now present, there is pressure to add concrete adapters before trust/integration behavior stabilizes.
- **Impact:** contracts can be bypassed and architecture can lock into early storage assumptions.
- **Recommended next action:** keep concrete persistence deferred until trust layer and integration contracts are stable.

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
