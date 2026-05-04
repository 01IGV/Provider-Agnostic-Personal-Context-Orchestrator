# Execution Report

## Pass ID
`2026-05-04-182-local-real-source-adapter-v0-milestone-verification`

## Date
`2026-05-04`

## Pass Title
Local real-source adapter v0 milestone verification.

## Objective
Record the final local verification state for the `feat/local-real-source-adapter-v0` milestone before opening one PR for the whole milestone branch.

## Milestone Commits
This milestone intentionally groups state alignment, verdict, implementation, and final verification in one branch:

```text
ba80d13 docs: align state for local real source adapter milestone
1f53cb4 docs: record verdict for local real source adapter v0
f977a2b feat: add local real source adapter v0
```

## What Is Now Built
The repository now has the first scoped local real-source adapter v0 command:

```bash
npm run tool:local-real-source-adapter-v0:run -- --response-output <path> --summary-output <path> --index-output <path> [--source-ref <repo-file://...>]
```

It reads only the allowlisted refs declared by:

```text
narrow-local-real-source-read-boundary/v1
```

and writes AI-agent consumable bounded context artifacts:

- response artifact;
- summary artifact;
- index artifact;
- source materialization receipt data;
- provenance / permission / audit refs;
- `sha256:` content digests;
- explicit default-deny runtime posture.

## Local Verification Passed
The following checks passed locally:

```bash
git diff --check
npm run typecheck
npm run contract:narrow-local-real-source-read-boundary:verify
npm run tool:local-real-source-adapter-v0:verify
npm run tool:local-json-agent-tool-manifest:verify
npm run contract:bounded-real-source-adapter:verify
npm run tool:bounded-real-source-adapter-contract-sample:verify
npm run proof:end-to-end:non-executing:verify
npm run proof:invocation-denial:verify
npm run proof:handler-boundary-denial:verify
npm run proof:surface-boundary-denial:verify
npm run proof:authority-boundary-denial:verify
npm run contract:local-deterministic-context-source:verify
npm run contract:local-v0-source-catalog:verify
npm run tool:local-v0-repo-work-context-guided-sample:verify
npm run tool:local-json-agent-local-v0:run:verify
```

A direct smoke run also passed:

```bash
npm run tool:local-real-source-adapter-v0:run -- --response-output /private/tmp/local-real-source-adapter-v0.response.json --summary-output /private/tmp/local-real-source-adapter-v0.summary.json --index-output /private/tmp/local-real-source-adapter-v0.index.json
```

## Boundary Findings
The verifier proves:

- allowed refs are read successfully;
- denied probes for absolute path, parent-directory traversal, unknown ref, and directory ref are enforced;
- reads are bounded to the boundary byte window;
- oversized docs are truncated explicitly rather than widening permission;
- direct agent repo file access remains denied;
- arbitrary source loading remains denied;
- directory traversal/listing and repo scanning remain denied;
- runtime/MCP/API/provider/persistence/auth/model/storage/contour execution remains denied.

## Outcome
This milestone advances the system from contract-only future real-source adapter planning to the first usable bounded local read path for AI agents:

```text
AI agent command
→ narrow local real-source read boundary
→ bounded content window
→ digest
→ receipt / provenance / permission / audit
→ response / summary / index artifacts
→ no direct agent file access
```

## Next Step
Open one PR for the full milestone branch and let GitHub Actions verify the CI contour.
