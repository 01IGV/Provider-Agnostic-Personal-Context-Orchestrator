# Local Real-Source Agent Tool One-Command Run V0

## Pass ID
`2026-06-04-246-local-real-source-agent-tool-one-command-run-v0`

## Date
`2026-06-04`

## Pass Title
Local real-source agent tool one-command entrypoint plus receipt wrapper.

## Objective
Make the local real-source agent tool easier for an AI agent to use by combining
the existing entrypoint run and run-receipt writer into one bounded local command
that returns the run receipt as the primary agent-facing output artifact.

## Architectural Layer
Local agent tool surface and proof/verification contour.

## Bounded Scope of This Pass
- Add one local CLI wrapper around the existing entrypoint and run-receipt writer.
- Write all new wrapper artifacts under one explicit artifact directory.
- Expose the run receipt as the primary AI-agent output artifact.
- Add a verifier, npm scripts, CI wiring, and manifest discovery entry.

## Out of Scope
- No MCP/API transport.
- No MCP tool/resource registration.
- No API routes or controllers.
- No runtime handlers.
- No provider SDK calls.
- No concrete persistence.
- No auth/IAM implementation.
- No policy execution or permission grants.
- No model calls.
- No arbitrary source loading.
- No direct agent repo file access.
- No contour execution.

## Modules Affected
- `scripts`
- local JSON agent tool manifest
- CI proof-output regression wiring
- implementation documentation

## Files Affected
- `scripts/local-real-source-agent-tool-one-command-run-v0-cli.mjs`
- `scripts/verify-local-real-source-agent-tool-one-command-run-v0.mjs`
- `scripts/local-json-agent-tool-manifest-cli.mjs`
- `scripts/verify-local-json-agent-tool-manifest.mjs`
- `package.json`
- `.github/workflows/proof-output-regression.yml`
- `docs/04-implementation/CURRENT_IMPLEMENTATION_STATE.md`
- `docs/04-implementation/KNOWN_IMPLEMENTATION_ISSUES.md`
- `docs/04-implementation/execution-reports/2026-06-04-246-local-real-source-agent-tool-one-command-run-v0.md`

## Changes Made
- Added `runLocalRealSourceAgentToolOneCommandRunV0`.
- The wrapper accepts `--artifact-dir` plus the existing allowlisted request
  intent hints: `--task-signal`, `--read-mode`, and `--depth`.
- The wrapper calls the existing local real-source agent tool entrypoint and then
  writes the existing run receipt under a fixed path inside the artifact
  directory.
- The wrapper writes a one-command summary under the same artifact directory and
  points `primary_agent_output_path` at the run receipt.
- Added `tool:local-real-source-agent-tool-one-command-run-v0:run` and
  `tool:local-real-source-agent-tool-one-command-run-v0:verify`.
- Added the command to the local JSON agent tool manifest and manifest verifier.
- Added the verifier to the GitHub Actions proof-output regression workflow.

## Architectural Boundaries Preserved
The wrapper imports and composes existing local artifact commands in-process. It
does not spawn child processes, register MCP/API tools, create routes, bind
runtime handlers, call providers, read arbitrary files, grant permissions, write
storage, call models, or execute contours.

## Technical Decisions Made
- Keep the run receipt as the primary AI-agent output artifact instead of asking
  agents to inspect the entrypoint summary first.
- Keep the one-command summary as a wrapper-level artifact only, written under
  the same explicit artifact directory.
- Reuse the existing entrypoint and run-receipt contracts instead of redefining
  the bounded context response path.

## Verification Performed
- `node --check scripts/local-real-source-agent-tool-one-command-run-v0-cli.mjs`
- `node --check scripts/verify-local-real-source-agent-tool-one-command-run-v0.mjs`
- `node --check scripts/local-json-agent-tool-manifest-cli.mjs`
- `node --check scripts/verify-local-json-agent-tool-manifest.mjs`
- `node scripts/verify-local-json-agent-tool-manifest.mjs`

Attempted direct local verification of
`node scripts/verify-local-real-source-agent-tool-one-command-run-v0.mjs`, but
it stalled in the pre-existing local real-source entrypoint import chain. A
control attempt against the existing
`node scripts/verify-local-real-source-agent-tool-entrypoint-v0.mjs` also
stalled in this desktop session. The affected verification path is therefore
recorded as a local desktop verification gap.

GitHub Actions PR run `26972911431` passed for PR #141, including the new
`Verify local real source agent tool one-command run v0` workflow step.

## Current Outcome
The repository now has a bounded one-command local artifact wrapper that gives an
AI agent a single primary run receipt artifact after a local real-source
entrypoint run, without opening direct repo file access or runtime execution.

## Known Limitations After This Pass
The direct local real-source verifier path stalled in this desktop session. CI
verification passed in a clean GitHub Actions runner.

## Known Issues Introduced or Updated
Updated `KNOWN_IMPLEMENTATION_ISSUES.md` with the local real-source verifier
import stall observed in this session.

## Next Recommended Bounded Step
Merge the stacked documentation and implementation PRs in order, then run a
repo-first verdict after the one-command run v0 pass.

## Notes for Next Agent or Session
Do not broaden this into MCP/API runtime. If CI passes, the next repo-first
verdict should decide whether to tighten the one-command path with an acceptance
proof or move toward the next AI-facing protocol-adjacent boundary without
registering runtime surfaces.
