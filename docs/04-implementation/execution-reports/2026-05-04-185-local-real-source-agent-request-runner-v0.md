# Execution Report

## Pass ID
`2026-05-04-185-local-real-source-agent-request-runner-v0`

## Date
`2026-05-04`

## Pass Title
Local real-source agent request runner v0.

## Objective
Add the first request-native runner for the local real-source adapter v0 so an AI agent can provide an explicit request artifact and receive bounded real-source context artifacts.

## Implementation Summary
- Added `scripts/local-real-source-agent-request-runner-v0-cli.mjs`.
- Added `scripts/verify-local-real-source-agent-request-runner-v0.mjs`.
- Added package scripts:

```bash
npm run tool:local-real-source-agent-request-runner-v0:run
npm run tool:local-real-source-agent-request-runner-v0:verify
```

- Added the verifier to `.github/workflows/proof-output-regression.yml`.
- Added the command to the local JSON agent tool manifest and manifest verifier.

## Command
The new command is:

```bash
npm run tool:local-real-source-agent-request-runner-v0:run -- --request <path> --response-output <path> --summary-output <path> --index-output <path>
```

## Behavior
The runner:

- reads one explicit agent request artifact;
- accepts only `scope:repo-work-context` in this v0 path;
- denies unsupported scopes before source reads;
- invokes the existing local real-source adapter v0 only after request validation;
- writes response, summary, and index artifacts to explicit paths;
- carries source materialization receipt data;
- carries provenance / permission / audit refs;
- preserves default-deny runtime posture.

## Verification
Local verification passed:

```bash
npm run tool:local-real-source-agent-request-runner-v0:verify
npm run tool:local-json-agent-tool-manifest:verify
```

The verifier proves:

- a valid `scope:repo-work-context` request produces bounded real-source context artifacts;
- selected source refs are exactly the narrow local real-source read boundary refs;
- content digests are present;
- source materialization receipt data is carried;
- unsupported scope requests are denied before source reads;
- direct agent repo file access remains denied;
- arbitrary source loading remains denied;
- runtime/MCP/API/provider/persistence/auth/model/storage/contour execution remains denied.

## Guardrails Preserved
This pass does not add:

- direct agent access to repo files;
- arbitrary source paths;
- directory traversal or listing;
- repo scanning;
- MCP server;
- MCP tool/resource registration;
- API routes/controllers;
- runtime handlers;
- provider SDK calls;
- concrete persistence adapters;
- auth/IAM implementation;
- token/session validation;
- policy engine execution;
- permission grants;
- model calls;
- storage writes beyond explicit artifact output paths;
- contour execution.

## Outcome
The real-source path is now request-native:

```text
AI agent request artifact
→ request validation
→ repo-work context scope
→ local real-source adapter v0
→ bounded response / summary / index artifacts
→ no direct agent file access
```

This is a practical move toward a usable AI-facing Context Authority Gateway while keeping MCP/API runtime work deferred.
