# Known Implementation Issues

## Purpose of this file

This file records the currently known technical issues, open implementation risks, and unresolved constraints in the repository.

It should stay current-focused.
It is not a historical bug archive and not a replacement for per-pass execution reports.

---

## Current Status

The repository now has thirteen materialized packages: `core-foundation`, `core-domain`, `persistence-contracts`, `governance`, `read-path`, `pack-loop`, `write-path`, `handoff`, `audit-eval`, `integration-contracts`, `provider-adapters`, `system-assembly`, and `runtime-surface`.

No concrete code-level defects are currently confirmed for these packages, but architecture and sequencing risks remain active.

Post-merge verification note (April 24, 2026): local `npm run typecheck` passed for `feat/delivery-runtime-execution-attempt-lifecycle-contracts`; the prior connector-only verification gap is closed.

Post-merge verification note (April 24, 2026): local `npm run typecheck` passed for `feat/delivery-runtime-execution-attempt-outcome-normalization-contracts`; the connector-only verification gap is closed.

Feature-branch verification note (April 24, 2026): local `npm install` and `npm run typecheck` passed for `feat/delivery-runtime-execution-attempt-outcome-publication-preparation-contracts`; the connector-only verification gap is closed before merge.

Feature-branch verification note (April 24, 2026): local `npm install` and `npm run typecheck` passed for `feat/publication-preparation-to-dispatch-readiness-contracts`; the connector-only verification gap is closed before merge.

Feature-branch verification note (April 24, 2026): local `npm install` and `npm run typecheck` passed for `feat/dispatch-readiness-to-delivery-dispatch-intent-contracts`; the connector-only verification gap is closed before merge.

Feature-branch verification note (April 24, 2026): local `npm install` and `npm run typecheck` passed for `feat/delivery-dispatch-intent-to-delivery-dispatch-precheck-contracts`; the connector-only verification gap is closed before merge.

Feature-branch verification note (April 24, 2026): local `npm install` and `npm run typecheck` passed for `refactor/delivery-chain-boundary-hardening-and-consistency-review`; the connector-only verification gap is closed before merge.

Feature-branch verification note (April 24, 2026): local `npm install` and `npm run typecheck` passed for `refactor/dispatch-readiness-runtime-boundary-naming-consistency`; the connector-only verification gap is closed before merge.

Feature-branch verification note (April 24, 2026): local `npm install` and `npm run typecheck` passed for `feat/end-to-end-non-executing-proof-path`; the connector-only verification gap is closed before merge.

---

## Current Known Issues and Constraints

### 1. Risk of surface-contract boundary drift
- **Layer / Area:** integration contracts boundaries
- **Status:** open
- **Severity:** medium
- **Description:** now that `integration-contracts` includes execution-attempt lifecycle, normalized outcome linkage, publication-preparation linkage, dispatch-readiness linkage contracts, delivery-dispatch intent linkage contracts, and delivery-dispatch precheck linkage contracts, there is elevated risk of mixing surface contract shapes with runtime handler, publication delivery, dispatch execution, delivery, precheck execution, or transport execution behavior.
- **Impact:** integration contract layer can lose provider-neutrality and become runtime-coupled.
- **Recommended next action:** keep `integration-contracts` shape-only and enforce cross-package consistency checks as runtime surfaces evolve.

### 2. Risk of trust-layer boundary drift
- **Layer / Area:** audit/evaluation layer boundaries
- **Status:** open
- **Severity:** high
- **Description:** `audit-eval` may drift into runtime monitoring, integration execution, publication-delivery, dispatch-execution, precheck-execution, or delivery-result semantics as normalized outcome, publication-preparation, dispatch-readiness, delivery-dispatch intent, delivery-dispatch precheck, and proof-path linkage expands.
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
- **Description:** now that `system-assembly` includes lifecycle, normalized outcome mapping, publication-preparation mapping, dispatch-readiness mapping, delivery-dispatch intent mapping, delivery-dispatch precheck mapping, and end-to-end proof-path composition, there is elevated risk of turning composition/wiring/internal lifecycle/outcome/preparation/readiness/intent/precheck-shaping/proof-composition primitives into runtime handler, publication delivery, dispatch execution, delivery, or transport execution behavior.
- **Impact:** assembly layer can become a hidden runtime orchestration/control-plane layer and blur separation between contracts and execution.
- **Recommended next action:** keep `system-assembly` contract-first, keep shared boundary typing centralized, and introduce runtime execution behavior only through explicitly approved future execution-layer passes.

### 6. Risk of runtime-surface boundary drift
- **Layer / Area:** runtime-surface boundaries
- **Status:** open
- **Severity:** medium
- **Description:** runtime-surface now includes multiple envelope contracts, including delivery-runtime handoff placeholders, execution-attempt lifecycle envelopes, normalized execution-attempt outcome envelopes, execution-attempt outcome publication-preparation envelopes, publication dispatch-readiness envelopes, delivery-dispatch intent envelopes, and delivery-dispatch precheck envelopes. Future runtime passes may still mix entrypoint/handler shape contracts with concrete MCP/API handlers, dispatch runtime, delivery runtime, publication delivery, dispatch execution, precheck execution, or provider transport execution.
- **Impact:** runtime-surface can still become an execution layer prematurely, breaking bounded sequencing and contaminating provider-neutral contract boundaries.
- **Recommended next action:** keep `runtime-surface` contract-only and isolate concrete handlers/dispatch/delivery/publication/precheck/transport behavior in future dedicated runtime implementation passes.

### 7. Risk of internal-dispatch, completion-ingress, finalization, publication/egress, channel-gating, dispatch-intent, delivery-precheck, runtime-handoff-placeholder, execution-attempt-lifecycle, normalized outcome, publication-preparation, dispatch-readiness, delivery-dispatch intent, delivery-dispatch precheck, and proof-path boundary drift
- **Layer / Area:** system-assembly internal runtime dispatch skeleton
- **Status:** open
- **Severity:** medium
- **Description:** internal dispatch skeleton now includes readiness reporting/linkage, contour-invocation gate contracts, execution-handoff/attempt-trace contracts, execution-result reconciliation contracts, execution-completion ingress contracts, execution-outcome finalization contracts, execution-outcome publication/egress contracts, publication-channel-binding/egress-gating contracts, publication dispatch-intent contracts, delivery-precheck/handler-boundary contracts, delivery-runtime-handoff placeholder contracts, delivery-runtime execution-attempt lifecycle contracts, delivery-runtime execution-attempt outcome normalization contracts, delivery-runtime execution-attempt outcome publication-preparation contracts, publication-preparation-to-dispatch-readiness contracts, dispatch-readiness-to-delivery-dispatch-intent contracts, delivery-dispatch-intent-to-delivery-dispatch-precheck contracts, and end-to-end proof-path composition in addition to lookup/resolution/validation/planning. Future passes may still accidentally evolve these planning/reporting/gate/handoff/reconciliation/completion-ingress/finalization/publication/channel-gating/dispatch-intent/delivery-precheck/runtime-handoff/lifecycle/outcome-normalization/publication-preparation/dispatch-readiness/delivery-dispatch-intent/delivery-dispatch-precheck/proof-composition layers into real contour invocation, handler runtime, delivery runtime, publication delivery, dispatch execution, precheck execution, or transport execution.
- **Impact:** `system-assembly` can lose composition/planning/normalization/preparation/readiness/intent/precheck-shaping/proof-composition-only role and become an implicit runtime execution layer.
- **Recommended next action:** keep internal dispatch strictly contract/planning/reporting/gate/handoff/reconciliation/completion-ingress/finalization/publication/channel-gating/dispatch-intent/delivery-precheck/runtime-handoff/lifecycle/outcome-normalization/publication-preparation/dispatch-readiness/delivery-dispatch-intent/delivery-dispatch-precheck/proof-composition-oriented, and isolate any future real contour invocation or delivery/publication/dispatch/precheck execution into explicitly approved execution-layer passes.

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
