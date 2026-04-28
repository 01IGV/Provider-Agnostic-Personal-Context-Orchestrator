# Execution Report

## Pass ID
`2026-04-28-162-repo-first-verdict-after-local-v0-repo-work-context-source-catalog-contracts`

## Date
`2026-04-28`

## Pass Title
Repo-first verdict after local v0 repo-work context source catalog contracts.

## Objective
Choose the next bounded implementation direction after the repo gained the first deterministic repo-work context source catalog scope.

## Repo Evidence Reviewed
- `docs/04-implementation/CURRENT_IMPLEMENTATION_STATE.md`
- `docs/04-implementation/KNOWN_IMPLEMENTATION_ISSUES.md`
- `docs/04-implementation/execution-reports/2026-04-28-160-local-v0-repo-work-context-source-catalog-contracts.md`
- `docs/04-implementation/execution-reports/2026-04-28-161-state-next-step-alignment-after-local-v0-repo-work-context-source-catalog-contracts.md`
- `packages/system-assembly/src/local-v0-source-catalog-contracts.ts`
- `scripts/verify-local-v0-source-catalog-guided-command.mjs`

## Current Repo-First Finding
`main` now has a bounded self-dogfooding scope:

```text
scope:repo-work-context
→ local://deterministic/context/repo-work-context
→ deterministic inline source item
→ source-catalog-guided command selectable
→ default-deny posture
```

This is the correct direction, but it is still only a catalog entry and verifier path. The agent-facing usability gap is now similar to the previous guided-command gap: the repo-work context path should become inspectable and replayable through an explicit sample artifact set.

The next implementation should not add direct repo file access. The agent should still interact through the bounded request/response surface. The system may produce explicit artifacts, but those artifacts should come from the allowlisted catalog and guided command path, not from arbitrary file reads or user-selected paths.

## Verdict
The next bounded implementation should be:

```text
feat/local-v0-repo-work-context-guided-sample-artifact
```

## Why This Is the Right Next Step
The repo has already proven that `scope:repo-work-context` can be selected through the guided command. The next practical step is to make that path easy for an AI agent to inspect, replay, and trust.

This should follow the existing sample-artifact pattern:

- start from explicit tool-pack/source-catalog artifacts;
- request `scope:repo-work-context`;
- write explicit guided request/response/summary/index artifacts;
- verify selected scope/source refs;
- preserve default-deny posture;
- deny direct repo file access and runtime behavior.

## Bounded Scope for the Next Implementation Pass
The next pass should:

- add a repo-work-context guided sample artifact writer or extend the existing guided sample writer with a bounded repo-work sample mode;
- produce explicit sample artifacts for `scope:repo-work-context`;
- verify the generated request asks for `scope:repo-work-context`;
- verify the response/summary/index select `local://deterministic/context/repo-work-context`;
- expose the new sample path in the agent-facing manifest only if it becomes a separate command;
- update CI if a new verifier command is added;
- update state docs, known issues only if needed, and execution reporting.

## Guardrails for the Next Implementation Pass
Do not add:

- direct agent access to repo files;
- live repo file reads;
- arbitrary file or directory reads;
- user-selected source paths;
- directory traversal;
- repo scanning;
- git command execution as part of the tool path;
- self-updating memory;
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
- multi-request runner;
- storage writes beyond explicit artifact output paths;
- actual contour execution.

## Expected Verification
The next implementation pass should keep these green:

```bash
npm run typecheck
npm run contract:local-v0-source-catalog:verify
npm run tool:local-v0-source-catalog-guided:verify
npm run tool:local-v0-source-catalog-guided-sample:verify
npm run tool:local-json-agent-local-v0-tool-pack:verify
npm run proof:local-v0-source-catalog-guided-run:verify
npm run proof:local-json-agent-local-v0-acceptance:verify
npm run tool:local-json-agent-tool-manifest:verify
npm run proof:end-to-end:non-executing:verify
npm run proof:invocation-denial:verify
npm run proof:handler-boundary-denial:verify
npm run proof:surface-boundary-denial:verify
npm run proof:authority-boundary-denial:verify
git diff --check
```

## Current Outcome
The repo should move from "repo-work context is selectable" to "repo-work context is inspectable as a replayable bounded artifact path."

That is the safest next step toward real self-dogfooding while preserving the principle that agents do not read repo files directly.

## Next Recommended Bounded Step
After merge and state alignment:

```text
feat/local-v0-repo-work-context-guided-sample-artifact
```
