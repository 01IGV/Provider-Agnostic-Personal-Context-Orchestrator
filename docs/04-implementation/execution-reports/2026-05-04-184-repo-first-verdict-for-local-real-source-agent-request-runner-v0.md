# Execution Report

## Pass ID
`2026-05-04-184-repo-first-verdict-for-local-real-source-agent-request-runner-v0`

## Date
`2026-05-04`

## Pass Title
Repo-first verdict for local real-source agent request runner v0.

## Objective
Choose the next bounded implementation after local real-source adapter v0 merged.

## Repo Evidence Reviewed
- `docs/04-implementation/CURRENT_IMPLEMENTATION_STATE.md`
- `docs/04-implementation/KNOWN_IMPLEMENTATION_ISSUES.md`
- `docs/04-implementation/execution-reports/2026-05-04-181-local-real-source-adapter-v0.md`
- `docs/04-implementation/execution-reports/2026-05-04-182-local-real-source-adapter-v0-milestone-verification.md`
- `docs/04-implementation/execution-reports/2026-05-04-183-state-next-step-alignment-after-local-real-source-adapter-v0.md`
- `scripts/local-real-source-adapter-v0-cli.mjs`
- `scripts/local-json-agent-request-runner-cli.mjs`
- `scripts/local-json-request-fixture-authoring-cli.mjs`
- `scripts/local-json-agent-local-v0-single-command-runner.mjs`

## Verdict
The next implementation should be:

```text
local real-source agent request runner v0
```

## Rationale
The repository has crossed an important line: it can now read real repo context through a verified allowlisted boundary. The missing piece is the AI-agent interaction shape.

Today the real-source adapter is usable, but not yet request-native:

```text
agent/tool operator provides output paths
→ adapter reads all allowlisted refs
→ artifacts
```

The stronger next step is:

```text
AI agent request artifact
→ request validation
→ repo-work context scope selection
→ local real-source adapter v0
→ bounded response / summary / index artifacts
```

This moves toward a real tool without adding MCP/API runtime prematurely.

## Bounded Scope
The runner should:

- read exactly one explicit request artifact path;
- accept only `scope:repo-work-context` for this first real-source request path;
- deny unsupported scope requests before source reads;
- call the existing local real-source adapter v0 only after request validation;
- write response, summary, and index artifacts only to explicit output paths;
- carry source materialization receipt/provenance/permission/audit refs;
- expose a verifier proving success and denial behavior;
- add package/CI/manifest wiring.

## Guardrails
Do not add:

- direct agent repo file access;
- arbitrary source paths;
- directory traversal/listing;
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

## Expected Verification
Add and run:

```bash
npm run tool:local-real-source-agent-request-runner-v0:verify
```

Keep the existing local real-source adapter verifier green:

```bash
npm run tool:local-real-source-adapter-v0:verify
```

The verifier should prove both:

- accepted repo-work context request produces bounded real-source context artifacts;
- denied unsupported scope request performs no source read.
