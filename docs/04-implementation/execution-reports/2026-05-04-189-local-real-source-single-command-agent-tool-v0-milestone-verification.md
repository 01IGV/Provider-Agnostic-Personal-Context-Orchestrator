# Execution Report

## Pass ID
`2026-05-04-189-local-real-source-single-command-agent-tool-v0-milestone-verification`

## Date
`2026-05-04`

## Pass Title
Local real-source single-command agent tool v0 milestone verification.

## Objective
Record final local verification before opening one PR for the `feat/local-real-source-single-command-agent-tool-v0` milestone.

## What Is Built
The repository now has a one-command local real-source agent workflow:

```bash
npm run tool:local-real-source-single-command-agent-tool-v0:run -- --request-output <path> --response-output <path> --summary-output <path> --index-output <path> [--task-signal <text>] [--read-mode <mode>] [--depth <hint>]
```

The command:

- authors a constrained `scope:repo-work-context` request artifact;
- runs the local real-source agent request runner v0;
- writes bounded request, response, summary, and index artifacts;
- carries content digests, receipt refs, provenance refs, permission refs, and audit refs;
- preserves default-deny runtime posture.

## Local Verification Passed
The following checks passed locally:

```bash
git diff --check
npm run typecheck
npm run tool:local-real-source-single-command-agent-tool-v0:verify
npm run tool:local-real-source-agent-request-runner-v0:verify
npm run tool:local-real-source-adapter-v0:verify
npm run contract:narrow-local-real-source-read-boundary:verify
npm run tool:local-json-agent-tool-manifest:verify
npm run proof:end-to-end:non-executing:verify
npm run proof:authority-boundary-denial:verify
```

## Boundary Findings
The verifier proves:

- request authoring is constrained to `scope:repo-work-context`;
- selected refs match `narrow-local-real-source-read-boundary/v1`;
- the command writes only explicit output paths;
- direct agent repo file access remains denied;
- arbitrary source loading remains denied;
- directory traversal/listing and repo scanning remain denied;
- runtime/MCP/API/provider/persistence/auth/model/storage/contour execution remains denied.

## Outcome
This milestone moves the local v0 real-source path from a two-step flow to a single agent-facing command:

```text
one command
→ constrained request
→ bounded real-source read
→ response / summary / index artifacts
→ no direct agent file access
```

## Next Step
Open one PR for the milestone branch and let GitHub Actions verify the CI contour.
