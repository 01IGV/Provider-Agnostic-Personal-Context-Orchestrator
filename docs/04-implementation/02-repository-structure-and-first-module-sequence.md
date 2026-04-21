# Repository Structure and First Module Sequence

## 0. Purpose of this document

This document defines the intended repository structure and the first module sequence for implementing the Provider-Agnostic Personal Context Orchestrator.

Its role is to turn the implementation decomposition into a concrete repository-level materialization plan.

This document answers questions such as:
- how the repository should be organized so canonical documentation and implementation code do not collapse into each other;
- what top-level code areas should exist;
- which first modules should be created before broader system assembly begins;
- what files and responsibilities belong in those early modules;
- how the coding agent should avoid repo drift, module drift, and premature provider- or storage-first decisions.

This is not a generic repo-style note.
It is the canonical repository and early module sequencing plan for the full system.

---

## 1. Repository structure thesis

The repository should make the system legible at the filesystem level.

### Canonical statement

> The repository should mirror the architecture: canonical documents remain separate from code, canonical domain remains separate from providers, and operational contours remain visible as first-class modules.

A weak repository structure will cause even a strong architecture to blur during implementation.

---

## 2. Repository design objectives

The repository structure should optimize for:

1. architectural legibility
2. separation of canonical docs from code
3. separation of core semantics from edge adapters
4. contour visibility
5. governance visibility
6. provider-neutral implementation order
7. future maintainability and agent handoff

It should not optimize for:
- single-folder simplicity
- fastest first code drop
- provider-specific convenience
- hiding contours inside one monolithic service directory

### Rule

> The repository layout should reinforce the system’s meaning, not merely store its files.

---

## 3. Top-level repository layout

The repository should use a top-level structure similar to the following.

```text
/docs
/apps
/packages
/services
/tools
/infrastructure
```

### Top-level meanings

#### `/docs`
Canonical system definition, architecture, contracts, governance, and implementation sequencing.

#### `/apps`
Executable applications or entrypoints where needed later.

#### `/packages`
Reusable core packages that encode domain semantics, contours, governance, adapters, and shared contracts.

#### `/services`
Runtime services or deployable service units if the system is split into service processes later.

#### `/tools`
Optional tooling, scripts, developer utilities, code generation helpers, evaluation scripts.

#### `/infrastructure`
Deployment, ops, environment, provisioning, and control-plane infrastructure artifacts.

### Rule

> `/docs` must remain the source of truth for architecture, and must not be diluted into code directories.

---

## 4. Documentation structure inside `/docs`

The documentation structure already established should remain canonical.

```text
/docs
  /00-foundation
  /01-architecture
  /02-contracts
  /03-governance
  /04-implementation
```

### Meaning of each section
- `00-foundation` — system identity, boundaries, language
- `01-architecture` — structural and contour architecture
- `02-contracts` — MCP/API/tool semantics
- `03-governance` — policy, audit, evaluation, trust
- `04-implementation` — implementation sequencing and repo materialization

### Rule

> Documentation hierarchy should remain stable as code grows around it.

---

## 5. Code organization strategy

The codebase should favor semantic package separation over a monolithic service-first layout.

### Preferred approach
The earliest code should live primarily under `/packages`.

Why:
- the system’s core value is semantic and architectural, not UI-first;
- domain and contour modules should remain reusable and composable;
- provider neutrality is easier to preserve in package form;
- later services/apps can compose packages instead of redefining them.

### Rule

> The first serious implementation work should happen in reusable packages, not in a monolithic application shell.

---

## 6. Recommended first top-level package families

The coding agent should introduce package families that mirror the architecture.

### Canonical early package families
At minimum:
- `core-foundation`
- `core-domain`
- `persistence-contracts`
- `read-path`
- `pack-loop`
- `write-path`
- `handoff`
- `governance`
- `audit-eval`
- `integration-contracts`
- `provider-adapters`
- `system-assembly`

These names may evolve slightly, but the semantic boundaries should remain.

### Rule

> Package naming should communicate system role clearly enough that a future coding agent can orient without guessing.

---

## 7. Recommended initial `/packages` layout

A strong early repository shape under `/packages` should look conceptually like this:

```text
/packages
  /core-foundation
  /core-domain
  /persistence-contracts
  /read-path
  /pack-loop
  /write-path
  /handoff
  /governance
  /audit-eval
  /integration-contracts
  /provider-adapters
  /system-assembly
```

### Constraint
The first implementation pass does not need every package to be feature-complete, but the package boundaries should be established intentionally.

### Rule

> It is better to create a clean semantic skeleton early than to retrofit boundaries after a monolithic codebase emerges.

---

## 8. The first module sequence thesis

The coding agent should not start with whichever module feels easiest to code.
It should start with the module that stabilizes the system’s semantic spine.

### Canonical statement

> The first module should stabilize vocabulary and shared primitives; the second should stabilize the domain model; only then should operational contours begin.

This means the early module order matters more than local implementation convenience.

---

## 9. First module sequence

The recommended first module sequence is:

1. `core-foundation`
2. `core-domain`
3. `persistence-contracts`
4. `governance`
5. `read-path`
6. `pack-loop`
7. `write-path`
8. `handoff`
9. `audit-eval`
10. `integration-contracts`
11. `provider-adapters`
12. `system-assembly`

### Why this order
- semantics must exist before domain logic;
- domain must exist before storage contracts;
- governance must exist before unconstrained mutation patterns appear;
- read must precede pack;
- pack must precede provider projection;
- write must precede rich handoff refresh logic;
- audit/eval should be present before edge integrations grow too opaque.

### Rule

> The first module sequence should follow semantic dependency, not runtime convenience.

---

## 10. First module — `core-foundation`

### Purpose
Stabilize shared primitives used everywhere else.

### It should contain
- canonical enums
- shared type labels
- lifecycle states
- scope types
- visibility types
- decision outcome types
- contour identifiers
- common IDs and metadata primitives
- shared error family vocabulary

### It should not contain
- persistence code
- provider-specific code
- contour behavior
- orchestration logic

### Typical first files
- `src/types.ts`
- `src/ids.ts`
- `src/scopes.ts`
- `src/statuses.ts`
- `src/visibility.ts`
- `src/decisions.ts`
- `src/errors.ts`
- `src/index.ts`

### Rule

> `core-foundation` should be the first code module because every later package depends on its vocabulary.

---

## 11. Second module — `core-domain`

### Purpose
Materialize the canonical entity model in code.

### It should contain
- subject model
- owner model
- scope model
- session model
- workflow model
- event model
- memory object model
- state object model
- candidate model
- decision model
- summary model
- handoff model
- bundle model
- audit model
- provider profile model
- relation model

### It should not contain
- database concerns
- provider-specific projection logic
- MCP/API handlers
- orchestration services

### Typical first files
- `src/entities/subject.ts`
- `src/entities/scope.ts`
- `src/entities/session.ts`
- `src/entities/workflow.ts`
- `src/entities/event.ts`
- `src/entities/memory-object.ts`
- `src/entities/state-object.ts`
- `src/entities/candidate-record.ts`
- `src/entities/decision-record.ts`
- `src/entities/context-bundle.ts`
- `src/entities/handoff-artifact.ts`
- `src/entities/audit-record.ts`
- `src/entities/provider-profile.ts`
- `src/entities/relation-edge.ts`
- `src/index.ts`

### Rule

> `core-domain` should encode meaning before any system behavior is implemented.

---

## 12. Third module — `persistence-contracts`

### Purpose
Define how canonical records will be stored and retrieved without binding to a concrete backend yet.

### It should contain
- repository interfaces
- store abstractions
- query abstractions
- index abstractions
- canonical persistence contracts for events, memory, state, bundles, handoffs, audit, and evaluation

### It should not contain
- concrete database wiring first
- domain semantic redefinitions
- provider-specific code

### Typical first files
- `src/repositories/event-store.ts`
- `src/repositories/memory-store.ts`
- `src/repositories/state-store.ts`
- `src/repositories/handoff-store.ts`
- `src/repositories/bundle-store.ts`
- `src/repositories/audit-store.ts`
- `src/repositories/evaluation-store.ts`
- `src/repositories/relation-store.ts`
- `src/repositories/index-store.ts`
- `src/index.ts`

### Rule

> Persistence contracts should precede concrete persistence so contour code can depend on stable abstractions.

---

## 13. Fourth module — `governance`

### Purpose
Materialize the control authority logic before write and transfer behavior harden.

### It should contain
- admissibility evaluators
- visibility evaluators
- scope governance evaluators
- lifecycle/retention evaluators
- dedup/conflict evaluators
- decisioning services
- governance result models

### It should not contain
- direct provider logic
- API handlers
- hidden persistence-specific side effects

### Typical first files
- `src/admissibility.ts`
- `src/visibility.ts`
- `src/scope-governance.ts`
- `src/lifecycle.ts`
- `src/dedup.ts`
- `src/conflict.ts`
- `src/decision-engine.ts`
- `src/index.ts`

### Rule

> Governance should appear before the system becomes mutation-heavy.

---

## 14. Fifth module — `read-path`

### Purpose
Materialize the first operational contour.

### It should contain
- request normalization helpers
- intent/mode resolution services
- scope resolution services
- candidate discovery orchestrators
- filtering services
- ranking/selection services
- pack-input preparation

### Typical first files
- `src/request-envelope.ts`
- `src/intent-mode-resolver.ts`
- `src/scope-resolver.ts`
- `src/candidate-discovery.ts`
- `src/eligibility-filter.ts`
- `src/ranker.ts`
- `src/pack-input-builder.ts`
- `src/index.ts`

### Rule

> Read path should become executable before pack, because pack depends on selected candidates.

---

## 15. Sixth module — `pack-loop`

### Purpose
Materialize the second operational contour.

### It should contain
- packing strategy selection
- section planning
- candidate-to-section assignment
- compression/shaping logic
- bundle assembly
- bundle metadata generation

### Typical first files
- `src/packing-strategy.ts`
- `src/section-plan.ts`
- `src/assignment.ts`
- `src/compression.ts`
- `src/bundle-assembler.ts`
- `src/index.ts`

### Rule

> Pack loop should produce canonical bundles before any provider-specific projection is introduced.

---

## 16. Seventh module — `write-path`

### Purpose
Materialize the third operational contour.

### It should contain
- writeback envelope normalization
- candidate extraction
- candidate typing/classification
- dedup/conflict analysis integration
- governance decision routing
- mutation planning

### Typical first files
- `src/writeback-envelope.ts`
- `src/candidate-extractor.ts`
- `src/classifier.ts`
- `src/dedup-conflict-analysis.ts`
- `src/decision-router.ts`
- `src/mutation-plan.ts`
- `src/index.ts`

### Rule

> Write path should be implemented only after governance primitives already exist.

---

## 17. Eighth module — `handoff`

### Purpose
Materialize the fourth operational contour.

### It should contain
- handoff trigger detection
- target-boundary logic
- continuity candidate selection
- handoff shaping
- handoff validation integration
- handoff artifact materialization

### Typical first files
- `src/trigger-detection.ts`
- `src/target-definition.ts`
- `src/continuity-selection.ts`
- `src/handoff-shaping.ts`
- `src/handoff-validation.ts`
- `src/handoff-assembler.ts`
- `src/index.ts`

### Rule

> Handoff should be implemented only after the system already knows how continuity is read, packed, and written.

---

## 18. Ninth module — `audit-eval`

### Purpose
Materialize trust and quality instrumentation as reusable code.

### It should contain
- audit emitters
- audit record builders
- evaluation metric scaffolds
- contour-specific evaluation helpers
- provider-neutrality evaluation helpers

### Typical first files
- `src/audit-emitter.ts`
- `src/read-audit.ts`
- `src/pack-audit.ts`
- `src/write-audit.ts`
- `src/handoff-audit.ts`
- `src/evaluation-metrics.ts`
- `src/index.ts`

### Rule

> Audit and evaluation should become code before surfaces and adapters grow too opaque.

---

## 19. Tenth module — `integration-contracts`

### Purpose
Materialize canonical request/response contracts used by API and MCP surfaces.

### It should contain
- canonical request envelopes
- canonical response result models
- error families
- capability descriptors
- surface-neutral operation contracts

### Typical first files
- `src/request-contracts.ts`
- `src/response-contracts.ts`
- `src/error-contracts.ts`
- `src/capability-contracts.ts`
- `src/tool-contracts.ts`
- `src/index.ts`

### Rule

> Integration contracts should encode surface semantics without depending on provider-specific projection.

---

## 20. Eleventh module — `provider-adapters`

### Purpose
Materialize the provider/runtime edge translation layer.

### It should contain
- provider profile declarations
- projection planners
- canonical bundle projection
- tool projection
- output normalization
- writeback envelope normalization

### Typical first files
- `src/provider-profile.ts`
- `src/projection-plan.ts`
- `src/bundle-projector.ts`
- `src/tool-projector.ts`
- `src/output-normalizer.ts`
- `src/writeback-normalizer.ts`
- `src/index.ts`

### Rule

> Provider adapters should be introduced only after canonical bundle, tool, and write semantics are already stable.

---

## 21. Twelfth module — `system-assembly`

### Purpose
Wire the packages into a coherent runnable service or system.

### It should contain
- dependency composition
- runtime configuration
- orchestrator entrypoint wiring
- service startup and composition root
- environment-specific assembly

### Typical first files
- `src/container.ts`
- `src/config.ts`
- `src/bootstrap.ts`
- `src/index.ts`

### Rule

> Assembly should compose a stable system, not compensate for missing lower-layer design.

---

## 22. Recommended first non-doc repository additions

After documentation, the very first non-doc repository additions should be:

1. package workspace scaffolding
2. `core-foundation`
3. `core-domain`
4. `persistence-contracts`
5. `governance`

Only after those exist should the first operational contour package be added.

### Why
This prevents the common failure mode where the first code written is already a contour implementation built on unstable semantics.

### Rule

> The first code commit should scaffold meaning, not behavior.

---

## 23. Suggested workspace support files

The repository will likely also need foundational workspace files.

### These should be introduced early
- package manager/workspace manifest
- root TypeScript config if using TypeScript
- lint/format baseline
- package-level build conventions
- package export conventions
- testing baseline

### Constraint
These support files should serve the package structure, not dictate it.

### Rule

> Tooling should support architecture, not drive architecture.

---

## 24. Early implementation checkpoints in repo form

### Checkpoint 1 — Clean package skeleton
Do the package boundaries already mirror the architecture?

### Checkpoint 2 — Semantic packages first
Are `core-foundation` and `core-domain` materialized before contour code?

### Checkpoint 3 — Governance early enough
Does `governance` exist before write-heavy modules?

### Checkpoint 4 — Contour clarity
Are read, pack, write, and handoff separate package families?

### Checkpoint 5 — Edge isolation
Are provider adapters absent from core packages?

### Checkpoint 6 — Trust visibility
Does `audit-eval` exist before surfaces become too complex?

### Rule

> Repository checkpoints should protect architecture before code volume grows too large to refactor cleanly.

---

## 25. Repository failure modes

The coding agent should explicitly guard against these repository-level failures:

### 25.1. Docs/code collapse
Canonical docs and implementation artifacts blur into each other.

### 25.2. Monolithic packages
All contours and authority layers are implemented in one generic core package.

### 25.3. Provider leakage
Provider adapters appear inside domain or contour packages.

### 25.4. Storage-shaped layout
Repository layout reflects a data backend rather than system semantics.

### 25.5. Surface-first layout
API/MCP handlers appear before the core contour packages exist.

### 25.6. Governance invisibility
Governance logic is hidden inside contour or integration modules instead of being visibly first-class.

### 25.7. Trust afterthought
Audit and evaluation code is postponed until the edge layers are already entrenched.

### 25.8. Assembly-too-early
The repo gets an app shell before the core packages have stable boundaries.

### Rule

> Repository failure often begins as naming and placement failure before it becomes architectural failure.

---

## 26. Repository and module invariants

The following must remain true as the repo evolves:

### 26.1. `/docs` remains the canonical architecture source.
### 26.2. `/packages` carries most early system semantics.
### 26.3. Core packages remain provider-neutral.
### 26.4. Contours remain visibly separate in the codebase.
### 26.5. Governance remains visibly separate from contours.
### 26.6. Provider adapters remain edge packages.
### 26.7. Integration contracts remain separate from provider projections.
### 26.8. Assembly remains downstream of core packages.

These invariants are central to preserving the system’s intended shape in code.

---

## 27. Canonical first module sequence summary

### First repository move
Establish workspace skeleton and package boundaries.

### First code module
`core-foundation`

### Second code module
`core-domain`

### Third code module
`persistence-contracts`

### Fourth code module
`governance`

### Then operational contours
`read-path` -> `pack-loop` -> `write-path` -> `handoff`

### Then trust and edge layers
`audit-eval` -> `integration-contracts` -> `provider-adapters` -> `system-assembly`

This is the preferred first module sequence for the coding agent.

---

## 28. How the coding agent should use this document

The coding agent should treat this file as the repository-level sequencing authority.

It should use it to decide:
- what directory or package to create next;
- what not to create yet;
- where a new file belongs;
- whether a proposed module violates semantic boundaries;
- whether a new implementation step is early, timely, or premature.

### Rule

> When repo layout and implementation speed compete, the coding agent should prefer the layout that preserves architecture.

---

## 29. Final statement

Repository structure and first module sequence are not cosmetic concerns.

They are the filesystem-level expression of the architecture.
Their quality determines whether the coding agent builds the intended provider-agnostic context orchestrator — or whether the repo silently hardens into a weaker shape before the system is even fully materialized.
