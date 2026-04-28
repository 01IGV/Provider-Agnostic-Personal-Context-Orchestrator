# Execution Report

## Pass ID
`2026-04-28-129-local-json-agent-request-runner-from-explicit-request-artifact`

## Date
`2026-04-28`

## Pass Title
Local JSON agent request runner from explicit request artifact.

## Objective
Add a direct local v0 agent request runner that accepts one explicitly provided agent request artifact and writes one explicitly provided response artifact plus one explicitly provided run summary artifact.

## Architectural Layer
- local JSON request/response runner
- AI-agent local tool surface
- bounded response artifact
- agent-readable run summary

## Bounded Scope of This Pass
- Add a local command for one explicit agent request artifact path.
- Write one explicit response artifact path.
- Write one explicit run summary artifact path.
- Reuse the existing bounded local JSON fixture runner.
- Summarize request id, response id, selected source refs, selected scope ids, permission/default-deny flags, provenance ref, permission ref, audit ref, and failures.
- Add manifest discovery, package command, verification, and CI coverage.

## Out of Scope
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
- Arbitrary source loading.
- Multi-request runner.
- Storage writes beyond explicitly provided response and summary artifact paths.
- Actual contour execution.

## Files Affected
Created:

- `scripts/local-json-agent-request-runner-cli.mjs`
- `scripts/verify-local-json-agent-request-runner.mjs`
- `docs/04-implementation/execution-reports/2026-04-28-129-local-json-agent-request-runner-from-explicit-request-artifact.md`

Updated:

- `scripts/local-json-agent-tool-manifest-cli.mjs`
- `scripts/verify-local-json-agent-tool-manifest.mjs`
- `package.json`
- `.github/workflows/proof-output-regression.yml`
- `docs/04-implementation/CURRENT_IMPLEMENTATION_STATE.md`
- `docs/04-implementation/KNOWN_IMPLEMENTATION_ISSUES.md`

## Changes Made
- Added `tool:local-json-agent-request:run`.
- Added `tool:local-json-agent-request:run:verify`.
- Added CI coverage for the direct agent request runner.
- Extended the local JSON agent tool manifest with the new command.
- Added a run summary contract ref: `local-json-agent-request-run-summary/v1`.
- Kept request processing delegated to the existing bounded local JSON fixture runner.

## Architectural Boundaries Preserved
- The command reads only the explicitly provided request artifact path.
- The command writes only the explicitly provided response and summary artifact paths.
- Request validation remains delegated to the existing local JSON runner boundary.
- No MCP/API tools, resources, routes, controllers, or handlers are registered.
- No runtime permission is granted.
- No provider call, persistence adapter, model call, arbitrary source loading, storage write beyond explicit output paths, or contour execution behavior is added.

## Verification Performed
Passed locally:

```bash
npm run tool:local-json-agent-request:run:verify
npm run tool:local-json-agent-tool-manifest:verify
```

Observed results:

- `local_json_agent_request_runner_verified`
- `local_json_agent_tool_manifest_verified`
- manifest command refs include `tool:local-json-agent-request:run`
- `runtime_permission_granted: false`
- `actual_contour_execution_allowed_now: false`

## Current Outcome
The local v0 agent-facing path now supports a direct request-run shape:

```text
explicit agent request artifact
→ bounded local JSON runner
→ explicit response artifact
→ explicit run summary artifact
```

This is the closest current repo point to a practical real-life local tool for AI agents.

## Known Limitations After This Pass
- The request still targets deterministic in-repo fixture context.
- No arbitrary local source loading exists.
- No MCP/API runtime exists.
- No multi-request runner exists.

## Known Issues Introduced or Updated
Updated existing risk #8 to include the direct local JSON agent request runner as part of local JSON CLI/file IO boundary drift risk.

## Next Recommended Bounded Step
After merge and CI/state alignment:

```text
docs/state-next-step-alignment-after-local-json-agent-request-runner
```

## Notes for Next Agent or Session
Do not turn the direct request runner into generalized source loading, runtime registration, provider access, concrete persistence, model calls, permission grants, or contour execution.
