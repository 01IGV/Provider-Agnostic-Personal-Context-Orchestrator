# Documentation Drift Audit for Current Repo Layout

## Pass ID
`2026-06-04-245-documentation-drift-audit-current-repo-layout`

## Date
`2026-06-04`

## Pass Title
Documentation drift audit for current repo layout and protocol-surface wording.

## Objective
Audit early repository and integration-surface documentation for stale wording
after the README layout alignment, then update only the parts that could mislead
a future agent about current repo shape or proof-stage runtime permissions.

## Architectural Layer
Implementation documentation, foundation boundary documentation, and integration
contract documentation.

## Bounded Scope of This Pass
- Check early docs for stale top-level repo layout claims.
- Check early surface/tool docs for wording that could be misread as current
  permission to add runtime MCP/API/tool execution.
- Align documentation with current materialized repo state.

## Out of Scope
- No runtime implementation.
- No MCP server.
- No MCP tool/resource registration.
- No API routes or controllers.
- No runtime handlers.
- No provider SDK calls.
- No persistence writes.
- No permission grants.
- No model calls.
- No contour execution.

## Modules Affected
Documentation only.

## Files Affected
- `docs/00-foundation/01-system-vision-and-boundaries.md`
- `docs/02-contracts/01-mcp-and-api-integration-architecture.md`
- `docs/02-contracts/02-tool-contract-specification.md`
- `docs/04-implementation/02-repository-structure-and-first-module-sequence.md`
- `docs/04-implementation/CURRENT_IMPLEMENTATION_STATE.md`
- `docs/04-implementation/execution-reports/2026-06-04-245-documentation-drift-audit-current-repo-layout.md`

## Changes Made
- Updated the repository-structure document to distinguish the current
  materialized repo layout from deferred runtime/deployment areas.
- Recorded `/docs`, `/packages`, `/scripts`, and `/.github/workflows` as the
  current materialized top-level areas.
- Recorded `/apps`, `/services`, and `/infrastructure` as deferred until a
  bounded pass explicitly introduces them.
- Clarified that the earlier `/tools` concept has currently materialized as
  `/scripts` for local proof commands, deterministic artifact writers,
  verification utilities, and command wrappers.
- Added `runtime-surface` to the early package family and module-sequence lists
  so the documentation matches the 13 materialized package boundaries.
- Added current implementation notes to early foundation, MCP/API integration,
  and tool-contract docs clarifying that MCP/API/tool surfaces remain intended
  protocol-surface contracts, not current proof-stage runtime permissions.

## Architectural Boundaries Preserved
The pass preserves the repo-first authority boundary: docs clarify current
implementation status without granting runtime execution, direct agent repo file
access, provider calls, persistence, or MCP/API transport.

## Technical Decisions Made
- Treat early `/apps`, `/services`, and `/infrastructure` references as deferred
  architecture, not current expected repo contents.
- Treat `/scripts` as the current materialized home for proof/tool-command
  utilities, while leaving room for future `/tools` only if a bounded pass needs
  it.
- Keep MCP/API/tool documents as strategic contract documents, but annotate them
  with proof-stage permission boundaries.

## Verification Performed
- Searched early docs for stale layout and surface wording:
  - `/apps`
  - `/services`
  - `/tools`
  - `/infrastructure`
  - `MCP exposure`
  - `API tool exposure`
- Compared documented package families with actual package manifests under
  `/packages`.
- Documentation-only diff reviewed locally.

## Current Outcome
Future agents should no longer read the README and early implementation docs as
disagreeing about repo layout. They should also see that MCP/API/tool-surface
docs describe the intended external semantics while the current repository still
enforces a proof-stage default-deny runtime posture.

## Known Limitations After This Pass
The early architecture documents still describe the full intended system, not
only the current v0 tool path. That is intentional. `CURRENT_IMPLEMENTATION_STATE.md`
remains the current-facing source for what is implemented now.

## Known Issues Introduced or Updated
No new implementation issue introduced.

## Next Recommended Bounded Step
Continue with the selected implementation direction:

```text
feat/local-real-source-agent-tool-one-command-run-v0
```

## Notes for Next Agent or Session
Do not interpret the MCP/API/tool contract documents as permission to add runtime
surfaces. The next implementation should still produce a one-command local
artifact run path around the existing entrypoint and receipt writer.
