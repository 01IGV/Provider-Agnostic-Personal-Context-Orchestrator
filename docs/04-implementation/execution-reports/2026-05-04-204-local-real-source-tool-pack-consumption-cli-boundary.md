# Execution Report

## Pass ID
`2026-05-04-204-local-real-source-tool-pack-consumption-cli-boundary`

## Date
`2026-05-04`

## Pass Title
Local real-source tool-pack consumption CLI boundary.

## Objective
Add a bounded command for consuming an explicitly provided local real-source tool-pack artifact set.

## Implementation Summary
- Added `scripts/local-real-source-tool-pack-consumption-cli.mjs`.
- Added `scripts/verify-local-real-source-tool-pack-consumption-cli-boundary.mjs`.
- Added package scripts:

```bash
npm run tool:local-real-source-tool-pack:consume
npm run tool:local-real-source-tool-pack-consumption:verify
```

- Added the verifier to `.github/workflows/proof-output-regression.yml`.
- Added the consumption command to the local JSON agent tool manifest and manifest verifier.

## Command
The new consumer is:

```bash
npm run tool:local-real-source-tool-pack:consume -- --tool-pack-index <path> --manifest <path> --request <path> --response <path> --summary <path> --index <path> --sample-index <path> --consumption-summary-output <path>
```

## Verification
Local verification passed:

```bash
npm run tool:local-real-source-tool-pack-consumption:verify
npm run tool:local-json-agent-tool-manifest:verify
```

The verifier proves:

- the consumer reads only explicit tool-pack artifact paths;
- provided paths must match the tool-pack index;
- artifact contract refs must match the provided artifacts;
- selected scope remains `scope:repo-work-context`;
- selected refs remain the two allowlisted narrow local real-source read boundary refs;
- source materialization receipt refs, content digests, provenance, permission, and audit refs are carried;
- the command writes one explicit consumption summary artifact;
- direct agent repo file access, arbitrary source loading, directory traversal/listing, repo scanning, runtime/MCP/API/provider/persistence/auth/model/storage execution, and contour execution remain denied.

## Outcome
The local real-source tool-pack is now explicitly consumable by an AI agent through a bounded local CLI command.

This improves practical usability without widening source authority or adding runtime execution.
