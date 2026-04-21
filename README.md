# Provider-Agnostic Personal Context Orchestrator

This repository is intended to hold both the canonical system specification and, later, the implementation of a provider-agnostic personal context orchestration layer for AI models and agents.

## Repository structure

### `/docs`
Canonical documents and technical specifications.
This area is the source of truth for system intent, architecture, contracts, governance, and implementation decomposition.

### Future code areas
These are expected to remain separate from canonical documentation:
- `/apps`
- `/packages`
- `/services`
- `/tools`
- `/infrastructure`

## Documentation layout

- `docs/00-foundation` — vision, boundaries, master spec, core intent
- `docs/01-architecture` — system architecture and subsystem design
- `docs/02-contracts` — MCP, API, tool, and interface contracts
- `docs/03-governance` — policy, permissions, audit, retention, evaluation
- `docs/04-implementation` — implementation decomposition, sequencing, rollout

## Working rule

Canonical documents should stay inside `/docs` and should not be mixed into code directories.
Implementation code should be added later in its own top-level areas.
