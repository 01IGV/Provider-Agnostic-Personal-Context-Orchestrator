# Execution Report

## Pass ID
`2026-04-28-108-agent-request-response-schema-export`

## Date
`2026-04-28`

## Pass Title
Agent request/response schema export.

## Objective
Export a compact machine-readable contract schema for the local JSON agent request/response path so AI agents can discover the usable contract without reading TypeScript source.

## Architectural Layer
- integration contracts
- local JSON request/response runner
- agent-readable contract discovery
- proof/CI verification

## Bounded Scope of This Pass
- Add an agent-readable local JSON request/response contract schema export.
- Add a local CLI that prints the schema JSON.
- Add a verifier that compares the schema to the actual local JSON request/response runner output.
- Add package commands and CI coverage for the verifier.
- Update implementation state and known issue drift risk.

## Out of Scope
- Human-first UI.
- Generalized JSON Schema generation.
- Arbitrary source loading.
- Multi-request runner.
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
Created:

- `packages/integration-contracts/src/local-json-agent-request-response-contract-schema-types.ts`
- `packages/integration-contracts/src/local-json-agent-request-response-contract-schema.ts`
- `scripts/local-json-agent-contract-schema-cli.mjs`
- `scripts/verify-agent-request-response-schema-export.mjs`
- `docs/04-implementation/execution-reports/2026-04-28-107-agent-request-response-schema-export.md`

Updated:

- `packages/integration-contracts/src/index.ts`
- `package.json`
- `.github/workflows/proof-output-regression.yml`
- `docs/04-implementation/CURRENT_IMPLEMENTATION_STATE.md`
- `docs/04-implementation/KNOWN_IMPLEMENTATION_ISSUES.md`

## Changes Made
- Added `local-json-agent-request-response-contract-schema/v1`.
- Described request fields an AI agent can rely on.
- Described response observation summary fields an AI agent can rely on.
- Declared allowed request variation paths and denied mutation paths.
- Declared the bounded local command surface as `tool:local-json:run`.
- Carried safe use hints and denied action hints into the schema.
- Preserved default-deny execution posture in the schema and verifier.
- Added `tool:agent-request-response-schema:print`.
- Added `tool:agent-request-response-schema:verify`.
- Added CI workflow coverage for the new verifier.

## Architectural Boundaries Preserved
- The schema export is contract discovery only.
- The schema is not a runtime authority source.
- The schema does not grant permission.
- The CLI only prints the schema object and does not read external sources.
- No MCP/API runtime, provider call, persistence adapter, model call, permission grant, or contour execution behavior is added.

## Technical Decisions Made
- Prefer a compact repo-native contract artifact over a broad JSON Schema generator.
- Keep the export deterministic and typed in `integration-contracts`.
- Verify the schema against the actual local JSON request/response path so it cannot drift silently from the tool output.

## Verification Performed
Passed locally:

```bash
npm run typecheck
npm run tool:agent-request-response-schema:verify
npm run tool:agent-request-response-schema:print
```

Observed results:

- `agent_request_response_schema_export_verified`
- `local_json_agent_request_response_contract_schema_ready`
- `contract_version: local-json-agent-request-response-contract-schema/v1`
- `intended_consumer: ai_agent`
- `command_ref: tool:local-json:run`
- `runtime_permission_granted: false`
- `actual_contour_execution_allowed_now: false`

## Current Outcome
The local v0 tool path now has a machine-readable request/response contract export that an external AI agent can inspect before producing a bounded local JSON request and consuming the bounded response observation summary.

## Known Limitations After This Pass
- The schema is a compact contract artifact, not full JSON Schema.
- No example fixture bundle tied directly to the schema exists yet.
- Selection is still limited to deterministic in-repo fixture shapes.
- No arbitrary local file source loading exists.
- No MCP/API runtime exists.

## Known Issues Introduced or Updated
Updated existing risk #8 to include agent request/response schema export as part of the local JSON CLI/file IO boundary drift risk.

## Next Recommended Bounded Step
After merge and CI/state alignment, the likely next implementation is:

```text
feat/schema-aware-local-json-fixture-examples
```

That pass should give AI agents a verified minimal valid request/example response pair based on the exported schema, without expanding into runtime server behavior.

## Notes for Next Agent or Session
Do not treat schema visibility as runtime permission. The schema explains how to use the bounded local context path; it does not authorize new IO, provider calls, model calls, persistence, or contour execution.
