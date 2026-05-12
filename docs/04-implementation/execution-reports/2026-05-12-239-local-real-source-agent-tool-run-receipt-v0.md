# Execution Report

## Pass ID
`2026-05-12-239-local-real-source-agent-tool-run-receipt-v0`

## Date
`2026-05-12`

## Pass Title
Local real-source agent tool run receipt v0.

## Objective
Add one compact machine-readable receipt for an AI agent after a local real-source agent tool entrypoint run.

## Files Affected
Created:

- `scripts/local-real-source-agent-tool-run-receipt-v0-cli.mjs`
- `scripts/verify-local-real-source-agent-tool-run-receipt-v0.mjs`
- `docs/04-implementation/execution-reports/2026-05-12-239-local-real-source-agent-tool-run-receipt-v0.md`

Updated:

- `package.json`
- `.github/workflows/proof-output-regression.yml`
- `scripts/local-json-agent-tool-manifest-cli.mjs`
- `scripts/verify-local-json-agent-tool-manifest.mjs`
- `docs/04-implementation/CURRENT_IMPLEMENTATION_STATE.md`
- `docs/04-implementation/KNOWN_IMPLEMENTATION_ISSUES.md`

## Changes Made
- Added a receipt writer command that accepts an existing entrypoint summary and explicit receipt output path.
- The writer reads only entrypoint-discovered artifacts and writes one compact run receipt.
- The receipt summarizes request intent, selected scope/source refs, bounded response/run artifact paths, contract refs, content digests, source materialization receipt, provenance/permission/audit refs, verifier commands, and default-deny runtime posture.
- Added a verifier for the run receipt.
- Added manifest discovery and CI coverage for the new command.

## Architectural Boundaries Preserved
The receipt is artifact-only and local. It does not add MCP/API transport, runtime handlers, provider calls, concrete persistence, auth/IAM implementation, model calls, permission grants, arbitrary source loading, direct repo file access for agents, or contour execution.

## Verification Performed
Initial direct checks passed:

```bash
node --check scripts/local-real-source-agent-tool-run-receipt-v0-cli.mjs
node --check scripts/verify-local-real-source-agent-tool-run-receipt-v0.mjs
node scripts/verify-local-real-source-agent-tool-run-receipt-v0.mjs
node scripts/verify-local-json-agent-tool-manifest.mjs
```

## Current Outcome
An AI agent can now get a single compact receipt for one local real-source entrypoint run instead of inspecting several artifacts first.

## Known Limitations After This Pass
The receipt is still local CLI/artifact based. It is not MCP/API transport and does not register a runtime tool.

## Known Issues Introduced or Updated
Updated risk 8 in `KNOWN_IMPLEMENTATION_ISSUES.md` to include the run receipt in the local CLI/file IO drift risk.

## Next Recommended Bounded Step
Run full milestone verification, then prepare one PR for `feat/local-real-source-agent-tool-run-receipt-v0`.
