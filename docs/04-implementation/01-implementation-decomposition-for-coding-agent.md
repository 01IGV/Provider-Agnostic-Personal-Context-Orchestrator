# Implementation Decomposition for Coding Agent

## 0. Purpose of this document

This document defines the implementation decomposition of the Provider-Agnostic Personal Context Orchestrator for a coding agent.

Its role is to translate the canonical system description into a disciplined implementation order that preserves architectural integrity.

This document answers questions such as:
- how the full system should be decomposed into implementation units;
- what must be built first and what must wait;
- which modules are foundational versus downstream;
- how dependencies between modules should be respected;
- how a coding agent should avoid collapsing the system into a storage-first or provider-first architecture;
- how to move from documentation-complete architecture into code without losing the intended system shape.

This is not a sprint backlog and not a lightweight MVP shortcut.
It is the canonical implementation order for **materializing the full intended system in a controlled way**.

---

## 1. Decomposition thesis

The full system should not be implemented as one large undifferentiated codebase push.
It should be materialized through architectural layers in a strict dependency-aware order.

### Canonical statement

> The coding agent should implement the system in the order that preserves semantics first, then control, then execution surfaces, then provider adaptation — not in the order that happens to feel fastest in code.

This means the implementation sequence must protect:
- canonical semantics;
- contour separation;
- governance authority;
- provider neutrality;
- auditability.

---

## 2. What this document is optimizing for

The implementation order is optimized for:

1. architectural integrity
2. semantic stability
3. contour separation
4. governance-first control
5. provider neutrality
6. auditability from early stages
7. future adaptability of runtime surfaces

It is **not** optimized for:
- fastest possible prototype
- easiest single-provider demo
- quickest storage-first shortcut
- monolithic all-in-one implementation

### Rule

> The coding path should preserve the intended system more strongly than it optimizes for short-term implementation convenience.

---

## 3. Implementation strategy overview

The system should be implemented in 8 major implementation layers:

1. **Canonical Foundations Layer**
2. **Core Domain Layer**
3. **Persistence and Record Layer**
4. **Operational Contours Layer**
5. **Governance and Trust Layer**
6. **Integration Surface Layer**
7. **Provider Adapter Layer**
8. **Assembly and Control Layer**

These layers should be implemented in dependency order.

---

## 4. Layer 1 — Canonical Foundations Layer

### Purpose
Materialize the stable conceptual foundation in code form before business logic expands.

### This layer should define
- core terminology as typed code concepts
- shared enums and identifiers
- canonical record family distinctions
- lifecycle states
- scope types
- visibility types
- decision outcome types
- audit and evaluation category types

### Why this layer comes first
If the system does not stabilize its canonical vocabulary in code, every later module risks inventing its own semantics.

### Typical code artifacts
- core type definitions
- shared constant vocabularies
- status enums
- scope enums
- contour labels
- canonical discriminator unions

### Rule

> The coding agent should establish semantic primitives before implementing behavior.

---

## 5. Layer 2 — Core Domain Layer

### Purpose
Materialize the canonical domain model independently from storage and providers.

### This layer should define
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
- audit model
- handoff model
- bundle model
- relation model
- provider profile model

### Why this layer comes second
The system should have a stable domain model before storage schemas, transport shapes, or provider integration are introduced.

### Typical code artifacts
- domain entities
- canonical schemas
- validation models
- record constructors
- semantic conversion helpers

### Rule

> Domain semantics should exist before persistence details and before provider-specific projection.

---

## 6. Layer 3 — Persistence and Record Layer

### Purpose
Materialize the record storage abstractions required by the canonical model.

### This layer should define
- event store abstraction
- memory store abstraction
- state store abstraction
- relation store abstraction
- derived artifact store abstraction
- audit store abstraction
- evaluation store abstraction where appropriate
- retrieval/index abstractions

### Important constraint
This layer should not define the meaning of records.
It should persist the domain model defined earlier.

### Typical code artifacts
- repository interfaces
- persistence adapters
- query abstractions
- index abstractions
- record mappers

### Rule

> Persistence should implement the canonical model, not replace it.

---

## 7. Layer 4 — Operational Contours Layer

### Purpose
Materialize the 4 core operational intelligence loops.

### This layer should implement
- read path pipeline
- pack loop pipeline
- write path pipeline
- handoff pipeline

### Decompose internally as
#### 7.1. Read contour
- request normalization intake
- intent and mode resolution
- scope resolution
- candidate discovery
- eligibility filtering
- ranking and selection

#### 7.2. Pack contour
- packing strategy selection
- section planning
- candidate assignment
- compression and shaping
- bundle assembly

#### 7.3. Write contour
- writeback envelope intake
- candidate extraction
- typing/classification
- admissibility gating hooks
- dedup/conflict analysis
- decision routing
- mutation planning

#### 7.4. Handoff contour
- trigger detection
- target-boundary selection
- continuity candidate selection
- handoff shaping
- handoff validation hooks
- handoff artifact materialization

### Why this layer comes before integration
The system must know how it behaves internally before it exposes itself externally.

### Rule

> External surfaces should call operational contours, not invent them.

---

## 8. Layer 5 — Governance and Trust Layer

### Purpose
Materialize the rule, decision, audit, and evaluation discipline that governs the contours.

### This layer should implement
- admissibility rules
- visibility rules
- scope rules
- retention/lifecycle rules
- conflict/dedup rules
- transfer rules
- decision record creation
- audit record creation
- evaluation result generation scaffolds

### Important dependency direction
Operational contours may call governance components, but governance semantics should remain centrally defined.

### Typical code artifacts
- policy evaluators
- governance services
- decision engines
- audit emitters
- evaluation collectors

### Rule

> Governance should be implemented as authority logic, not scattered conditionals across contour code.

---

## 9. Layer 6 — Integration Surface Layer

### Purpose
Materialize the system’s external interaction surfaces.

### This layer should implement
- MCP-facing capability exposure
- direct API surface
- request normalization into canonical envelopes
- surface-level validation
- typed response shaping
- capability-aware tool exposure
- surface-level error normalization

### Why this layer comes after contours and governance
The system should expose stable operations only after those operations exist canonically inside.

### Typical code artifacts
- MCP surface adapters
- API controllers or handlers
- response translators
- capability descriptors
- surface error mappers

### Rule

> Integration surfaces should expose the orchestrator, not define it.

---

## 10. Layer 7 — Provider Adapter Layer

### Purpose
Materialize the edge translation layer for providers, runtimes, and hosts.

### This layer should implement
- provider profile handling
- canonical-to-provider projection logic
- bundle projection logic
- tool projection logic
- execution-surface assembly
- provider output normalization
- canonical writeback envelope generation

### Why this layer comes after integration and contours
The provider adapter layer should project already-defined canonical behavior, not influence core semantics upstream.

### Typical code artifacts
- provider profiles
- projection planners
- bundle projectors
- tool projectors
- output normalizers
- runtime-specific compatibility modules

### Rule

> Provider adaptation should be implemented as an edge layer after canonical semantics are already stable in code.

---

## 11. Layer 8 — Assembly and Control Layer

### Purpose
Assemble all preceding layers into a coherent running system.

### This layer should implement
- system wiring
- dependency injection or equivalent composition
- runtime configuration surfaces
- client capability registration
- orchestration entrypoints
- operational mode selection
- control-plane startup logic where needed

### Why this layer comes last
System assembly should compose already-defined layers rather than inventing behavior during bootstrapping.

### Rule

> Assembly should wire the system together, not silently introduce new semantics.

---

## 12. Canonical module grouping

The coding agent should group code by system meaning, not only by technical convenience.

### Recommended top-level implementation module families
At minimum:
- `core-foundation`
- `core-domain`
- `persistence`
- `read-path`
- `pack-loop`
- `write-path`
- `handoff`
- `governance`
- `audit-eval`
- `integration-mcp`
- `integration-api`
- `provider-adapters`
- `system-assembly`

### Constraint
Exact repo layout may vary, but these semantic separations should remain visible.

### Rule

> Implementation modules should reflect system contours and authority boundaries.

---

## 13. Strict dependency direction

The coding agent should preserve one-way dependency flow as much as practical.

### Preferred dependency direction
- foundation -> domain
- domain -> persistence abstractions
- domain -> contour logic
- governance -> domain and contour integration
- contours -> persistence abstractions and governance
- integration -> contours
- provider adapters -> canonical outputs of contours/integration
- assembly -> all prior layers

### What should be avoided
- provider adapters depending inward on raw persistence semantics
- integration surfaces bypassing contours
- persistence code inventing domain meaning
- audit/eval logic hidden inside providers

### Rule

> Dependency direction should preserve semantic authority: core inward, edge outward.

---

## 14. First implementation artifacts the coding agent should create

Before writing complex services, the coding agent should first create:

1. foundational shared type definitions
2. canonical domain schemas
3. record family discriminators
4. scope and lifecycle primitives
5. decision outcome primitives
6. bundle and handoff base structures
7. policy/evaluation primitive types

Only after that should it implement operational services.

### Rule

> The first code written should stabilize semantics, not chase runtime behavior.

---

## 15. Recommended implementation sequence inside operational contours

Once foundations, domain, and persistence abstractions exist, the coding agent should implement the 4 contours in this order:

1. **Read Path**
2. **Pack Loop**
3. **Write Path**
4. **Handoff**

### Why this order
- read defines what context becomes available;
- pack defines how it becomes deliverable;
- write defines how new context enters canonical state;
- handoff depends on continuity surfaces built by all prior contours.

### Rule

> Handoff should not be built before the system can already read, pack, and write continuity meaningfully.

---

## 16. Recommended implementation sequence inside governance and trust

Governance should not arrive only after everything else works.
It should be layered in early enough to prevent bad architecture drift.

### Suggested internal sequence
1. admissibility rules
2. scope and visibility rules
3. lifecycle/retention rules
4. dedup/conflict rules
5. decision record generation
6. audit emission
7. evaluation scaffolding

### Rule

> Governance should arrive before write mutation becomes convenient, not after mutation patterns harden.

---

## 17. Recommended implementation sequence for integration surfaces

Integration should be materialized only after canonical contours and governance exist.

### Suggested sequence
1. canonical request/response envelope layer
2. API surface
3. MCP surface
4. capability gating on surfaces
5. surface error normalization
6. richer audit-linked inspection surfaces

### Why API before MCP in implementation order
The API surface is often easier for internal validation and structured system testing before host-mediated tool behavior is introduced.

### Rule

> Use API to validate canonical operations first, then expose MCP cleanly on top.

---

## 18. Recommended implementation sequence for provider adapters

Provider adapters should be materialized after canonical surfaces exist.

### Suggested sequence
1. provider profile model
2. canonical bundle projection layer
3. canonical tool projection layer
4. output normalization layer
5. writeback envelope normalization
6. cross-provider semantic checks

### Why this matters
A provider adapter should project a stable canonical system, not shape it prematurely.

### Rule

> Adapters should be last-mile translations, not early design anchors.

---

## 19. Coding agent guardrails

The coding agent should operate under explicit anti-drift guardrails.

### It should not
- implement raw prompt assembly before canonical bundle models exist
- implement storage tables before canonical domain types exist
- write provider-specific logic inside domain or contour layers
- let a read surface bypass scope logic
- let a write surface bypass governance
- collapse memory and state into one record type for convenience
- treat summaries as canonical truth
- treat handoffs as generic summaries

### Rule

> The coding agent should protect architectural boundaries even when shortcuts appear implementation-efficient.

---

## 20. Implementation checkpoints

The coding agent should treat these as mandatory checkpoints between phases.

### Checkpoint 1 — Semantic stability
Can the system express canonical types and entities clearly in code?

### Checkpoint 2 — Contour separation
Are read, pack, write, and handoff implemented as distinct service layers?

### Checkpoint 3 — Governance authority
Can canonical mutation happen only through governed decision paths?

### Checkpoint 4 — Surface discipline
Do API/MCP surfaces call canonical operations instead of redefining them?

### Checkpoint 5 — Provider neutrality
Are adapters isolated enough that core semantics remain unchanged if a provider changes?

### Checkpoint 6 — Auditability
Can the system explain and trace major read/pack/write/handoff decisions?

### Rule

> Implementation should pause at architectural checkpoints rather than assuming forward motion equals correct motion.

---

## 21. Suggested implementation artifacts by layer

### Foundation layer artifacts
- shared enums
- shared identifiers
- lifecycle/status vocabularies
- scope vocabularies
- decision vocabularies

### Core domain artifacts
- canonical entity schemas
- domain constructors
- validation helpers
- cross-entity relation primitives

### Persistence layer artifacts
- repository interfaces
- record mapping contracts
- index interfaces
- store abstractions

### Operational contour artifacts
- read pipeline services
- pack pipeline services
- write pipeline services
- handoff pipeline services

### Governance layer artifacts
- policy evaluators
- decision services
- conflict analyzers
- audit emitters
- evaluation metric collectors

### Integration layer artifacts
- request normalizers
- API handlers
- MCP tool/resource exposures
- response shapers

### Provider layer artifacts
- provider profiles
- projectors
- normalizers
- runtime compatibility components

### Assembly layer artifacts
- application composition root
- runtime wiring
- environment configuration
- control-plane bootstrap

---

## 22. Testing and verification stance for the coding agent

Implementation decomposition should assume verification at each layer.

### At minimum, the coding agent should verify
- semantic schema integrity
- canonical/derived separation
- read path boundedness behavior
- pack loop structure preservation
- write governance enforcement
- handoff boundedness and traceability
- surface-level request normalization
- provider projection non-corruption

### Rule

> Verification should follow contour and governance boundaries, not only low-level function behavior.

---

## 23. What the coding agent should implement last

The following should come late, not early:

- provider-specific optimizations
- richer MCP convenience surfaces
- advanced caching shortcuts
- complex control-plane UX
- speculative cross-provider tuning
- broad operational dashboarding

### Why
These features are valuable, but they should be built after canonical system behavior is already stable.

### Rule

> Late optimization should not become early architecture.

---

## 24. Failure modes in implementation decomposition

The coding agent should explicitly guard against these implementation failures:

### 24.1. Storage-first collapse
The system becomes a database layer plus retrieval helpers.

### 24.2. Provider-first collapse
The system becomes tailored to one host/runtime and only later tries to generalize.

### 24.3. Surface-first collapse
The system builds MCP/API handlers before contours and governance are stable.

### 24.4. Summary-first shortcut
Derived artifacts substitute for canonical semantics.

### 24.5. Monolithic service drift
Contours and authority layers are implemented as one large service blob.

### 24.6. Governance afterthought
Write mutation becomes convenient before governance is strong enough.

### 24.7. Audit omission
Tracing and evaluation are postponed until behavior is already hard to inspect.

### 24.8. Handoff confusion
Handoff is implemented as generic summary or session note rather than continuity transfer.

### Rule

> Most implementation failures here are ordering failures before they are coding failures.

---

## 25. Implementation invariants

The following must remain true during implementation:

### 25.1. Semantic foundations precede behavioral complexity.
### 25.2. Canonical domain precedes persistence optimization.
### 25.3. Operational contours remain distinct.
### 25.4. Governance precedes unconstrained canonical mutation.
### 25.5. Integration surfaces remain downstream of canonical operations.
### 25.6. Provider adapters remain downstream of canonical surfaces.
### 25.7. Audit and evaluation remain available early enough to prevent opaque drift.
### 25.8. Derived artifacts never replace canonical semantics.

These invariants are central to turning the design into the intended system rather than a weaker approximation.

---

## 26. Canonical implementation order summary

### Phase 1
Foundations

### Phase 2
Core domain

### Phase 3
Persistence abstractions

### Phase 4
Read path

### Phase 5
Pack loop

### Phase 6
Write path

### Phase 7
Handoff

### Phase 8
Governance and trust reinforcement

### Phase 9
API surface

### Phase 10
MCP surface

### Phase 11
Provider adapters

### Phase 12
System assembly and control layer

This is the preferred implementation order for the coding agent.

---

## 27. How the coding agent should use this document

The coding agent should treat this file as the architectural sequencing authority.

It should use it to:
- decide what module to build next
- check whether dependencies are already in place
- avoid introducing provider-specific logic too early
- avoid implementing surfaces before canonical operations exist
- preserve the intended boundary between canonical and derived layers

### Rule

> When in doubt, the coding agent should prefer the dependency-safe order over the seemingly faster local shortcut.

---

## 28. Final statement

Implementation decomposition is the discipline that turns a strong architecture into a real system without breaking its meaning on the way.

Its quality determines whether the coding agent materializes the intended provider-agnostic context infrastructure layer — or accidentally builds a faster, simpler, but fundamentally weaker substitute.
