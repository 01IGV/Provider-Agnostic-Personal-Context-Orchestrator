# Provider-Agnostic Personal Context Orchestrator

This repository holds the canonical system specification and the current implementation of a provider-agnostic personal context orchestration layer for AI models and agents.

## Current repository layout

### `/docs`
Canonical documents and technical specifications.
This area is the source of truth for system intent, architecture, contracts, governance, and implementation decomposition.

### `/packages`
TypeScript workspace packages for contract, boundary, governance, assembly, and runtime-surface shapes.

### `/scripts`
Local proof, verification, and agent-facing artifact commands.
These commands are intentionally bounded and do not grant runtime execution authority.

### `/.github/workflows`
GitHub Actions verification for proof output regression and safety-boundary checks.

### Not yet materialized
The repository does not currently include `/apps`, `/services`, or `/infrastructure`.
Those areas remain intentionally deferred until the authority, request, response, and tool artifact boundaries are stable.

## Documentation layout

- `docs/00-foundation` — vision, boundaries, master spec, core intent
- `docs/01-architecture` — system architecture and subsystem design
- `docs/02-contracts` — MCP, API, tool, and interface contracts
- `docs/03-governance` — policy, permissions, audit, retention, evaluation
- `docs/04-implementation` — implementation decomposition, sequencing, rollout

## Working rule

Canonical documents should stay inside `/docs` and should not be mixed into code directories.
Implementation code and proof tooling should stay in bounded implementation areas such as `/packages` and `/scripts`.
