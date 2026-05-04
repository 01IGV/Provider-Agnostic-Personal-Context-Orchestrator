# Execution Report

## Pass ID
`2026-05-04-178-narrow-local-real-source-read-boundary-contracts`

## Date
`2026-05-04`

## Pass Title
Narrow local real-source read boundary contracts.

## Objective
Define the first contract-only read boundary a future local real-source adapter v0 must satisfy before live source reads are implemented.

## Architectural Layer
- integration contracts
- system assembly
- proof/verification
- implementation documentation

## Bounded Scope of This Pass
- Add a narrow local real-source read boundary contract shape.
- Declare allowlisted repo-relative roots and source refs without reading files.
- Model path policy constraints and maximum read scope.
- Require compatibility with `bounded-real-source-adapter-contract/v1`.
- Require compatibility with `local-v0-source-materialization-receipt/v1`.
- Require provenance/permission/audit refs.
- Add verifier coverage proving the boundary remains non-executing.
- Add the verifier to `package.json` and CI.

## Out of Scope
- Actual live repo/file reads.
- Direct agent access to repo files.
- Arbitrary file or directory reads.
- User-selected source paths.
- Directory traversal, directory listing, or repo scanning.
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
- `packages/integration-contracts/src/narrow-local-real-source-read-boundary-vocabularies.ts`
- `packages/integration-contracts/src/narrow-local-real-source-read-boundary-types.ts`
- `packages/integration-contracts/src/narrow-local-real-source-read-boundary.ts`
- `packages/integration-contracts/src/index.ts`
- `packages/system-assembly/src/narrow-local-real-source-read-boundary-contracts-types.ts`
- `packages/system-assembly/src/narrow-local-real-source-read-boundary-contracts.ts`
- `packages/system-assembly/src/index.ts`
- `scripts/verify-narrow-local-real-source-read-boundary-contracts.mjs`
- `package.json`
- `.github/workflows/proof-output-regression.yml`
- `docs/04-implementation/CURRENT_IMPLEMENTATION_STATE.md`
- `docs/04-implementation/KNOWN_IMPLEMENTATION_ISSUES.md`
- `docs/04-implementation/execution-reports/2026-05-04-178-narrow-local-real-source-read-boundary-contracts.md`

## Changes Made
- Added `narrow-local-real-source-read-boundary/v1`.
- Declared one allowlisted repo-relative root: `docs/04-implementation`.
- Declared two allowlisted docs source refs for future local real-source adapter v0 reads.
- Added path policy constraints denying absolute paths, parent directory segments, glob patterns, symlink following, directory listing, recursive reads, and unknown source access.
- Added verifier coverage proving the boundary is contract-only and default-deny.

## Architectural Boundaries Preserved
- The boundary declares future read constraints but does not read files.
- The agent still does not receive direct repo file access.
- Live source reads remain denied.
- Source materialization receipt compatibility remains required.
- Provenance, permission, and audit refs remain required.
- MCP/API/runtime/provider/persistence/auth/model/storage/contour execution remains closed.

## Technical Decisions Made
- The first read boundary is intentionally narrow and documentation-only: current implementation state and known implementation issues.
- The boundary uses repo-relative source refs only.
- Each future read must produce a content digest after read.
- The maximum read size is capped at 65536 bytes per source ref.

## Verification Performed
- `npm run typecheck`
- `npm run contract:narrow-local-real-source-read-boundary:verify`
- `npm run contract:bounded-real-source-adapter:verify`
- `npm run tool:bounded-real-source-adapter-contract-sample:verify`
- `npm run proof:end-to-end:non-executing:verify`
- `npm run proof:authority-boundary-denial:verify`
- `git diff --check`

## Current Outcome
The repository can now express and verify the first narrow local real-source read boundary before any live source reads exist.

## Known Limitations After This Pass
- No live source adapter exists yet.
- No live repo/file reads are allowed yet.
- No direct agent file access is allowed.
- The boundary does not materialize real source content.

## Known Issues Introduced or Updated
- Updated `KNOWN_IMPLEMENTATION_ISSUES.md` to include narrow local real-source read boundary contracts in the active integration/system-assembly boundary drift risks.

## Next Recommended Bounded Step
After merge and CI observation:

```text
docs/state-next-step-alignment-after-narrow-local-real-source-read-boundary-contracts
```

## Notes for Next Agent or Session
This boundary is the contract a later implementation must satisfy. It does not itself grant read permission or expose files directly to agents.
