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

Feature-branch verification note (April 24, 2026): local `npm install`, `npm run typecheck`, and `npm run proof:end-to-end:non-executing` passed for `feat/deterministic-local-proof-command`; the connector-only verification gap is closed before merge.

Feature-branch verification note (April 24, 2026): local `npm install`, `npm run typecheck`, and `npm run proof:end-to-end:non-executing` passed for `feat/stable-proof-artifact-contract`; the connector-only verification gap is closed before merge.

Feature-branch verification note (April 24, 2026): local `npm install`, `npm run typecheck`, `npm run proof:end-to-end:non-executing`, and `npm run proof:end-to-end:non-executing:verify` passed for `feat/proof-output-golden-snapshot-regression-guard`; the connector-only verification gap is closed before merge.

Post-merge CI verification note (April 24, 2026): `Proof Output Regression` passed on `main` at commit `9a375ef`, verifying `npm install`, `npm run typecheck`, and `npm run proof:end-to-end:non-executing:verify`; the CI workspace project-reference and forced typecheck/proof command verification issue is closed.

Feature-branch verification note (April 24, 2026): local `npm install`, `npm run typecheck`, and `npm run proof:end-to-end:non-executing:verify` passed for `feat/first-executable-adjacent-contour-invocation-seam`; the connector-only verification gap is closed before merge.

Feature-branch verification note (April 24, 2026): local `npm install`, `npm run typecheck`, `npm run proof:end-to-end:non-executing:verify`, and `npm run proof:invocation-denial:verify` passed for `feat/invocation-denial-proof-integration`; the connector-only verification gap is closed before merge.

Feature-branch verification note (April 24, 2026): local `npm install`, `npm run typecheck`, `npm run proof:end-to-end:non-executing:verify`, and `npm run proof:invocation-denial:verify` passed for `feat/first-runtime-adjacent-handler-boundary-contracts`; the connector-only verification gap is closed before merge.

Feature-branch verification note (April 24, 2026): local `npm install`, `npm run typecheck`, `npm run proof:end-to-end:non-executing:verify`, `npm run proof:invocation-denial:verify`, and `npm run proof:handler-boundary-denial:verify` passed for `feat/handler-boundary-denial-proof-integration`; the connector-only verification gap is closed before merge.

Feature-branch verification note (April 24, 2026): local `npm install`, `npm run typecheck`, `npm run proof:end-to-end:non-executing:verify`, `npm run proof:invocation-denial:verify`, and `npm run proof:handler-boundary-denial:verify` passed for `feat/first-mcp-api-adjacent-surface-boundary-contracts`; the connector-only verification gap is closed before merge.

Feature-branch verification note (April 24, 2026): local `npm install`, `npm run typecheck`, `npm run proof:end-to-end:non-executing:verify`, `npm run proof:invocation-denial:verify`, `npm run proof:handler-boundary-denial:verify`, and `npm run proof:surface-boundary-denial:verify` passed for `feat/surface-boundary-denial-proof-integration`; the connector-only verification gap is closed before merge.

Feature-branch verification note (April 24, 2026): local `npm install`, `npm run typecheck`, `npm run proof:end-to-end:non-executing:verify`, `npm run proof:invocation-denial:verify`, `npm run proof:handler-boundary-denial:verify`, and `npm run proof:surface-boundary-denial:verify` passed for `feat/first-auth-iam-adjacent-authority-boundary-contracts`; the connector-only verification gap is closed before merge.

Post-merge verification note (April 27, 2026): local `npm install`, `npm run typecheck`, `npm run proof:end-to-end:non-executing:verify`, `npm run proof:invocation-denial:verify`, `npm run proof:handler-boundary-denial:verify`, `npm run proof:surface-boundary-denial:verify`, and `npm run proof:authority-boundary-denial:verify` passed for `feat/authority-boundary-denial-proof-integration`; PR CI `Proof Output Regression` passed before merge. Push-run observation for merge commit `49a42d8` could not be independently confirmed through the connector in this session.

Post-merge verification note (April 27, 2026): local `npm install`, `npm run typecheck`, `npm run proof:end-to-end:non-executing:verify`, `npm run proof:invocation-denial:verify`, `npm run proof:handler-boundary-denial:verify`, `npm run proof:surface-boundary-denial:verify`, `npm run proof:authority-boundary-denial:verify`, and `npm run contract:agent-context-request:verify` passed for `feat/agent-context-request-boundary-contracts`; PR CI `Proof Output Regression` passed before merge. Push-run observation for merge commit `e2dbb9d` could not be independently confirmed through the connector in this session.

Post-merge verification note (April 27, 2026): local `npm install`, `npm run typecheck`, `npm run proof:end-to-end:non-executing:verify`, `npm run proof:invocation-denial:verify`, `npm run proof:handler-boundary-denial:verify`, `npm run proof:surface-boundary-denial:verify`, `npm run proof:authority-boundary-denial:verify`, `npm run contract:agent-context-request:verify`, and `npm run contract:local-deterministic-context-source:verify` passed sequentially for `feat/local-deterministic-context-source-adapter-contracts`; PR CI `Proof Output Regression` passed before merge.

---

## Current Known Issues and Constraints

### 1. Risk of surface-contract boundary drift
- **Layer / Area:** integration contracts boundaries
- **Status:** open
- **Severity:** medium
- **Description:** now that `integration-contracts` includes execution-attempt lifecycle, normalized outcome linkage, publication-preparation linkage, dispatch-readiness linkage contracts, delivery-dispatch intent linkage contracts, delivery-dispatch precheck linkage contracts, first MCP/API-adjacent surface boundary contracts, first agent context request boundary contracts, and local deterministic context source adapter contracts, there is elevated risk of mixing surface/source contract shapes with MCP server implementation, MCP tool/resource registration, API routes/controllers, runtime handler, publication delivery, dispatch execution, delivery, precheck execution, concrete persistence, provider SDK calls, model calls, storage writes, or transport execution behavior.
- **Impact:** integration contract layer can lose provider-neutrality and become runtime-coupled.
- **Recommended next action:** keep `integration-contracts` shape-only and enforce cross-package consistency checks as runtime/protocol surfaces evolve.

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
- **Description:** now that `system-assembly` includes lifecycle, normalized outcome mapping, publication-preparation mapping, dispatch-readiness mapping, delivery-dispatch intent mapping, delivery-dispatch precheck mapping, end-to-end proof-path composition, stable proof artifact contract shaping, first executable-adjacent contour invocation seam shaping, invocation-denial proof integration, first runtime-adjacent handler boundary composition, handler-boundary denial proof integration, first MCP/API-adjacent surface boundary composition, surface-boundary denial proof integration, first auth/IAM-adjacent authority boundary composition, first agent context request boundary composition, and local deterministic context source adapter composition, there is elevated risk of turning composition/wiring/internal lifecycle/outcome/preparation/readiness/intent/precheck-shaping/proof-composition/proof-artifact-contract/seam-definition/proof-integration/boundary/source composition primitives into runtime handler, MCP/API implementation, auth/IAM implementation, publication delivery, dispatch execution, delivery, contour execution, concrete persistence, provider SDK calls, model calls, storage writes, or transport execution behavior.
- **Impact:** assembly layer can become a hidden runtime orchestration/control-plane layer and blur separation between contracts and execution.
- **Recommended next action:** keep `system-assembly` contract-first, keep shared boundary typing centralized, and introduce runtime/protocol/auth execution behavior only through explicitly approved future execution-layer passes.

### 6. Risk of runtime-surface boundary drift
- **Layer / Area:** runtime-surface boundaries
- **Status:** open
- **Severity:** medium
- **Description:** runtime-surface now includes multiple envelope and boundary contracts, including delivery-runtime handoff placeholders, execution-attempt lifecycle envelopes, normalized execution-attempt outcome envelopes, execution-attempt outcome publication-preparation envelopes, publication dispatch-readiness envelopes, delivery-dispatch intent envelopes, delivery-dispatch precheck envelopes, and first runtime-adjacent handler boundary contracts. Future runtime passes may still mix entrypoint/handler shape contracts with concrete MCP/API handlers, dispatch runtime, delivery runtime, publication delivery, dispatch execution, precheck execution, or provider transport execution.
- **Impact:** runtime-surface can still become an execution layer prematurely, breaking bounded sequencing and contaminating provider-neutral contract boundaries.
- **Recommended next action:** keep `runtime-surface` contract-only and isolate concrete handlers/dispatch/delivery/publication/precheck/transport behavior in future dedicated runtime implementation passes.

### 7. Risk of internal-dispatch, completion-ingress, finalization, publication/egress, channel-gating, dispatch-intent, delivery-precheck, runtime-handoff-placeholder, execution-attempt-lifecycle, normalized outcome, publication-preparation, dispatch-readiness, delivery-dispatch intent, delivery-dispatch precheck, proof-path, stable proof artifact, golden snapshot, executable-adjacent seam, invocation-denial proof, runtime-adjacent handler boundary, handler-boundary denial proof, MCP/API-adjacent surface boundary, surface-boundary denial proof, auth/IAM-adjacent authority boundary, and authority-boundary denial proof drift
- **Layer / Area:** system-assembly internal runtime dispatch skeleton and local proof/seam/boundary infrastructure
- **Status:** open
- **Severity:** medium
- **Description:** internal dispatch skeleton and proof/seam/boundary infrastructure now include readiness reporting/linkage, contour-invocation gate contracts, execution-handoff/attempt-trace contracts, execution-result reconciliation contracts, execution-completion ingress contracts, execution-outcome finalization contracts, execution-outcome publication/egress contracts, publication-channel-binding/egress-gating contracts, publication dispatch-intent contracts, delivery-precheck/handler-boundary contracts, delivery-runtime-handoff placeholder contracts, delivery-runtime execution-attempt lifecycle contracts, delivery-runtime execution-attempt outcome normalization contracts, delivery-runtime execution-attempt outcome publication-preparation contracts, publication-preparation-to-dispatch-readiness contracts, dispatch-readiness-to-delivery-dispatch-intent contracts, delivery-dispatch-intent-to-delivery-dispatch-precheck contracts, end-to-end proof-path composition, stable proof artifact contract shaping, golden snapshot verification, first executable-adjacent contour invocation seam shaping, invocation-denial proof integration, first runtime-adjacent handler boundary contracts, handler-boundary denial proof integration, first MCP/API-adjacent surface boundary contracts, surface-boundary denial proof integration, first auth/IAM-adjacent authority boundary contracts, and authority-boundary denial proof integration. Future passes may still accidentally evolve these planning/reporting/gate/handoff/reconciliation/completion-ingress/finalization/publication/channel-gating/dispatch-intent/delivery-precheck/runtime-handoff/lifecycle/outcome-normalization/publication-preparation/dispatch-readiness/delivery-dispatch-intent/delivery-dispatch-precheck/proof-composition/proof-artifact-contract/golden-snapshot/seam-definition/proof-integration/boundary-contract layers into real contour invocation, handler runtime, MCP/API implementation, auth/IAM implementation, delivery runtime, publication delivery, dispatch execution, precheck execution, or transport execution.
- **Impact:** `system-assembly`, `runtime-surface`, `integration-contracts`, `governance`, and local proof/seam/boundary infrastructure can lose composition/planning/normalization/preparation/readiness/intent/precheck-shaping/proof-composition/proof-artifact-contract/golden-snapshot/seam-definition/proof-integration/boundary-contract role and become implicit runtime/protocol/auth execution layers.
- **Recommended next action:** keep internal dispatch and proof/seam/boundary infrastructure strictly contract/planning/reporting/gate/handoff/reconciliation/completion-ingress/finalization/publication/channel-gating/dispatch-intent/delivery-precheck/runtime-handoff/lifecycle/outcome-normalization/publication-preparation/dispatch-readiness/delivery-dispatch-intent/delivery-dispatch-precheck/proof-composition/proof-artifact-contract/golden-snapshot/seam-definition/proof-integration/boundary-contract-oriented, and isolate any future real contour invocation or delivery/publication/dispatch/precheck/handler/protocol/auth execution into explicitly approved execution-layer passes.

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
