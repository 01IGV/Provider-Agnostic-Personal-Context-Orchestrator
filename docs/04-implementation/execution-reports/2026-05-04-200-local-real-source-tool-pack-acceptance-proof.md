# Execution Report

## Pass ID
`2026-05-04-200-local-real-source-tool-pack-acceptance-proof`

## Date
`2026-05-04`

## Pass Title
Local real-source tool-pack acceptance proof.

## Objective
Add a proof that an AI agent can start from the local real-source tool-pack index and validate the usable real-source path without hidden repo knowledge.

## Implementation Summary
- Added `scripts/verify-local-real-source-tool-pack-acceptance-proof.mjs`.
- Added package script:

```bash
npm run proof:local-real-source-tool-pack-acceptance:verify
```

- Added the verifier to `.github/workflows/proof-output-regression.yml`.
- Added the proof command to the local JSON agent tool manifest and manifest verifier.

## Proof Shape
The proof materializes a local real-source tool-pack artifact set in temp paths, then starts from:

```text
local-real-source-tool-pack.index.json
```

From that index it discovers and verifies:

- manifest artifact;
- constrained request artifact;
- bounded response artifact;
- summary artifact;
- run index artifact;
- sample artifact-set index;
- command refs;
- selected scope/source refs;
- receipt/provenance/permission/audit refs;
- content digests;
- default-deny runtime posture.

## Verification
Local verification passed:

```bash
npm run proof:local-real-source-tool-pack-acceptance:verify
npm run tool:local-json-agent-tool-manifest:verify
```

The proof verifies:

- `started_from_tool_pack_index: true`;
- `used_discovered_manifest_and_sample_refs: true`;
- selected scope remains `scope:repo-work-context`;
- selected refs remain the two allowlisted narrow local real-source read boundary refs;
- source materialization receipt refs and `sha256:` content digests are carried;
- direct agent repo file access, arbitrary source loading, directory traversal/listing, repo scanning, runtime/MCP/API/provider/persistence/auth/model/storage execution, and contour execution remain denied.

## Outcome
The real-source tool-pack now has a machine-checkable acceptance proof.

This is a practical step toward a real AI-agent tool because the agent-facing usage path is now proven from the package index rather than from chat or implicit repo knowledge.
