# Known Implementation Issues

## Purpose of this file

This file records the currently known technical issues, open implementation risks, and unresolved constraints in the repository.

It should stay current-focused.
It is not a historical bug archive and not a replacement for per-pass execution reports.

---

## Current Status

The repository now has thirteen materialized packages: `core-foundation`, `core-domain`, `persistence-contracts`, `governance`, `read-path`, `pack-loop`, `write-path`, `handoff`, `audit-eval`, `integration-contracts`, `provider-adapters`, `system-assembly`, and `runtime-surface`.

No concrete code-level defects are currently confirmed for these packages, but architecture and sequencing risks remain active.

---

## Current Known Issues and Constraints

### 1. Risk of surface-contract boundary drift
- **Layer / Area:** integration contracts boundaries
- **Status:** open
- **Severity:** medium
- **Description:** now that `integration-contracts` exists, there is elevated risk of mixing surface contract shapes with runtime handler or transport execution behavior.
- **Impact:** integration contract layer can lose provider-neutrality and become runtime-coupled.
- **Recommended next action:** keep `integration-contracts` shape-only and enforce cross-package consistency checks as runtime surfaces evolve.

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
- **Recommended next action:** keep `provider-adapters` edge-shape/primitives only; preserve tool/operation contract consistency validation in future runtime passes.

### 4. Risk of premature concrete persistence adapters
- **Layer / Area:** persistence strategy
- **Status:** open
- **Severity:** medium
- **Description:** with surface/runtime-adjacent contracts now present, there is pressure to add concrete adapters before execution boundaries stabilize.
- **Impact:** contracts can be bypassed and architecture can lock into early storage assumptions.
- **Recommended next action:** keep concrete persistence deferred until explicitly scoped.

### 5. Risk of system-assembly boundary drift
- **Layer / Area:** system assembly boundaries
- **Status:** open
- **Severity:** medium
- **Description:** now that `system-assembly` exists, there is elevated risk of turning composition/wiring/internal lifecycle primitives into runtime handler or transport execution behavior.
- **Impact:** assembly layer can become a hidden runtime orchestration/control-plane layer and blur separation between contracts and execution.
- **Recommended next action:** keep `system-assembly` contract-first, keep shared boundary typing centralized, and introduce runtime execution behavior only through explicitly approved future execution-layer passes.

### 6. Risk of runtime-surface boundary drift
- **Layer / Area:** runtime-surface boundaries
- **Status:** open
- **Severity:** medium
- **Description:** runtime-surface now includes multiple envelope contracts, including delivery-runtime handoff placeholders and execution-attempt lifecycle envelopes. Future runtime passes may still mix entrypoint/handler shape contracts with concrete MCP/API handlers, dispatch runtime, or provider transport execution.
- **Impact:** runtime-surface can still become an execution layer prematurely, breaking bounded sequencing and contaminating provider-neutral contract boundaries.
- **Recommended next action:** keep `runtime-surface` contract-only and isolate concrete handlers/dispatch/transport behavior in future dedicated runtime implementation passes.

### 7. Risk of internal-dispatch, completion-ingress, finalization, publication/egress, channel-gating, dispatch-intent, delivery-precheck, runtime-handoff-placeholder, and execution-attempt-lifecycle boundary drift
- **Layer / Area:** system-assembly internal runtime dispatch skeleton
- **Status:** open
- **Severity:** medium
- **Description:** internal dispatch skeleton now includes readiness reporting/linkage, contour-invocation gate contracts, execution-handoff/attempt-trace contracts, execution-result reconciliation contracts, execution-completion ingress contracts, execution-outcome finalization contracts, execution-outcome publication/egress contracts, publication-channel-binding/egress-gating contracts, publication dispatch-intent contracts, delivery-precheck/handler-boundary contracts, delivery-runtime-handoff placeholder contracts, and delivery-runtime execution-attempt lifecycle contracts in addition to lookup/resolution/validation/planning. Future passes may still accidentally evolve these planning/reporting/gate/handoff/reconciliation/completion-ingress/finalization/publication/channel-gating/dispatch-intent/delivery-precheck/runtime-handoff/lifecycle layers into real contour invocation, handler runtime, or transport execution.
- **Impact:** `system-assembly` can lose composition/planning-only role and become an implicit runtime execution layer.
- **Recommended next action:** keep internal dispatch strictly contract/planning/reporting/gate/handoff/reconciliation/completion-ingress/finalization/publication/channel-gating/dispatch-intent/delivery-precheck/runtime-handoff/lifecycle-oriented, and isolate any future real contour invocation or delivery execution into explicitly approved execution-layer passes.

### 8. Typecheck confirmation required after connector-based lifecycle pass
- **Layer / Area:** repository verification
- **Status:** open
- **Severity:** medium
- **Description:** the execution-attempt lifecycle pass was applied through GitHub connector file operations rather than a local git/npm workspace. Full `npm run typecheck` could not be executed in-session.
- **Impact:** possible TypeScript drift may remain until local/CI verification runs.
- **Recommended next action:** run `npm run typecheck` on branch `feat/delivery-runtime-execution-attempt-lifecycle-contracts`; if failures appear, perform one narrow lifecycle consistency fix pass.

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
