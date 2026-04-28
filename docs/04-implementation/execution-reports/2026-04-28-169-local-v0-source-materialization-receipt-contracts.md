# Execution Report

## Pass ID
`2026-04-28-169-local-v0-source-materialization-receipt-contracts`

## Date
`2026-04-28`

## Pass Title
Local v0 source materialization receipt contracts.

## Objective
Add a machine-readable source materialization receipt to the local v0 agent-facing bounded context path so agents can inspect selected scope/source refs and default-deny boundaries.

## Architectural Layer
Integration contracts, local deterministic source adapter, local JSON observation summary, local v0 guided sample verification, and implementation documentation.

## Bounded Scope of This Pass
- Add `local-v0-source-materialization-receipt/v1` shape to the local deterministic source adapter contract.
- Include requested scope ids, selected scope ids, selected source refs, catalog ref, materialization boundary, provenance/permission/audit refs, receipt items, and default-deny posture.
- Include the receipt in the bounded context response payload.
- Expose receipt id/ref/boundary and denied source-read flags in the local JSON observation summary.
- Verify the receipt through the local deterministic source adapter and repo-work guided sample artifact path.
- Update state documentation, known issue drift coverage, and execution reporting.

## Out of Scope
- Direct agent access to repo files.
- Live repo file reads.
- Arbitrary file or directory reads.
- User-selected source paths.
- Directory traversal, repo scanning, or git execution in the tool path.
- MCP/API transport, runtime handlers, provider SDK calls, concrete persistence, auth/IAM, policy execution, permission grants, model calls, storage writes beyond explicit artifacts, or contour execution.

## Modules Affected
- `integration-contracts` local deterministic source adapter contracts
- local JSON response observation summary
- local v0 repo-work guided sample verifier
- implementation documentation

## Files Affected
- `packages/integration-contracts/src/local-deterministic-context-source-adapter-types.ts`
- `packages/integration-contracts/src/local-deterministic-context-source-adapter.ts`
- `packages/integration-contracts/src/local-json-request-response-runner-types.ts`
- `packages/integration-contracts/src/local-json-request-response-runner.ts`
- `scripts/verify-local-deterministic-context-source-adapter.mjs`
- `scripts/verify-local-v0-repo-work-context-guided-sample-artifact-set.mjs`
- `docs/04-implementation/CURRENT_IMPLEMENTATION_STATE.md`
- `docs/04-implementation/KNOWN_IMPLEMENTATION_ISSUES.md`
- `docs/04-implementation/execution-reports/2026-04-28-169-local-v0-source-materialization-receipt-contracts.md`

## Changes Made
- Added `LocalV0SourceMaterializationReceiptShape`.
- Added receipt posture and receipt item shapes.
- Materialized `source_materialization_receipt` inside the bounded context response payload.
- Added observation-summary receipt fields for agent-readable inspection.
- Extended verifier coverage for default deterministic adapter output and `scope:repo-work-context` guided sample artifacts.

## Architectural Boundaries Preserved
- The receipt is contract-only, deterministic, and local-only.
- The receipt records selected refs and boundary metadata only; it does not read live source files.
- The agent still receives context through bounded request/response artifacts.
- Direct repo file access, arbitrary source loading, runtime execution, provider calls, persistence, model calls, permission grants, and contour execution remain denied.

## Technical Decisions Made
- The receipt is carried in the existing bounded context response payload because that is already the agent-facing context envelope.
- The receipt contains refs and metadata rather than source content, keeping it explainable without expanding access.
- Observation summary fields are intentionally short so agents can detect the receipt without parsing the full response payload first.

## Verification Performed
```bash
npm run typecheck
npm run contract:local-deterministic-context-source:verify
npm run tool:local-v0-repo-work-context-guided-sample:verify
npm run contract:local-v0-source-catalog:verify
npm run tool:local-v0-source-catalog-guided:verify
npm run proof:local-v0-source-catalog-guided-run:verify
npm run proof:local-json-agent-local-v0-acceptance:verify
npm run proof:end-to-end:non-executing:verify
npm run proof:invocation-denial:verify
npm run proof:handler-boundary-denial:verify
npm run proof:surface-boundary-denial:verify
npm run proof:authority-boundary-denial:verify
git diff --check
```

## Current Outcome
The agent-facing local v0 bounded context path now includes a source materialization receipt explaining what was requested, what was selected, which refs apply, and which access/runtime actions remain denied.

This improves explainability and auditability without turning the tool into a file browser, MCP server, or runtime executor.

## Known Limitations After This Pass
- The receipt still describes deterministic inline/local fixture context only.
- The system still does not read live repo files as source material.
- There is still no generalized source loader or runtime transport.

## Known Issues Introduced or Updated
`KNOWN_IMPLEMENTATION_ISSUES.md` risk 8 was updated to include local v0 source materialization receipt contracts in the local CLI/file IO drift risk.

## Next Recommended Bounded Step
After merge and CI observation:

```text
docs/state-next-step-alignment-after-local-v0-source-materialization-receipt-contracts
```

## Notes for Next Agent or Session
The receipt is not permission to read sources. It is an audit/explainability envelope over an already bounded source selection.
