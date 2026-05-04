# Execution Report

## Pass ID
`2026-05-04-188-local-real-source-single-command-agent-tool-v0`

## Date
`2026-05-04`

## Pass Title
Local real-source single-command agent tool v0.

## Objective
Add a single-command local real-source agent tool that authors a constrained request and runs it through the request-native local real-source runner.

## Implementation Summary
- Added `scripts/local-real-source-single-command-agent-tool-v0-cli.mjs`.
- Added `scripts/verify-local-real-source-single-command-agent-tool-v0.mjs`.
- Added package scripts:

```bash
npm run tool:local-real-source-single-command-agent-tool-v0:run
npm run tool:local-real-source-single-command-agent-tool-v0:verify
```

- Added the verifier to `.github/workflows/proof-output-regression.yml`.
- Added the command to the local JSON agent tool manifest and manifest verifier.

## Command
The new command is:

```bash
npm run tool:local-real-source-single-command-agent-tool-v0:run -- --request-output <path> --response-output <path> --summary-output <path> --index-output <path> [--task-signal <text>] [--read-mode <mode>] [--depth <hint>]
```

## Behavior
The command:

- authors one constrained request artifact;
- forces `scope:repo-work-context`;
- runs the request through `tool:local-real-source-agent-request-runner-v0`;
- writes request, response, summary, and index artifacts to explicit paths;
- returns selected source refs, content digests, source materialization receipt refs, and default-deny posture.

## Verification
Local verification passed:

```bash
npm run tool:local-real-source-single-command-agent-tool-v0:verify
npm run tool:local-json-agent-tool-manifest:verify
```

The verifier proves:

- the authored request uses `scope:repo-work-context`;
- selected source refs match the narrow local real-source read boundary;
- bounded real-source response artifacts are written;
- source materialization receipt refs and `sha256:` digests are carried;
- output paths are explicit;
- direct agent repo file access remains denied;
- arbitrary source loading, directory traversal/listing, repo scanning, runtime/MCP/API/provider/persistence/auth/model/storage/contour execution remain denied.

## Outcome
The agent-facing local real-source path now has a one-command workflow:

```text
single command
→ constrained repo-work request
→ real-source request runner
→ bounded real context response / summary / index
→ no direct agent file access
```

This is a practical usability step toward a local v0 tool without introducing MCP/API runtime prematurely.
