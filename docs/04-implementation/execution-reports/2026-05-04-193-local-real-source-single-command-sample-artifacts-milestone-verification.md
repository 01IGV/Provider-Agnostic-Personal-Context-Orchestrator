# Execution Report

## Pass ID
`2026-05-04-193-local-real-source-single-command-sample-artifacts-milestone-verification`

## Date
`2026-05-04`

## Pass Title
Local real-source single-command sample artifacts milestone verification.

## Objective
Verify the full local real-source single-command sample artifact milestone before PR handoff.

## Verification Commands
Local verification passed:

```bash
git diff --check
npm run typecheck
npm run tool:local-real-source-single-command-sample:verify
npm run tool:local-real-source-single-command-agent-tool-v0:verify
npm run tool:local-real-source-agent-request-runner-v0:verify
npm run tool:local-real-source-adapter-v0:verify
npm run contract:narrow-local-real-source-read-boundary:verify
npm run tool:local-json-agent-tool-manifest:verify
npm run proof:end-to-end:non-executing:verify
npm run proof:authority-boundary-denial:verify
```

## Verification Notes
- `proof:authority-boundary-denial:verify` initially failed while several `tsc -b --force` commands were running in parallel and then passed when rerun alone.
- The successful rerun preserved the expected authority/default-deny result and did not require code changes.

## Confirmed Behavior
- The sample writer creates request, response, summary, run index, and sample index artifacts only at explicit output paths.
- The generated request stays fixed to `scope:repo-work-context`.
- Selected source refs remain the two allowlisted narrow local real-source read boundary refs.
- The response carries source materialization receipt refs and `sha256:` content digests.
- Direct agent repo file access, arbitrary source loading, directory traversal/listing, repo scanning, runtime permission, MCP/API/provider/persistence/auth/model/storage execution, and contour execution remain denied.
- The local JSON agent tool manifest exposes the sample writer as an agent-discoverable local command.

## Outcome
The local real-source single-command sample artifact set is ready for PR.

This pass improves real-life agent usability by giving an AI agent a deterministic, inspectable sample artifact set for the one-command real-source repo-work context path, without granting direct file access or widening runtime authority.
