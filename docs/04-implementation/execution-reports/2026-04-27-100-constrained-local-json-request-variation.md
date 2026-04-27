# Execution Report

## Pass ID
`2026-04-27-100-constrained-local-json-request-variation`

## Date
`2026-04-27`

## Pass Title
Constrained local JSON request variation.

## Objective
Allow the local JSON single-command path to carry a narrowly varied AI-agent context request without opening authority, runtime, provider, persistence, model, permission, or contour execution behavior.

## Architectural Layer
- local JSON tool boundary
- agent context request fixture authoring
- bounded request-intent variation
- proof/CI verification

## Bounded Scope of This Pass
- Add allowlisted variation for request intent fields only.
- Preserve deterministic request identity, authority envelope, and default-deny execution posture.
- Verify the varied request still runs through the local JSON fixture path.
- Add CI coverage for constrained variation.

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
- Storage writes beyond explicitly requested local response fixture output.
- Actual contour execution.

## Modules Affected
- local scripts
- package command surface
- CI workflow
- implementation documentation

## Files Affected
Updated:

- `scripts/local-json-request-fixture-authoring-cli.mjs`
- `scripts/local-json-single-command-runner.mjs`
- `package.json`
- `.github/workflows/proof-output-regression.yml`
- `docs/04-implementation/CURRENT_IMPLEMENTATION_STATE.md`
- `docs/04-implementation/KNOWN_IMPLEMENTATION_ISSUES.md`

Created:

- `scripts/verify-constrained-local-json-request-variation.mjs`
- `docs/04-implementation/execution-reports/2026-04-27-100-constrained-local-json-request-variation.md`

## Changes Made
- Added optional local request variation flags:
  - `--task-signal`
  - `--read-mode`
  - `--depth`
  - `--scope-hints`
- Restricted variation to `intent.task_signal`, `intent.read_mode_hint`, `intent.depth_hint`, and `intent.requested_scope_hints`.
- Added validation for known read modes, known depth hints, non-empty scope hints, and `scope:<id>` scope-hint form.
- Extended the single-command local JSON runner to pass constrained variation through request fixture authoring.
- Added `tool:constrained-local-json-request-variation:verify`.
- Added CI workflow coverage for constrained local JSON request variation.

## Architectural Boundaries Preserved
- Request identity remains deterministic.
- Authority envelope remains unchanged.
- Execution posture remains unchanged and default-deny.
- The response path remains local fixture output only.
- No MCP/API, provider, persistence, model, permission grant, or contour execution behavior was added.

## Technical Decisions Made
- Use the existing `READ_MODES` and `READ_DEPTH_HINTS` vocabulary values rather than inventing a new CLI-specific vocabulary.
- Keep variation request-side only for this pass.
- Make the verifier assert that authority and execution posture match the deterministic baseline byte-for-byte via JSON equality.

## Verification Performed
Passed locally:

```bash
npm run tool:constrained-local-json-request-variation:verify
npm run tool:local-json-single-command-run:verify
npm run tool:local-json:run -- --request /tmp/constrained-request.json --response /tmp/constrained-response.json --task-signal bounded-local-smoke --read-mode quick_answer --depth shallow --scope-hints scope:local-smoke
```

Observed results:

- `constrained_local_json_request_variation_verified`
- `local_json_single_command_run_wrapper_verified`
- `local_json_single_command_run_completed`
- `runtime_permission_granted: false`
- `actual_contour_execution_allowed_now: false`

## Current Outcome
The local v0 path can now accept a constrained, machine-readable request-intent variation and produce the local verified response fixture through one command.

## Known Limitations After This Pass
- Variation is request-intent only.
- The local source materialization remains deterministic.
- No dynamic source fixture selection exists yet.
- No MCP/API runtime exists yet.

## Known Issues Introduced or Updated
Updated existing risk #8 to include constrained request-intent variation as part of the local JSON CLI/file IO boundary drift risk.

## Next Recommended Bounded Step
After merge and CI/state alignment, run a repo-first verdict between:

```text
feat/minimal-local-source-fixture-selection
feat/local-json-response-envelope-observation
```

The stronger likely next implementation is a minimal local source fixture selection pass, still deterministic and default-deny.

## Notes for Next Agent or Session
Do not expand this into arbitrary JSON input loading, provider calls, source execution, MCP/API transport, or runtime handlers. The point of this pass is bounded agent request expressiveness only.
