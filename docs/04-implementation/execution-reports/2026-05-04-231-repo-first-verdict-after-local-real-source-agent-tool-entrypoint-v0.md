# Execution Report

## Pass ID
`2026-05-04-231-repo-first-verdict-after-local-real-source-agent-tool-entrypoint-v0`

## Date
`2026-05-04`

## Pass Title
Repo-first verdict after local real-source agent tool entrypoint v0.

## Verdict
Proceed with `feat/local-real-source-agent-tool-entrypoint-request-options-v0`.

## Rationale
The entrypoint is now usable from one explicit artifact directory, but it still emits a fixed sample request. The lower single-command real-source runner already supports bounded intent variation, so the next practical step is to expose those same allowlisted options at the top-level entrypoint.

## Expected Implementation
Add optional entrypoint flags:

- `--task-signal <text>`
- `--read-mode <mode>`
- `--depth <hint>`

These values must flow only into request intent fields and must be reflected in entrypoint/readiness summaries.

## Explicit Non-Goals
No source-ref selection, directory listing, directory traversal, arbitrary file reads, arbitrary source loading, authority mutation, permission grant, MCP/API runtime, provider SDK call, concrete persistence, model call, storage write, or contour execution.
