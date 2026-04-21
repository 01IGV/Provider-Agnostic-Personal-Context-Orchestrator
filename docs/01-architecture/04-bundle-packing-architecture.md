# Bundle Packing Architecture

## 0. Purpose of this document

This document defines the bundle packing architecture of the Provider-Agnostic Personal Context Orchestrator.

Its role is to describe how the system transforms a bounded, ranked set of selected context candidates into a structured context bundle that can be safely and effectively consumed by a target model, runtime, or agent.

This document answers questions such as:
- how selected context becomes a delivery artifact;
- how sections are constructed;
- how boundedness is preserved;
- how packing differs from selection;
- how provider/runtime constraints influence bundle shape;
- how the system preserves traceability while compressing context.

This is not the read document and not the writeback document.
It is specifically about **how the selected context is assembled into a usable bounded bundle**.

---

## 1. Bundle packing thesis

Bundle packing is the disciplined transformation of selected context into a task-shaped delivery artifact.

### Canonical statement

> Packing must not be a naive concatenation step. It must be a governed structural process that turns selected context into a bounded execution-ready bundle.

The pack loop is therefore not cosmetic formatting.
It is a core architectural function that determines whether selected context remains usable or degrades into noise.

---

## 2. Bundle packing place in the overall architecture

In the full system loop, packing begins after the read path has produced a bounded selected candidate set and ends before the provider/runtime adapter executes the main model invocation.

### Position in the canonical execution loop
1. client invocation
2. read path
3. pack loop
4. provider/runtime shaping
5. model execution
6. optional expansion
7. output and writeback

The pack loop owns the transformation from selected candidates into bundle structure.

---

## 3. High-level packing stages

The pack loop should be understood as 7 stages:

1. **Pack input intake**
2. **Packing strategy selection**
3. **Section planning**
4. **Candidate-to-section assignment**
5. **Compression and representation shaping**
6. **Bundle assembly and metadata creation**
7. **Pack output handoff to provider/runtime adapter**

These stages should remain conceptually distinct.

---

## 4. Stage 1 — Pack input intake

### Purpose
Receive the read-path output as the raw material for bundle construction.

### Canonical pack input
At minimum, the pack loop should receive:
- `request_id`
- `client_id`
- `subject_id`
- `session_id` (nullable)
- `workflow_id` (nullable)
- `intent_type`
- `mode`
- `target_runtime` (nullable)
- `target_provider` (nullable)
- `target_model` (nullable)
- `selected_candidates`
- `selection_reasons`
- `scope_summary`
- `boundedness_hints`
- `packing_hints`
- `read_confidence_notes` (nullable)

### Rule

> The pack loop should operate on selected context, not reopen raw discovery as its main strategy.

---

## 5. Stage 2 — Packing strategy selection

### Purpose
Determine how the bundle should be shaped for the current task and target execution environment.

### Why this matters
Not every request needs the same bundle structure.
Different situations call for different bundle strategies.

### Canonical strategy drivers
At minimum:
- intent type
- mode
- target provider
- target model
- token budget
- latency expectations
- depth required
- continuity sensitivity
- handoff sensitivity
- tool usage expectations

### Example packing strategies
The exact taxonomy may evolve, but examples may include:
- `minimal_direct`
- `continuity_first`
- `state_first`
- `planning_first`
- `handoff_first`
- `artifact_supported`
- `deep_context`
- `strict_budget`

### Strategy output
At minimum:
- `packing_strategy`
- `bundle_section_template`
- `compression_policy`
- `priority_retention_policy`
- `target_budget`

### Rule

> Packing strategy must be explicit. The system should not use one universal bundle template for all contexts.

---

## 6. Stage 3 — Section planning

### Purpose
Define the structural layout of the bundle before content assignment.

### Why this matters
A bundle is not just a list of facts.
The model needs a structured context surface that reflects task priorities.

### Canonical section families
A full packing system should support sections such as:
- `purpose`
- `task_frame`
- `user_frame`
- `relevant_facts`
- `active_state`
- `open_loops`
- `constraints`
- `recent_decisions`
- `risk_notes`
- `artifact_refs`
- `uncertainty_notes`
- `tool_hints`
- `bundle_metadata`

### Section planning outputs
At minimum:
- ordered section plan
- required sections
- optional sections
- empty-section behavior
- per-section budget hints

### Rule

> Sections should be planned before content compression, not improvised at the end.

---

## 7. Stage 4 — Candidate-to-section assignment

### Purpose
Assign each selected candidate to the section where it most meaningfully belongs.

### Why this matters
Selected context is not yet bundle-structured.
The same candidate can be relevant in different ways depending on the bundle strategy.

### Typical assignments
- durable preferences -> `user_frame`
- active workflow items -> `active_state`
- unresolved items -> `open_loops`
- hard restrictions -> `constraints`
- accepted decisions -> `recent_decisions`
- external references -> `artifact_refs`
- lower-confidence ambiguities -> `uncertainty_notes`

### Rule

> Candidate assignment should preserve semantic role, not merely textual order.

---

## 8. Stage 5 — Compression and representation shaping

### Purpose
Transform assigned candidates into compact, model-usable representations while preserving meaning and traceability.

### Why this matters
Even a good selected set can become unusable if represented poorly.
Packing is where boundedness becomes real.

### Compression options
At minimum, the system should conceptually support:
- verbatim inclusion
- normalized short form
- structured bullet representation
- section-level synthesis
- hybrid representation where some items stay explicit and others are compressed

### Representation choices should depend on
- priority class
- section type
- confidence
- importance
- target budget
- provider/model constraints
- continuity sensitivity

### Rule

> Compression should remove noise and redundancy, not collapse meaning.

---

## 9. Stage 6 — Bundle assembly and metadata creation

### Purpose
Assemble the final bundle structure and attach the metadata needed for downstream execution and auditability.

### Minimum bundle metadata
At minimum:
- `bundle_id`
- `bundle_type`
- `purpose`
- `packing_strategy`
- `target_runtime`
- `target_provider` (nullable)
- `target_model` (nullable)
- `subject_id`
- `scope_ids`
- `generated_at`
- `expires_at` (nullable)
- `token_budget` (nullable)
- `source_record_ids`
- `compression_notes` (nullable)
- `freshness_notes` (nullable)
- `confidence_notes` (nullable)
- `generation_metadata`

### Assembly output
The final output should be a structured bundle object, not just loose text.

### Rule

> The bundle should remain a first-class typed artifact with metadata, not just a prompt snippet.

---

## 10. Stage 7 — Pack output handoff to provider/runtime adapter

### Purpose
Hand off the fully assembled bundle to the provider/runtime adapter layer for final execution shaping.

### This stage must not
- reopen raw selection logic
- rewrite canonical bundle semantics based on provider convenience alone
- destroy the bundle structure

### This stage should provide
At minimum:
- final structured bundle
- target runtime hints
- provider/model shaping hints
- allowed tool surface hints
- execution budget notes

### Rule

> Provider adaptation happens after packing, not instead of packing.

---

## 11. Bundle architecture vs prompt construction

A critical distinction must remain explicit.

### Bundle
A bundle is the structured context artifact produced by the orchestrator.

### Prompt construction
Prompt construction is the downstream process by which a provider adapter or runtime turns the bundle into the target model’s concrete invocation format.

### Canonical rule

> Bundle packing is upstream of provider-specific prompt construction.

This distinction protects the architecture from provider lock-in.

---

## 12. Canonical bundle composition model

A bundle should contain both semantic structure and operational metadata.

### Semantic layer
- purpose
- user frame
- relevant facts
- active state
- open loops
- constraints
- decisions
- risks
- artifacts

### Operational layer
- bundle type
- packing strategy
- target runtime/provider/model
- source record ids
- confidence/freshness notes
- generation metadata
- expiration or reuse hints

### Rule

> A strong bundle contains meaning and control metadata together.

---

## 13. Packing and boundedness

Boundedness is not only a read concern.
It is a packing concern as well.

### Packing-time boundedness controls
At minimum, the pack loop should support:
- section budgets
- per-type retention limits
- hard truncation rules
- optional omission of low-priority sections
- compression escalation for low-priority supporting material
- protection of critical sections from over-compression

### Critical idea
Not all sections should be compressed equally.
For example:
- constraints may need high preservation fidelity
- uncertainty notes may tolerate higher compression
- active state may require high precision

### Rule

> Boundedness should be section-aware, not only token-aware.

---

## 14. Packing and priority preservation

The pack loop must preserve the relative importance discovered by the read path.

### Priority-aware packing behavior
At minimum:
- `critical` items should resist aggressive compression
- `high` items should retain clear representation
- `supporting` items may be summarized more heavily
- `optional` items may be omitted under budget pressure

### Rule

> Packing must preserve importance gradients rather than flatten them.

---

## 15. Packing and memory vs state

Packing must respect the conceptual distinction between memory and state.

### Memory in packing
Memory is typically suited to:
- stable profile surfaces
- relevant facts
- durable constraints
- preference framing
- decision background

### State in packing
State is typically suited to:
- active state section
- open loops
- current workflow position
- unresolved branch context

### Rule

> Packing should show memory and state as different roles inside the bundle, not blend them into one mixed narrative.

---

## 16. Packing and derived artifacts

Derived artifacts such as summaries and prior handoffs can be included in bundles, but they should not dominate without reason.

### Valid use cases
- continuity-first bundles
- session recovery
- cross-agent transfer
- strict-budget scenarios where summaries accelerate compactness

### Constraint
When derived artifacts are used heavily, the bundle should still preserve traceability to underlying source records.

### Rule

> Derived artifacts may accelerate packing, but should not erase canonical grounding.

---

## 17. Packing and uncertainty representation

The system should not present all packed context as equally certain.

### Uncertainty-aware packing
At minimum, the bundle model should allow:
- explicit uncertainty notes
- confidence markers
- conflict warnings
- stale-data caution notes

### Why this matters
A model should not mistake tentative or conflicting context for fully settled truth.

### Rule

> Packing should preserve uncertainty where uncertainty matters to correct execution.

---

## 18. Packing and target runtime adaptation

Packing itself should remain provider-neutral at the semantic level, but it should still be aware of downstream runtime constraints.

### Runtime-aware considerations
At minimum:
- token budget ceilings
- structured output expectations
- likely tool-usage pattern
- multi-turn continuation likelihood
- provider-specific formatting sensitivity

### Constraint
These considerations may influence section size and representation style, but they should not redefine the core semantics of the bundle.

### Rule

> Runtime awareness may shape bundle form, but not collapse bundle semantics into provider-specific assumptions.

---

## 19. Canonical pack loop data structures

The exact implementation may vary, but conceptually the pack loop should operate on the following structures:

### 19.1. Pack Input
Read-path output ready for packing.

### 19.2. Packing Strategy Result
Chosen strategy, section template, and budget model.

### 19.3. Section Plan
Ordered bundle section structure.

### 19.4. Section Assignment Map
Mapping of candidates to bundle sections.

### 19.5. Compression Result
Compressed or shaped content fragments with traceability.

### 19.6. Bundle Artifact
Final structured context bundle.

These are architectural concepts even if implementation class names differ.

---

## 20. Packing auditability

Packing decisions should remain inspectable.

### Audit-friendly outputs
At minimum, the system should be able to explain:
- why this packing strategy was chosen
- why some sections were included or omitted
- why some items were compressed more heavily
- why certain critical items were preserved verbatim
- which source records contributed to each section
- whether boundedness constraints forced omission or compression

### Rule

> Bundle packing should be explainable enough to diagnose context failures later.

---

## 21. Bundle reuse and regeneration

Bundles may be cached or reused in limited scenarios, but the architecture should treat them as derived artifacts.

### Reuse is acceptable when
- the task continuity remains stable
- freshness remains acceptable
- scope has not changed
- state has not materially shifted

### Regeneration is required when
- state changes significantly
- scope changes
- critical new records appear
- the target provider/runtime changes enough to affect structure

### Rule

> Bundles are reusable artifacts, not permanent truth surfaces.

---

## 22. Bundle packing failure modes

The architecture should explicitly guard against these failure modes:

### 22.1. Raw concatenation
Selected items are simply appended without structure.

### 22.2. Over-compression
Important distinctions disappear in the name of compactness.

### 22.3. Priority flattening
Critical and optional items receive the same representation weight.

### 22.4. State-memory blending
Active state and durable memory are merged into one incoherent section.

### 22.5. Summary domination
Derived summaries crowd out more relevant direct context.

### 22.6. Provider lock-in in semantics
Bundle design becomes shaped entirely around one provider’s formatting style.

### 22.7. No traceability
The final bundle cannot be traced back to its sources.

### 22.8. Unbounded section growth
One section absorbs too much material and destroys clarity.

---

## 23. Architectural invariants for the pack loop

The following must remain true across implementations:

### 23.1. Packing begins from selected candidates, not raw storage.
### 23.2. Packing strategy selection is explicit.
### 23.3. Section planning precedes final assembly.
### 23.4. Bundles remain typed derived artifacts.
### 23.5. Packing preserves semantic role distinctions.
### 23.6. Boundedness is section-aware.
### 23.7. Provider-specific formatting remains downstream.
### 23.8. Bundle generation remains auditable.

These invariants are central to system correctness.

---

## 24. Bundle packing summary

The pack loop should be understood as the system’s second operational intelligence loop.

It turns:
- a bounded selected candidate set,
- plus task/mode/runtime constraints,

into:
- a structured,
- bounded,
- traceable,
- task-shaped context bundle ready for provider/runtime execution.

Only after that should provider adaptation and concrete model invocation occur.

---

## 25. What this document enables next

Once packing is defined, the next architectural files become much more precise:

1. Write Path Architecture
2. Handoff Architecture
3. MCP and API Integration Architecture
4. Tool Contract Specification

This is because the system now knows how selected context becomes execution-ready context.

---

## 26. Final statement

Bundle packing is the architectural function that protects selected context from collapsing into noise before model execution.

Its quality determines whether the system delivers disciplined bounded context or merely reformats retrieved fragments into a prompt-shaped blob.
