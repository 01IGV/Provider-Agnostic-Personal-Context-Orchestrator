# Execution Report

## Pass ID
`2026-04-28-151-local-v0-source-catalog-guided-run-proof`

## Date
`2026-04-28`

## Pass Title
Local v0 source catalog guided run proof.

## Objective
Prove that an AI agent can start from the local v0 tool-pack, discover the source catalog, choose an allowlisted scope, run the bounded local v0 command, and verify the response against the selected catalog entry.

## Architectural Layer
- local v0 tool-pack artifact consumption
- local v0 source catalog guided selection
- bounded local v0 command proof
- default-deny verification

## Bounded Scope of This Pass
- Add a source-catalog-guided local v0 run proof script.
- Materialize a local v0 tool-pack artifact set into explicit temp artifact paths.
- Read the generated tool-pack index and source catalog artifact.
- Choose one supported catalog scope deterministically.
- Run the existing local v0 single-command runner with that scope hint.
- Verify selected scope/source refs in response and summary match the catalog entry.
- Add package script and CI coverage.
- Update current state, known issues, and execution reporting.

## Out of Scope
- Arbitrary file or directory reads.
- User-selected source paths.
- Source directory traversal.
- MCP server implementation.
- MCP tool or resource registration.
- API routes or controllers.
- Runtime handlers.
- Provider SDK calls.
- Concrete persistence adapters.
- Auth/IAM implementation.
- Token/session validation.
- Policy engine execution.
- Permission grants.
- Model calls.
- Multi-request runner.
- Storage writes beyond explicit proof artifact output paths.
- Actual contour execution.

## Files Affected
Created:

- `scripts/verify-local-v0-source-catalog-guided-run-proof.mjs`
- `docs/04-implementation/execution-reports/2026-04-28-151-local-v0-source-catalog-guided-run-proof.md`

Updated:

- `package.json`
- `.github/workflows/proof-output-regression.yml`
- `docs/04-implementation/CURRENT_IMPLEMENTATION_STATE.md`
- `docs/04-implementation/KNOWN_IMPLEMENTATION_ISSUES.md`

## Changes Made
- Added `proof:local-v0-source-catalog-guided-run:verify`.
- Added CI coverage for the source-catalog-guided local v0 run proof.
- The proof now verifies this path:

```text
tool-pack index
→ source catalog artifact
→ allowlisted scope selection
→ bounded local v0 command
→ response/summary selected source refs
→ default-deny posture
```

## Architectural Boundaries Preserved
- The proof reads only generated artifact paths.
- The proof writes only explicit request/response/summary proof artifact paths.
- Source selection comes from the allowlisted `local-v0-source-catalog/v1` artifact.
- No arbitrary source loading, directory traversal, provider call, persistence adapter, model call, permission grant, runtime handler, MCP/API server, or contour execution is added.

## Verification Performed
Passed locally:

```bash
npm run typecheck
npm run proof:local-v0-source-catalog-guided-run:verify
npm run contract:local-v0-source-catalog:verify
npm run tool:local-json-agent-local-v0-tool-pack:verify
npm run tool:local-json-agent-local-v0:run:verify
npm run proof:local-json-agent-local-v0-acceptance:verify
npm run proof:end-to-end:non-executing:verify
npm run proof:invocation-denial:verify
npm run proof:handler-boundary-denial:verify
npm run proof:surface-boundary-denial:verify
npm run proof:authority-boundary-denial:verify
git diff --check
```

Observed result:

- `local_v0_source_catalog_guided_run_proof_verified`
- `local_v0_source_catalog_contracts_verified`
- `local_json_agent_local_v0_tool_pack_artifact_set_verified`
- `local_json_agent_local_v0_single_command_runner_verified`
- `local_json_agent_local_v0_acceptance_proof_verified`
- `stable_proof_artifact_matches_golden_snapshot`
- `invocation_denial_default_deny_verified`
- `handler_boundary_denial_default_deny_verified`
- `surface_boundary_denial_default_deny_verified`
- `authority_boundary_denial_default_deny_verified`
- `source_catalog_ref: "local-v0-source-catalog/v1"`
- `selected_scope_id: "scope:active-boundary-chain"`
- `selected_source_ref: "local://deterministic/context/active-boundary-chain"`
- `writes_only_explicit_proof_artifact_paths: true`
- `arbitrary_source_loading_allowed: false`
- `runtime_permission_granted: false`
- `actual_contour_execution_allowed_now: false`
- `failure_count: 0`

## Current Outcome
The repo now proves the local v0 agent usage path from catalog discovery to a bounded local v0 context request.

## Known Limitations After This Pass
- The selected scope remains deterministic.
- Source catalog content remains deterministic and in-repo.
- No arbitrary local source loading exists.
- No MCP/API runtime exists.
- No multi-request runner exists.

## Known Issues Introduced or Updated
Updated existing risk #8 to include the local v0 source catalog guided run proof as part of local JSON CLI/file IO boundary drift risk.

## Next Recommended Bounded Step
After merge and verification/state alignment:

```text
docs/state-next-step-alignment-after-local-v0-source-catalog-guided-run-proof
```

## Notes for Next Agent or Session
This proof is the strongest current evidence that the tool is becoming usable by agents, not just documented for humans. Do not expand it into arbitrary source discovery or runtime transport.
