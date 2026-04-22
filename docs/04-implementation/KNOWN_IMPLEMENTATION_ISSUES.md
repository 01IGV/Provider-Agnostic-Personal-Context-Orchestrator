# Known Implementation Issues

## Purpose of this file

This file records the currently known technical issues, open implementation risks, and unresolved constraints in the repository.

It should stay current-focused.
It is not a historical bug archive and not a replacement for per-pass execution reports.

---

## Current Status

The repository now has twelve materialized packages: `core-foundation`, `core-domain`, `persistence-contracts`, `governance`, `read-path`, `pack-loop`, `write-path`, `handoff`, `audit-eval`, `integration-contracts`, `provider-adapters`, and `system-assembly`.

No concrete code-level defects are currently confirmed for these packages, but architecture and sequencing risks remain active.

---

## Current Known Issues and Constraints

### 1. Risk of surface-contract boundary drift
- **Layer / Area:** integration contracts boundaries
- **Status:** open
- **Severity:** medium
- **Description:** now that `integration-contracts` exists, there is elevated risk of mixing surface contract shapes with runtime handler or transport execution behavior.
- **Impact:** integration contract layer can lose provider-neutrality and become runtime-coupled.
- **Recommended next action:** keep `integration-contracts` shape-only and enforce new cross-package consistency checks as runtime surfaces are introduced.

### 2. Risk of trust-layer boundary drift
- **Layer / Area:** audit/evaluation layer boundaries
- **Status:** open
- **Severity:** high
- **Description:** `audit-eval` may drift into runtime monitoring or integration execution behavior.
- **Impact:** trust contracts can lose canonical portability.
- **Recommended next action:** keep `audit-eval` contract/quality-model focused.

### 3. Risk of provider-adapter boundary drift
- **Layer / Area:** provider adapter boundaries
- **Status:** open
- **Severity:** medium
- **Description:** now that `provider-adapters` exists, there is elevated risk of mixing adapter projection/normalization contracts with runtime handler/transport execution behavior.
- **Impact:** canonical contours and surface contracts can become execution-coupled and provider-shaped.
- **Recommended next action:** keep `provider-adapters` edge-shape/primitives only; preserve newly added tool↔operation contract consistency validation in future runtime passes.

### 4. Risk of premature concrete persistence adapters
- **Layer / Area:** persistence strategy
- **Status:** open
- **Severity:** medium
- **Description:** with surface contracts now present, there is pressure to add concrete adapters before provider/system assembly layers stabilize.
- **Impact:** contracts can be bypassed and architecture can lock into early storage assumptions.
- **Recommended next action:** keep concrete persistence deferred until provider-adapters and system-assembly stabilization.

### 5. Risk of system-assembly boundary drift
- **Layer / Area:** system assembly boundaries
- **Status:** open
- **Severity:** medium
- **Description:** now that `system-assembly` exists, there is elevated risk of turning composition/wiring primitives into runtime handler or transport execution behavior.
- **Impact:** assembly layer can become a hidden runtime orchestration layer and blur separation between contracts and execution.
- **Recommended next action:** keep `system-assembly` contract-first, keep shared boundary typing centralized, and introduce runtime layers as separate bounded packages/modules.

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
