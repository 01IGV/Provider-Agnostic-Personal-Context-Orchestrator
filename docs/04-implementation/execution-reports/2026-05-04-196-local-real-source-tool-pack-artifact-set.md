# Execution Report

## Pass ID
`2026-05-04-196-local-real-source-tool-pack-artifact-set`

## Date
`2026-05-04`

## Pass Title
Local real-source tool-pack artifact set.

## Objective
Add a top-level local real-source tool-pack artifact set for AI-agent inspection.

## Implementation Summary
- Added `scripts/local-real-source-tool-pack-cli.mjs`.
- Added `scripts/verify-local-real-source-tool-pack-artifact-set.mjs`.
- Added package scripts:

```bash
npm run tool:local-real-source-tool-pack:write
npm run tool:local-real-source-tool-pack:verify
```

- Added the verifier to `.github/workflows/proof-output-regression.yml`.
- Added the tool-pack writer to the local JSON agent tool manifest and manifest verifier.

## Command
The new writer is:

```bash
npm run tool:local-real-source-tool-pack:write -- --manifest-output <path> --request-output <path> --response-output <path> --summary-output <path> --index-output <path> --sample-index-output <path> --tool-pack-index-output <path>
```

## Artifact Set
The writer produces:

- local JSON agent tool manifest artifact;
- constrained real-source sample request artifact;
- bounded real-source response artifact;
- single-command summary artifact;
- single-command run index artifact;
- sample artifact-set index;
- top-level real-source tool-pack index.

## Verification
Local verification passed:

```bash
npm run tool:local-real-source-tool-pack:verify
npm run tool:local-json-agent-tool-manifest:verify
```

The verifier proves:

- the tool-pack writes only explicit artifact output paths;
- the top-level index points to the real-source single-command tool and sample writer;
- selected scope remains `scope:repo-work-context`;
- selected refs remain the two allowlisted narrow local real-source read boundary refs;
- source materialization receipt refs, content digests, provenance, permission, and audit refs are carried;
- direct agent repo file access, arbitrary source loading, directory traversal/listing, repo scanning, runtime/MCP/API/provider/persistence/auth/model/storage execution, and contour execution remain denied.

## Outcome
The real-source path now has a top-level agent-inspectable tool-pack artifact set.

This improves practical AI-agent usability without widening source authority or adding runtime execution.
