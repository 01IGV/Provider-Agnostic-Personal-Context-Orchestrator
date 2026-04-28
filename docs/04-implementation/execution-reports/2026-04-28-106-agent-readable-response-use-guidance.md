# Execution Report

## Pass ID
`2026-04-28-106-agent-readable-response-use-guidance`

## Date
`2026-04-28`

## Pass Title
Agent-readable response use guidance.

## Objective
Add explicit machine-readable guidance for AI agents to safely consume the local JSON bounded context response, while preserving default-deny posture and avoiding human-first UI work.

## Architectural Layer
- local JSON request/response runner
- agent-readable response observation summary
- bounded local tool consumption guidance
- proof/CI verification

## Bounded Scope of This Pass
- Add an agent-readable contract/version marker to the response observation summary.
- Add an agent response status for safe bounded-context use.
- Add safe use hints and denied action hints for AI agents.
- Surface those fields in the single-command local JSON output.
- Add a verifier for agent-readable response guidance.
- Add CI coverage for the new verifier.

## Out of Scope
- Human-formatted CLI rendering.
- Reading arbitrary source files.
- Generalized source loading.
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
- `packages/integration-contracts`
- local scripts
- package command surface
- CI workflow
- implementation documentation

## Files Affected
Updated:

- `packages/integration-contracts/src/local-json-request-response-runner-types.ts`
- `packages/integration-contracts/src/local-json-request-response-runner.ts`
- `scripts/local-json-fixture-runner-cli.mjs`
- `scripts/local-json-single-command-runner.mjs`
- `scripts/verify-local-json-response-observation-summary.mjs`
- `package.json`
- `.github/workflows/proof-output-regression.yml`
- `docs/04-implementation/CURRENT_IMPLEMENTATION_STATE.md`
- `docs/04-implementation/KNOWN_IMPLEMENTATION_ISSUES.md`

Created:

- `scripts/verify-agent-readable-response-use-guidance.mjs`
- `docs/04-implementation/execution-reports/2026-04-28-106-agent-readable-response-use-guidance.md`

## Changes Made
- Added `agent_readable_contract: "agent-readable-local-json-response-observation/v1"`.
- Added `agent_response_status: "bounded_context_ready_for_agent_use"`.
- Added `safe_agent_use_hints` for bounded context reading, grounding, envelope preservation, and non-executing treatment.
- Added `denied_agent_action_hints` for runtime handlers, provider SDK calls, persistence, permission grants, model calls, storage writes, and contour invocation.
- Surfaced these fields through the local JSON fixture runner and single-command wrapper output.
- Added `tool:agent-readable-response-use-guidance:verify`.
- Added CI workflow coverage for the new verifier.

## Architectural Boundaries Preserved
- Guidance is derived from the bounded response observation summary.
- Guidance is not a new authority source.
- No new source reading, runtime execution, MCP/API server, provider call, concrete persistence adapter, model call, permission grant, or contour execution behavior is added.
- The only write remains the explicitly provided local response fixture path.

## Technical Decisions Made
- Prefer machine-readable agent hints over human-readable CLI output.
- Keep safe/denied hints as stable tokens rather than prose sentences so agents can branch on them deterministically.
- Keep the observation summary tied to default-deny posture flags.

## Verification Performed
Passed locally:

```bash
npm run tool:agent-readable-response-use-guidance:verify
npm run tool:local-json-response-observation-summary:verify
npm run tool:local-json:run -- --request /tmp/agent-readable-request.json --response /tmp/agent-readable-response.json --task-signal agent-readable-smoke --read-mode planning --depth standard --scope-hints scope:active-boundary-chain
```

Observed results:

- `agent_readable_response_use_guidance_verified`
- `local_json_single_command_run_completed`
- `agent_readable_contract: agent-readable-local-json-response-observation/v1`
- `agent_response_status: bounded_context_ready_for_agent_use`
- `runtime_permission_granted: false`
- `actual_contour_execution_allowed_now: false`

## Current Outcome
The local v0 path now returns an agent-readable response summary that tells an AI agent what context was selected, how it may safely use it, and which actions remain denied.

## Known Limitations After This Pass
- No exported standalone agent request/response schema bundle exists yet.
- Selection is still limited to deterministic in-repo fixture shapes.
- No arbitrary local file source loading exists.
- No MCP/API runtime exists.

## Known Issues Introduced or Updated
Updated existing risk #8 to include agent-readable response use guidance as part of the local JSON CLI/file IO boundary drift risk.

## Next Recommended Bounded Step
After merge and CI/state alignment, run a repo-first verdict between:

```text
feat/agent-request-response-schema-export
feat/agent-readable-response-guidance-hardening
```

The likely stronger next implementation is an agent request/response schema export so external AI agents can integrate against the local JSON tool contract without reading TypeScript source.

## Notes for Next Agent or Session
Do not turn guidance hints into permission grants. They are consumption guidance only; authority remains in the bounded response envelope.
