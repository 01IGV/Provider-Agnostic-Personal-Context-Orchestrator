# Execution Report

## Pass ID
`2026-04-27-97-local-json-single-command-run-wrapper`

## Date
`2026-04-27`

## Pass Title
Local JSON single-command run wrapper.

## Objective
Add the smallest local command that wraps request fixture authoring and local JSON fixture running into one bounded command.

## Architectural Layer
- local CLI helper
- fixture file IO
- proof/verification scripts
- CI proof contour
- implementation documentation

## Bounded Scope of This Pass
- Add a local command that writes a deterministic request fixture and response fixture in one call.
- Reuse existing request fixture authoring and local JSON fixture runner logic.
- Add verification for request and response fixture output.
- Keep the wrapper local-only, deterministic, and default-deny.

## Out of Scope
- Request variation.
- Generalized CLI UX.
- Multiple requests or batch execution.
- MCP server implementation.
- MCP tool/resource registration.
- API routes/controllers.
- Runtime handlers.
- Provider SDK calls, transport execution, concrete persistence adapters, model calls, permission grants, or contour execution.

## Modules Affected
- `scripts`
- `.github/workflows`
- `docs/04-implementation`

## Files Affected
Created:

- `scripts/local-json-single-command-runner.mjs`
- `scripts/verify-local-json-single-command-run-wrapper.mjs`
- `docs/04-implementation/execution-reports/2026-04-27-97-local-json-single-command-run-wrapper.md`

Updated:

- `package.json`
- `.github/workflows/proof-output-regression.yml`
- `docs/04-implementation/CURRENT_IMPLEMENTATION_STATE.md`
- `docs/04-implementation/KNOWN_IMPLEMENTATION_ISSUES.md`

## Changes Made
- Added `tool:local-json:run`.
- Added `tool:local-json-single-command-run:verify`.
- Added a wrapper that authors the deterministic request fixture and runs the local JSON fixture runner in-process.
- Added CI coverage for the wrapper verifier.

## Architectural Boundaries Preserved
- The wrapper writes only the explicitly provided request and response fixture paths.
- It does not add MCP/API runtime, route/controller registration, runtime handlers, provider transport, concrete persistence adapters, model calls, permission grants, or contour execution.
- It does not introduce request variation or a new authority layer.

## Technical Decisions Made
- Kept the wrapper as a script-level helper instead of adding a package or framework.
- Reused existing verified authoring and runner functions.
- Kept child process spawning out of the wrapper path.

## Verification Performed
Ran:

```bash
npm run typecheck
npm run tool:local-json-single-command-run:verify
npm run tool:local-json:run -- --request /tmp/orchestrator-local-json-single-command-smoke/request.json --response /tmp/orchestrator-local-json-single-command-smoke/response.json
```

Observed:

- `npm run typecheck`: passed;
- `local_json_single_command_run_wrapper_verified`;
- `local_json_single_command_run_completed`;
- `request_fixture_written: true`;
- `request_fixture_read: true`;
- `response_fixture_written: true`;
- `runtime_permission_granted: false`;
- `actual_contour_execution_allowed_now: false`.

## Current Outcome
The repository now supports a single-command deterministic local v0 loop:

```bash
npm run tool:local-json:run -- --request request.json --response response.json
```

## Known Limitations After This Pass
- The request fixture is still deterministic only.
- There is no constrained request variation path yet.
- There is no multi-request runner yet.
- The local tool remains fixture-scoped.

## Known Issues Introduced or Updated
Updated the local JSON CLI/file IO drift risk to include the single-command wrapper.

## Next Recommended Bounded Step
Recommended next docs-only pass:

```text
docs/state-next-step-alignment-after-local-json-single-command-run-wrapper
```

Likely next implementation direction after that:

```text
feat/local-json-constrained-request-variation
```

## Notes for Next Agent or Session
The local v0 path is now one command. The next useful step is constrained request variation, not MCP/API runtime.
