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

Post-merge verification note (April 27, 2026): local `npm install`, `npm run typecheck`, `npm run proof:end-to-end:non-executing:verify`, `npm run proof:invocation-denial:verify`, `npm run proof:handler-boundary-denial:verify`, `npm run proof:surface-boundary-denial:verify`, `npm run proof:authority-boundary-denial:verify`, `npm run contract:agent-context-request:verify`, and `npm run contract:local-deterministic-context-source:verify` passed for `feat/bounded-context-package-envelope-hardening`; PR CI `Proof Output Regression` passed before merge.

Post-merge verification note (April 27, 2026): local `npm install`, `npm run typecheck`, `npm run proof:end-to-end:non-executing:verify`, `npm run proof:invocation-denial:verify`, `npm run proof:handler-boundary-denial:verify`, `npm run proof:surface-boundary-denial:verify`, `npm run proof:authority-boundary-denial:verify`, `npm run contract:agent-context-request:verify`, `npm run contract:local-deterministic-context-source:verify`, and `npm run contract:agent-consumable-response:verify` passed for `feat/agent-consumable-response-contract-verification`; PR CI `Proof Output Regression` passed before merge.

Post-merge verification note (April 27, 2026): local `npm install`, `npm run typecheck`, `npm run proof:end-to-end:non-executing:verify`, `npm run proof:invocation-denial:verify`, `npm run proof:handler-boundary-denial:verify`, `npm run proof:surface-boundary-denial:verify`, `npm run proof:authority-boundary-denial:verify`, `npm run contract:agent-context-request:verify`, `npm run contract:local-deterministic-context-source:verify`, `npm run contract:agent-consumable-response:verify`, and `npm run contract:first-protocol-surface-adapter:verify` passed for `feat/first-protocol-surface-adapter-shape-for-verified-response`; PR CI `Proof Output Regression` passed before merge.

Post-merge verification note (April 27, 2026): local `npm install`, `npm run typecheck`, `npm run proof:end-to-end:non-executing:verify`, `npm run proof:invocation-denial:verify`, `npm run proof:handler-boundary-denial:verify`, `npm run proof:surface-boundary-denial:verify`, `npm run proof:authority-boundary-denial:verify`, `npm run contract:agent-context-request:verify`, `npm run contract:local-deterministic-context-source:verify`, `npm run contract:agent-consumable-response:verify`, `npm run contract:first-protocol-surface-adapter:verify`, `npm run contract:local-json-request-response-runner:verify`, `npm run proof:local-json-fixture-runner:verify`, `npm run contract:minimal-local-json-fixture-runner-cli-boundary:verify`, `npm run tool:first-local-json-cli-file-io-boundary:verify`, `npm run tool:local-json-request-fixture-authoring:verify`, `npm run tool:local-json-single-command-run:verify`, `npm run tool:constrained-local-json-request-variation:verify`, and a constrained `npm run tool:local-json:run` smoke passed for `feat/constrained-local-json-request-variation`; PR #41 was mergeable and merged to `main`. GitHub connector did not return workflow runs or status checks for PR #41 head `4f53871` during this session, so remote CI status could not be independently confirmed through the connector.

Post-merge verification note (April 27, 2026): local `npm install`, `npm run typecheck`, `npm run proof:end-to-end:non-executing:verify`, `npm run proof:invocation-denial:verify`, `npm run proof:handler-boundary-denial:verify`, `npm run proof:surface-boundary-denial:verify`, `npm run proof:authority-boundary-denial:verify`, `npm run contract:agent-context-request:verify`, `npm run contract:local-deterministic-context-source:verify`, `npm run contract:agent-consumable-response:verify`, `npm run contract:first-protocol-surface-adapter:verify`, `npm run contract:local-json-request-response-runner:verify`, `npm run proof:local-json-fixture-runner:verify`, `npm run contract:minimal-local-json-fixture-runner-cli-boundary:verify`, `npm run tool:first-local-json-cli-file-io-boundary:verify`, `npm run tool:local-json-request-fixture-authoring:verify`, `npm run tool:local-json-single-command-run:verify`, `npm run tool:constrained-local-json-request-variation:verify`, `npm run tool:minimal-local-source-fixture-selection:verify`, and a scoped `npm run tool:local-json:run` smoke passed for `feat/minimal-local-source-fixture-selection`; PR #43 was mergeable and merged to `main`. GitHub connector did not return workflow runs or status checks for PR #43 head `eb1056c` during this session, so remote CI status could not be independently confirmed through the connector.

Post-merge verification note (April 28, 2026): local `npm install`, `npm run typecheck`, `npm run proof:end-to-end:non-executing:verify`, `npm run proof:invocation-denial:verify`, `npm run proof:handler-boundary-denial:verify`, `npm run proof:surface-boundary-denial:verify`, `npm run proof:authority-boundary-denial:verify`, `npm run contract:agent-context-request:verify`, `npm run contract:local-deterministic-context-source:verify`, `npm run contract:agent-consumable-response:verify`, `npm run contract:first-protocol-surface-adapter:verify`, `npm run contract:local-json-request-response-runner:verify`, `npm run proof:local-json-fixture-runner:verify`, `npm run contract:minimal-local-json-fixture-runner-cli-boundary:verify`, `npm run tool:first-local-json-cli-file-io-boundary:verify`, `npm run tool:local-json-request-fixture-authoring:verify`, `npm run tool:local-json-single-command-run:verify`, `npm run tool:constrained-local-json-request-variation:verify`, `npm run tool:minimal-local-source-fixture-selection:verify`, `npm run tool:local-json-response-observation-summary:verify`, and an observation `npm run tool:local-json:run` smoke passed for `feat/local-json-response-observation-summary`; PR #45 passed GitHub Actions `Proof Output Regression` run `25039962270` and merged to `main` as `1e3a17e`.

Post-merge verification note (April 28, 2026): local `npm install`, `npm run typecheck`, `npm run proof:end-to-end:non-executing:verify`, `npm run proof:invocation-denial:verify`, `npm run proof:handler-boundary-denial:verify`, `npm run proof:surface-boundary-denial:verify`, `npm run proof:authority-boundary-denial:verify`, `npm run contract:agent-context-request:verify`, `npm run contract:local-deterministic-context-source:verify`, `npm run contract:agent-consumable-response:verify`, `npm run contract:first-protocol-surface-adapter:verify`, `npm run contract:local-json-request-response-runner:verify`, `npm run proof:local-json-fixture-runner:verify`, `npm run contract:minimal-local-json-fixture-runner-cli-boundary:verify`, `npm run tool:first-local-json-cli-file-io-boundary:verify`, `npm run tool:local-json-request-fixture-authoring:verify`, `npm run tool:local-json-single-command-run:verify`, `npm run tool:constrained-local-json-request-variation:verify`, `npm run tool:minimal-local-source-fixture-selection:verify`, `npm run tool:local-json-response-observation-summary:verify`, `npm run tool:agent-readable-response-use-guidance:verify`, and an agent-readable `npm run tool:local-json:run` smoke passed for `feat/agent-readable-response-use-guidance`; PR #47 passed GitHub Actions `Proof Output Regression` run `25040644880` and merged to `main` as `ee9ff38`.

Post-merge verification note (April 28, 2026): local `npm run typecheck`, `npm run tool:agent-request-response-schema:verify`, and `npm run tool:agent-request-response-schema:print` passed for `feat/agent-request-response-schema-export`; PR #49 passed GitHub Actions `Proof Output Regression` run `25041242244` and merged to `main` as `9c7bc45`. The schema export remains an agent-readable contract artifact and does not add MCP/API runtime, provider calls, persistence, model calls, permission grants, or contour execution.

Post-merge verification note (April 28, 2026): local `npm run tool:schema-aware-local-json-examples:verify` passed for `feat/schema-aware-local-json-fixture-examples`; PR #51 passed GitHub Actions `Proof Output Regression` run `25041839791` and merged to `main` as `f9dfbea`. The examples are generated from the existing bounded local JSON path and do not add MCP/API runtime, provider calls, persistence, model calls, permission grants, or contour execution.

Post-merge verification note (April 28, 2026): local `npm run typecheck`, `npm run tool:schema-aware-local-json-examples:verify`, `npm run tool:local-json-example-artifacts:verify`, and a `npm run tool:local-json-example-artifacts:write` smoke passed for `feat/local-json-example-artifact-materialization`; PR #53 passed GitHub Actions `Proof Output Regression` run `25042383206` and merged to `main` as `2775c29`. Artifact writes are limited to explicitly provided output paths and do not add MCP/API runtime, provider calls, persistence, model calls, permission grants, or contour execution.

Post-merge verification note (April 28, 2026): local `npm run proof:local-json-example-artifact-round-trip:verify` passed for `feat/local-json-example-artifact-round-trip-proof`; PR #55 passed GitHub Actions `Proof Output Regression` run `25047534917` and merged to `main` as `5195fc7`. The proof feeds materialized request artifacts through the existing bounded local JSON runner and does not add MCP/API runtime, provider calls, persistence, model calls, permission grants, or contour execution.

Post-merge verification note (April 28, 2026): local `npm run tool:local-json-agent-tool-manifest:verify` and `npm run tool:local-json-agent-tool-manifest:print` passed for `feat/local-json-agent-tool-manifest`; PR #57 passed GitHub Actions `Proof Output Regression` run `25048097681` and merged to `main` as `8d73cf2`. The manifest is read-only tool discovery and does not add MCP/API runtime, provider calls, persistence, model calls, permission grants, or contour execution.

Post-merge verification note (April 28, 2026): local `npm run typecheck`, `npm run tool:local-json-agent-tool-manifest:verify`, `npm run tool:local-json-agent-tool-manifest-artifact:verify`, `npm run tool:local-json-agent-tool-manifest:print`, a scoped `npm run tool:local-json-agent-tool-manifest:write -- --manifest-output /private/tmp/local-json-agent-tool-manifest-smoke.json` smoke, and the baseline denial proof commands passed for `feat/local-json-agent-tool-manifest-artifact-writer`; PR #59 passed GitHub Actions `Proof Output Regression` run `25048647676` and merged to `main` as `7d49dd0`. The artifact writer writes only an explicitly provided manifest output path and does not add MCP/API runtime, provider calls, persistence, model calls, permission grants, or contour execution.

Post-merge verification note (April 28, 2026): local `npm run typecheck`, `npm run tool:local-json-agent-handoff-bundle:verify`, `npm run tool:local-json-agent-tool-manifest:verify`, a scoped `npm run tool:local-json-agent-handoff-bundle:write` smoke, and the baseline denial proof commands passed for `feat/local-json-agent-handoff-bundle-writer`; PR #61 passed GitHub Actions `Proof Output Regression` run `25049448293` and merged to `main` as `ef90a1a`. The handoff bundle writer writes only explicitly provided artifact output paths and does not add MCP/API runtime, provider calls, persistence, model calls, permission grants, arbitrary source loading, or contour execution.

Post-merge verification note (April 28, 2026): local `npm run typecheck`, `npm run proof:local-json-agent-handoff-bundle-round-trip:verify`, `npm run tool:local-json-agent-tool-manifest:verify`, and the baseline denial proof commands passed for `feat/local-json-agent-handoff-bundle-round-trip-proof`; PR #64 passed GitHub Actions `Proof Output Regression` run `25050820253` and merged to `main` as `c5e9bc7`. The proof consumes temp handoff bundle artifacts through the existing bounded local JSON runner and does not add MCP/API runtime, provider calls, persistence, model calls, permission grants, arbitrary source loading, or contour execution.

---

## Current Known Issues and Constraints

### 1. Risk of surface-contract boundary drift
- **Layer / Area:** integration contracts boundaries
- **Status:** open
- **Severity:** medium
- **Description:** now that `integration-contracts` includes execution-attempt lifecycle, normalized outcome linkage, publication-preparation linkage, dispatch-readiness linkage contracts, delivery-dispatch intent linkage contracts, delivery-dispatch precheck linkage contracts, first MCP/API-adjacent surface boundary contracts, first agent context request boundary contracts, local deterministic context source adapter contracts, bounded context package envelope contracts, bounded real-source adapter contracts, narrow local real-source read boundary contracts, verified response protocol-surface adapter contracts, and local JSON request/response runner contracts, there is elevated risk of mixing surface/source/package/protocol-adapter/runner contract shapes with MCP server implementation, MCP tool/resource registration, API routes/controllers, runtime handler, publication delivery, dispatch execution, delivery, precheck execution, concrete persistence, provider SDK calls, model calls, storage writes, file IO, CLI execution, live source reads, or transport execution behavior.
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
- **Description:** now that `system-assembly` includes lifecycle, normalized outcome mapping, publication-preparation mapping, dispatch-readiness mapping, delivery-dispatch intent mapping, delivery-dispatch precheck mapping, end-to-end proof-path composition, stable proof artifact contract shaping, first executable-adjacent contour invocation seam shaping, invocation-denial proof integration, first runtime-adjacent handler boundary composition, handler-boundary denial proof integration, first MCP/API-adjacent surface boundary composition, surface-boundary denial proof integration, first auth/IAM-adjacent authority boundary composition, first agent context request boundary composition, local deterministic context source adapter composition, bounded real-source adapter contract composition, narrow local real-source read boundary composition, first protocol-surface adapter shape composition, and local JSON request/response runner shape composition, there is elevated risk of turning composition/wiring/internal lifecycle/outcome/preparation/readiness/intent/precheck-shaping/proof-composition/proof-artifact-contract/seam-definition/proof-integration/boundary/source/runner composition primitives into runtime handler, MCP/API implementation, auth/IAM implementation, publication delivery, dispatch execution, delivery, contour execution, concrete persistence, provider SDK calls, model calls, storage writes, file IO, CLI execution, live source reads, or transport execution behavior.
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

### 8. Risk of local JSON CLI/file IO drifting into broader execution
- **Layer / Area:** local JSON request/response runner boundary
- **Status:** open
- **Severity:** medium
- **Description:** the local JSON request/response runner shape, local JSON fixture runner proof, minimal local JSON fixture runner CLI/file boundary, first scoped local CLI file IO path, deterministic request fixture authoring helper, single-command local wrapper, constrained request-intent variation, minimal local source fixture selection, local JSON response observation summary, agent-readable response use guidance, agent request/response schema export, schema-aware local JSON fixture examples, local JSON example artifact materialization, local JSON example artifact round-trip proof, local JSON agent tool manifest, local JSON agent tool manifest artifact writer, local JSON agent handoff bundle writer, local JSON agent handoff bundle round-trip proof, local JSON agent handoff bundle consumption CLI boundary, local JSON agent request runner from explicit request artifact, local JSON agent request runner sample artifact set, local JSON agent local v0 tool-pack artifact set, local JSON agent local v0 acceptance proof, local JSON agent local v0 single-command runner, local v0 source catalog contracts, local v0 source catalog tool-pack artifact, local v0 source catalog guided run proof, local v0 source catalog guided command, local v0 source catalog guided command sample artifacts, local v0 repo-work context source catalog contracts, local v0 repo-work context guided sample artifacts, local v0 source materialization receipt contracts, bounded real-source adapter contract sample artifacts, narrow local real-source read boundary contracts, local real-source adapter v0, local real-source agent request runner v0, local real-source single-command agent tool v0, local real-source single-command sample artifact set, local real-source tool-pack artifact set, local real-source tool-pack acceptance proof, local real-source tool-pack consumption CLI boundary, local real-source tool-pack index consumption boundary, local real-source tool-pack single-command consumption v0, local real-source tool-pack single-command consumption sample artifacts, local real-source agent tool readiness index, local real-source agent tool readiness acceptance proof, local real-source agent tool entrypoint v0, local real-source agent tool entrypoint request options v0, local real-source agent tool entrypoint acceptance proof, local real-source agent tool run receipt v0, and local real-source agent tool run receipt acceptance proof create pressure to expand into generalized file loading, process orchestration, MCP/API transport behavior, provider calls, persistence adapters, model calls, or direct runtime invocation.
- **Impact:** the project could accidentally turn the first useful local tool path into an unbounded runtime surface.
- **Recommended next action:** keep the local CLI fixture-scoped, deterministic, and default-deny; expand only through explicit bounded passes with verification.

### 9. Local real-source verifier import stall in this desktop session
- **Layer / Area:** local real-source agent tool verification
- **Status:** open
- **Severity:** medium
- **Description:** during `codex/feat-local-real-source-agent-tool-one-command-run-v0`, direct local `node` verification of the new one-command verifier stalled while importing the pre-existing local real-source entrypoint chain. A control check showed the already-existing `verify-local-real-source-agent-tool-entrypoint-v0.mjs` path also stalled in this desktop session, so the stall is not isolated to the new wrapper logic.
- **Impact:** local desktop verification may be unable to complete real-source entrypoint-derived verifier commands even when syntax checks and manifest verification pass. GitHub Actions remains the required gate for the affected npm verifier before merge.
- **Recommended next action:** use CI as the final proof gate for the one-command verifier in this pass, and consider a later bounded maintenance pass to reduce real-source CLI import-chain weight or add a faster non-runtime smoke verifier.

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
