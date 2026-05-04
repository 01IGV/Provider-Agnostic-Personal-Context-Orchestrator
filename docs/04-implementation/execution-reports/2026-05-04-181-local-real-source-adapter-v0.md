# Execution Report

## Pass ID
`2026-05-04-181-local-real-source-adapter-v0`

## Date
`2026-05-04`

## Pass Title
Local real-source adapter v0.

## Objective
Implement the first bounded local real-source adapter v0 inside the `feat/local-real-source-adapter-v0` milestone branch.

## Scope
This pass adds a local CLI artifact writer that reads only source refs declared by `narrow-local-real-source-read-boundary/v1` and returns AI-agent consumable bounded context artifacts.

The implemented command is:

```bash
npm run tool:local-real-source-adapter-v0:run -- --response-output <path> --summary-output <path> --index-output <path> [--source-ref <repo-file://...>]
```

The verifier is:

```bash
npm run tool:local-real-source-adapter-v0:verify
```

## Implementation Summary
- Added `scripts/local-real-source-adapter-v0-cli.mjs`.
- Added `scripts/verify-local-real-source-adapter-v0.mjs`.
- Added package scripts for run and verification.
- Added the verifier to `.github/workflows/proof-output-regression.yml`.
- Added the command to the local JSON agent tool manifest and manifest verifier.

## Read Boundary
The adapter reads only these refs:

```text
repo-file://docs/04-implementation/CURRENT_IMPLEMENTATION_STATE.md
repo-file://docs/04-implementation/KNOWN_IMPLEMENTATION_ISSUES.md
```

The adapter enforces:

- allowlisted source refs only;
- repo-relative paths only;
- no absolute paths;
- no parent-directory traversal;
- no glob patterns;
- no directory refs;
- no unknown source refs;
- max `65536` bytes per source ref read;
- content digest after read;
- provenance / permission / audit refs;
- source materialization receipt data.

Because `CURRENT_IMPLEMENTATION_STATE.md` can be larger than the max byte window, the adapter performs bounded window reads and marks truncated content explicitly instead of widening the permission boundary.

## Verification
Local verification passed:

```bash
npm run tool:local-real-source-adapter-v0:verify
npm run tool:local-json-agent-tool-manifest:verify
```

The local real-source adapter verifier proves:

- allowed boundary refs are read successfully;
- response, summary, and index artifacts are written only to explicit output paths;
- source items contain bounded content and `sha256:` digests;
- source materialization receipt data is present;
- direct agent repo file access remains denied;
- arbitrary path reads remain denied;
- directory traversal/listing and repo scanning remain denied;
- runtime/MCP/API/provider/persistence/auth/model/storage/contour execution remains denied;
- denial probes for absolute path, `..`, unknown ref, and directory ref are enforced.

## Guardrails Preserved
This pass does not add:

- direct agent access to repo files;
- arbitrary source loading;
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
The repository now has the first scoped local real-source adapter v0 path:

```text
AI-agent inspectable command
→ narrow local real-source read boundary
→ bounded content window
→ digest
→ receipt / provenance / permission / audit refs
→ bounded response / summary / index artifacts
→ no direct agent file access
```

## Next Step Inside Milestone
Continue in `feat/local-real-source-adapter-v0` with final milestone hardening:

- run broader verification;
- update final state docs;
- commit the implementation;
- then prepare one PR for the whole milestone rather than splitting tiny docs-only PRs.
