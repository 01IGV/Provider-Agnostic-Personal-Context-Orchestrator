# Execution Report

## Pass ID
`2026-05-04-192-local-real-source-single-command-sample-artifacts`

## Date
`2026-05-04`

## Pass Title
Local real-source single-command sample artifacts.

## Objective
Add deterministic sample artifacts for the local real-source single-command agent tool v0.

## Implementation Summary
- Added `scripts/local-real-source-single-command-sample-cli.mjs`.
- Added `scripts/verify-local-real-source-single-command-sample-artifact-set.mjs`.
- Added package scripts:

```bash
npm run tool:local-real-source-single-command-sample:write
npm run tool:local-real-source-single-command-sample:verify
```

- Added the verifier to `.github/workflows/proof-output-regression.yml`.
- Added the sample writer to the local JSON agent tool manifest and manifest verifier.

## Command
The new sample writer is:

```bash
npm run tool:local-real-source-single-command-sample:write -- --request-output <path> --response-output <path> --summary-output <path> --index-output <path> --sample-index-output <path>
```

## Artifact Set
The writer produces:

- constrained sample request artifact;
- bounded real-source response artifact;
- single-command summary artifact;
- single-command run index artifact;
- sample artifact-set index for AI-agent inspection.

## Verification
Local verification passed:

```bash
npm run tool:local-real-source-single-command-sample:verify
npm run tool:local-json-agent-tool-manifest:verify
```

The verifier proves:

- sample request uses `scope:repo-work-context`;
- selected refs match `narrow-local-real-source-read-boundary/v1`;
- response, summary, index, and sample index are written to explicit paths;
- source materialization receipt refs and `sha256:` digests are carried;
- direct agent repo file access remains denied;
- arbitrary source loading, directory traversal/listing, repo scanning, runtime/MCP/API/provider/persistence/auth/model/storage/contour execution remain denied.

## Outcome
The single-command real-source tool is now accompanied by deterministic, agent-inspectable sample artifacts.

This improves handoff/readiness without widening source authority or adding MCP/API runtime behavior.
