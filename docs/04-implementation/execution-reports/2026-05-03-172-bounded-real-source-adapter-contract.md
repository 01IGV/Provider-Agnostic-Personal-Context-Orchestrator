# Execution Report

## Pass ID
`2026-05-03-172-bounded-real-source-adapter-contract`

## Date
`2026-05-03`

## Pass Title
Bounded real-source adapter contract.

## Objective
Define the non-executing contract a future real source adapter must satisfy before any live source reads are introduced.

## Architectural Layer
- integration contracts
- system assembly
- proof/verification
- implementation documentation

## Bounded Scope of This Pass
- Add a declaration-only bounded real-source adapter contract.
- Require allowlisted source selection through `local-v0-source-catalog/v1`.
- Require compatibility with `local-v0-source-materialization-receipt/v1`.
- Require authority, provenance, permission, and audit refs.
- Add verifier coverage proving the contract remains default-deny and non-executing.
- Add the verifier to package scripts and CI.

## Out of Scope
- Direct agent access to repo files.
- Live repo/file reads.
- Arbitrary file or directory reads.
- User-selected source paths.
- Directory traversal or repo scanning.
- Git command execution as part of the tool path.
- MCP server, MCP tool/resource registration, API routes/controllers, or runtime handlers.
- Provider SDK calls, concrete persistence, auth/IAM implementation, token/session validation, policy engine execution, permission grants, model calls, storage writes, or contour execution.

## Modules Affected
- `packages/integration-contracts`
- `packages/system-assembly`
- `scripts`
- `.github/workflows`
- `docs/04-implementation`

## Files Affected
- `packages/integration-contracts/src/bounded-real-source-adapter-contract-vocabularies.ts`
- `packages/integration-contracts/src/bounded-real-source-adapter-contract-types.ts`
- `packages/integration-contracts/src/bounded-real-source-adapter-contract.ts`
- `packages/integration-contracts/src/index.ts`
- `packages/system-assembly/src/bounded-real-source-adapter-contract-types.ts`
- `packages/system-assembly/src/bounded-real-source-adapter-contract.ts`
- `packages/system-assembly/src/index.ts`
- `scripts/verify-bounded-real-source-adapter-contract.mjs`
- `package.json`
- `.github/workflows/proof-output-regression.yml`
- `docs/04-implementation/CURRENT_IMPLEMENTATION_STATE.md`
- `docs/04-implementation/KNOWN_IMPLEMENTATION_ISSUES.md`
- `docs/04-implementation/execution-reports/2026-05-03-172-bounded-real-source-adapter-contract.md`

## Changes Made
- Added a contract-only bounded real-source adapter capability declaration.
- Added a materialization contract requiring receipt/provenance/permission/audit envelopes.
- Added explicit denial flags for direct agent file access, live source reads, arbitrary paths, runtime/MCP/API behavior, provider calls, persistence, auth/IAM implementation, permission grants, model calls, storage writes, and contour execution.
- Added deterministic system-assembly composition from the existing agent request, local v0 source catalog, and local deterministic adapter refs.
- Added verifier and CI coverage for the new contract.

## Architectural Boundaries Preserved
- The agent still does not receive direct repo file access.
- The contract does not perform live source reads.
- The contract carries future adapter requirements without binding a runtime adapter.
- Source materialization remains receipt-backed and default-deny.
- MCP/API/runtime/provider/persistence/auth/model/storage/contour execution remains closed.

## Technical Decisions Made
- The new adapter is modeled as `future_real_source_adapter`, not as an executable adapter.
- Capability declaration is separate from materialization contract metadata.
- `local-v0-source-catalog/v1` and `local-v0-source-materialization-receipt/v1` remain the compatibility anchors.
- The verifier asserts absence of source content and selected source refs on the contract object.

## Verification Performed
- `npm run typecheck`
- `npm run contract:bounded-real-source-adapter:verify`
- `npm run contract:local-deterministic-context-source:verify`
- `npm run contract:local-v0-source-catalog:verify`
- `npm run tool:local-v0-repo-work-context-guided-sample:verify`
- `npm run proof:end-to-end:non-executing:verify`
- `npm run proof:invocation-denial:verify`
- `npm run proof:handler-boundary-denial:verify`
- `npm run proof:surface-boundary-denial:verify`
- `npm run proof:authority-boundary-denial:verify`
- `git diff --check`

## Current Outcome
The repository can now express the default-deny contract a future real source adapter must satisfy before real source materialization exists.

## Known Limitations After This Pass
- No live source adapter exists yet.
- No live repo/file reads are allowed yet.
- No direct agent file access is allowed.
- No real source materialization output is produced by this contract.

## Known Issues Introduced or Updated
- Updated `KNOWN_IMPLEMENTATION_ISSUES.md` to include bounded real-source adapter contracts in the active integration/system-assembly boundary drift risks.

## Next Recommended Bounded Step
After merge and CI observation:

```text
docs/state-next-step-alignment-after-bounded-real-source-adapter-contract
```

Then decide the next implementation direction from repo evidence. Do not jump directly to live reads without a repo-first alignment/verdict pass.

## Notes for Next Agent or Session
Treat the bounded real-source adapter contract as a gate, not as implementation permission. It says what a future adapter must prove before live reads can exist; it does not itself read files or grant agent file access.
