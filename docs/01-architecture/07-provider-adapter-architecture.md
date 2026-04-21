# Provider Adapter Architecture

## 0. Purpose of this document

This document defines the provider adapter architecture of the Provider-Agnostic Personal Context Orchestrator.

Its role is to describe how the system remains semantically stable while interacting with different model providers, runtime environments, tool-calling patterns, and host execution constraints.

This document answers questions such as:
- why provider adapters must exist as an explicit architectural layer;
- what provider adapters are responsible for and what they must not absorb;
- how canonical bundle, write, handoff, and governance semantics survive across providers;
- how host/runtime differences are isolated at the system edge;
- how provider-specific shaping is allowed without corrupting the core system model.

This is not a prompt-format cheat sheet.
It is the canonical architecture for **provider-specific adaptation without semantic lock-in**.

---

## 1. Provider adapter thesis

Provider adapters are the architectural layer that protects the core orchestrator from semantic contamination by provider-specific execution patterns.

### Canonical statement

> Provider adapters should translate between canonical orchestrator semantics and provider/runtime-specific execution requirements without redefining the meaning of memory, state, bundle, handoff, policy, or audit.

This means provider adaptation is necessary, but it must remain downstream of the core system model.

---

## 2. Why provider adapters must be first-class

This system is explicitly intended to be provider-agnostic.
That promise cannot hold if provider differences are handled ad hoc throughout the codebase.

Without a dedicated provider adapter layer, the system tends to drift into:
- provider-shaped bundle semantics;
- provider-shaped writeback assumptions;
- provider-specific handoff meanings;
- host-specific tool behavior hidden inside core logic;
- growing fragmentation across clients and runtimes.

### Rule

> Provider specificity should be isolated, not diffused across the system.

---

## 3. What counts as a provider/runtime difference

The system must anticipate real variation at the execution edge.

### Typical differences include
- tool-calling format and strictness;
- structured output expectations;
- context window size and behavior;
- runtime-specific message structure;
- multi-turn execution assumptions;
- tool discoverability behavior;
- system-vs-user message semantics;
- resource loading behavior;
- response shape richness;
- streaming behavior;
- host-driven MCP quirks.

These differences are real, but they must remain edge concerns.

---

## 4. What provider adapters are responsible for

The provider adapter layer should own the following responsibilities:

### 4.1. Bundle projection
Translate canonical bundle artifacts into provider/runtime-specific execution surfaces.

### 4.2. Tool surface projection
Expose canonical tool contracts in provider/runtime-compatible form.

### 4.3. Output normalization
Transform provider/runtime-specific outputs back into canonical internal writeback envelopes.

### 4.4. Runtime constraint alignment
Respect provider constraints such as token budgets, schema style, or formatting needs.

### 4.5. Capability compatibility mapping
Map platform capabilities into what a given provider/runtime can actually support.

### 4.6. Error normalization
Translate provider/runtime failures into canonical system-facing error families where possible.

### Rule

> Provider adapters should translate execution mechanics, not redefine system meaning.

---

## 5. What provider adapters must not absorb

The provider adapter layer must not become a shadow orchestrator.

### It must not absorb
- canonical read-path logic;
- canonical write governance;
- memory vs state decisions;
- handoff meaning;
- policy semantics;
- audit and evaluation authority;
- canonical entity model;
- bundle semantic structure.

### Rule

> Provider adapters are edge translators, not alternate cores.

---

## 6. Architectural place of provider adapters

The provider adapter layer sits between:
- the canonical pack/tool/integration outputs of the orchestrator,
- and the concrete execution behavior of a provider/host/runtime.

### Architectural placement
- external client or host
- MCP/API integration layer
- tool contract semantics
- core orchestrator
- provider adapter layer
- provider/runtime execution environment

Or, from the opposite direction:
- provider/runtime output
- provider adapter normalization
- canonical writeback envelope
- write governance

### Rule

> Provider adapters are part of the execution edge, not part of canonical context reasoning.

---

## 7. Canonical provider adapter responsibilities by contour

The adapter layer must preserve the contours already defined by the system.

## 7.1. Read-related responsibility
Adapters may receive bundle requests or context expansion requests, but must not change read semantics.

## 7.2. Pack-related responsibility
Adapters may reshape bundle projection for a provider, but must not redefine bundle meaning.

## 7.3. Write-related responsibility
Adapters may normalize output and candidate submission shape, but must not bypass write-time governance.

## 7.4. Handoff-related responsibility
Adapters may project handoffs into provider-usable forms, but must not redefine handoff as generic summary or provider-specific prompt convention.

### Rule

> Adapters may reshape contour delivery, but not contour meaning.

---

## 8. Canonical adapter stages

A provider adapter should be understood as operating in 6 stages:

1. **Capability profile detection**
2. **Canonical-to-provider projection planning**
3. **Bundle and tool projection**
4. **Execution-surface assembly**
5. **Provider output normalization**
6. **Canonical writeback envelope creation**

These stages should remain distinct.

---

## 9. Stage 1 — Capability profile detection

### Purpose
Determine what the target provider/runtime can and cannot support.

### Capability profile dimensions
At minimum:
- tool-call support
- structured output support
- max practical context window assumptions
- runtime message model
- host-specific MCP support surface
- response schema tolerance
- multi-step interaction behavior
- explicit resource support if applicable

### Output
At minimum:
- `provider_profile`
- `runtime_profile`
- `capability_flags`
- `constraint_flags`

### Rule

> Projection should begin from explicit capability knowledge, not assumption.

---

## 10. Stage 2 — Canonical-to-provider projection planning

### Purpose
Choose how canonical system artifacts will be projected into the target runtime.

### Inputs
- canonical bundle artifact
- tool contract set
- target provider/runtime profile
- budget constraints
- execution mode

### Planning outputs
At minimum:
- projection strategy
- message/envelope strategy
- tool exposure strategy
- output normalization strategy
- runtime-specific risk notes

### Rule

> Projection strategy should be explicit and provider-aware, not hardcoded implicitly into bundle generation.

---

## 11. Stage 3 — Bundle and tool projection

### Purpose
Transform canonical bundles and tool contracts into provider-specific execution forms.

### Bundle projection may involve
- section ordering adjustments;
- representation style changes;
- envelope nesting differences;
- schema wrapping;
- tool hint placement;
- runtime-specific compactness adjustments.

### Tool projection may involve
- parameter schema style adjustments;
- explicit tool registration shape;
- naming projection rules where necessary;
- output schema wrapping;
- capability-based omission of unsupported tools.

### Constraint
Projection must preserve:
- bundle purpose;
- section semantics;
- handoff semantics;
- candidate semantics;
- governance expectations.

### Rule

> Projection may alter external form, but must preserve internal meaning.

---

## 12. Stage 4 — Execution-surface assembly

### Purpose
Assemble the exact provider/runtime invocation surface from projected artifacts.

### May include
- runtime message envelopes;
- provider-specific tool registration blocks;
- canonical bundle rendered into the provider’s expected structure;
- execution metadata required by the host;
- runtime control hints.

### Important distinction
This stage is downstream of canonical pack logic.
It must not become a substitute for the pack loop.

### Rule

> Execution-surface assembly is adapter work, not canonical bundle design.

---

## 13. Stage 5 — Provider output normalization

### Purpose
Normalize provider/runtime outputs into canonical system-facing result structures.

### Why this matters
Different providers may express:
- tool calls differently;
- structured outputs differently;
- text and metadata differently;
- error situations differently.

### Normalization outputs
At minimum:
- normalized result envelope
- canonical tool invocation events
- canonical writeback signal inputs
- canonical error family mapping
- provider metadata attachment where useful

### Rule

> Provider output should be normalized before it reaches canonical write/governance logic.

---

## 14. Stage 6 — Canonical writeback envelope creation

### Purpose
Convert normalized provider output into the canonical writeback envelope used by the write path.

### Must preserve
- subject and scope linkage
- source invocation identity
- source provider/runtime metadata
- source event references
- raw output payload linkage
- candidate extraction starting point

### Rule

> Write governance should receive canonical envelopes, not provider-specific output fragments.

---

## 15. Provider profile model

The system should conceptually support a provider/runtime profile model.

### A provider profile should capture at minimum
- provider family
- runtime or host type
- supported interaction modes
- schema strictness characteristics
- bundle-size sensitivities
- tool invocation constraints
- resource support characteristics if relevant
- structured output characteristics
- normalization requirements

### Why this matters
A provider adapter should reason from declared capabilities, not scattered conditional logic.

### Rule

> Provider knowledge should be representable as explicit profiles, not hidden assumptions.

---

## 16. Canonical vs projected bundle distinction

This distinction must remain explicit.

### Canonical bundle
The derived artifact produced by the pack loop with stable platform semantics.

### Projected bundle
The provider-specific execution-oriented representation of the canonical bundle.

### Why this matters
If projected bundles replace canonical bundles conceptually, provider lock-in leaks inward.

### Rule

> Canonical bundle meaning is stable. Projected bundle form is adapter-specific.

---

## 17. Canonical vs projected tool distinction

This distinction must remain explicit as well.

### Canonical tool contract
The stable semantic definition of an operation.

### Projected tool form
The provider/runtime-specific registration and invocation form used by the host.

### Rule

> Tool meaning lives in the contract layer. Tool shape lives in the adapter layer.

---

## 18. Provider adapters and governance

Provider adapters must not become governance loopholes.

### Governance-related adapter rules
At minimum:
- no provider-specific direct canonical writes;
- no bypass of candidate extraction;
- no redefinition of admissibility;
- no hidden visibility widening;
- no provider-specific reclassification of memory vs state;
- no handoff semantic drift.

### Rule

> Provider adapters must remain downstream of governance authority.

---

## 19. Provider adapters and audit

Adapter behavior should remain auditable.

### Adapter audit should capture at minimum
- provider/runtime profile used;
- projection strategy chosen;
- important projection adjustments;
- normalization strategy applied;
- provider-specific error mappings where relevant;
- semantic preservation warnings if any.

### Why this matters
A system can appear provider-neutral while drifting silently at the adapter layer.

### Rule

> Provider neutrality must be auditable at the adapter layer, not only asserted conceptually.

---

## 20. Provider adapters and evaluation

Adapter behavior should be evaluable across providers and runtimes.

### Relevant evaluation concerns
At minimum:
- cross-provider semantic drift
- projected bundle stability
- tool behavior consistency
- writeback normalization stability
- handoff projection consistency
- error normalization quality

### Rule

> Provider adapters should be evaluated for semantic stability, not only basic compatibility.

---

## 21. Provider adapters and MCP hosts

Some providers or hosts may be reached through MCP-like capability surfaces.

### Adapter concerns here include
- tool discovery differences
- host-specific MCP capability support
- resource exposure differences
- host-mediated tool-calling quirks
- prompt-support artifact handling

### Constraint
These host differences should still remain outside core tool meaning and core data semantics.

### Rule

> Host-specific MCP behavior is an adapter concern, not a reason to alter canonical contracts.

---

## 22. Provider adapters and direct API consumers

Some consumers will use direct API instead of model-host tool interaction.

### Adapter concerns here include
- API output shaping for provider-specific execution preparation
- normalized result parsing from downstream provider calls where the platform intermediates execution
- preservation of canonical response semantics despite provider-specific execution internals

### Rule

> API consumers should receive canonical semantics even when provider-specific execution happens behind the scenes.

---

## 23. Provider adapters and runtime constraints

Runtime constraints are real, but they should influence projection rather than corrupting semantics.

### Constraints may include
- tighter practical context budgets
- stricter schema forms
- limited tool support
- limited structured response reliability
- multi-turn instability

### Architectural response
The adapter may:
- adjust projection strategy;
- simplify projected representation;
- omit unsupported capabilities from projected tool exposure;
- require additional normalization logic.

But it must not:
- change what a bundle is;
- change what a candidate is;
- change what governance means.

### Rule

> Constraints justify adaptation, not semantic compromise.

---

## 24. Canonical adapter data structures

The exact implementation may vary, but conceptually the adapter layer should operate on the following structures:

### 24.1. Provider Profile
Declared capabilities and constraints.

### 24.2. Projection Plan
How canonical artifacts will be mapped outward.

### 24.3. Projected Bundle
Provider/runtime-specific representation of a canonical bundle.

### 24.4. Projected Tool Surface
Provider/runtime-specific representation of canonical tools.

### 24.5. Normalized Output Envelope
Provider result normalized back into system form.

### 24.6. Canonical Writeback Envelope
The final canonical input to the write path.

These are architectural concepts even if implementation names differ.

---

## 25. Provider adapter failure modes

The architecture should explicitly guard against these failure modes:

### 25.1. Semantic leakage
Provider-specific behavior changes bundle or memory meaning.

### 25.2. Adapter sprawl
Provider-specific conditionals spread across the core system instead of remaining isolated.

### 25.3. Projection replacing packing
Bundle meaning is effectively designed inside adapters rather than in the canonical pack loop.

### 25.4. Tool meaning drift
The same tool contract behaves differently in meaningful ways across providers.

### 25.5. Writeback corruption
Provider outputs reach write governance without proper normalization.

### 25.6. Governance bypass
Some provider path allows direct mutation or visibility leakage.

### 25.7. Host lock-in
One host/runtime becomes the de facto canonical mental model of the system.

### 25.8. Opaque adaptation
Projection or normalization decisions are too hidden to audit or evaluate.

---

## 26. Architectural invariants for provider adapters

The following must remain true across implementations:

### 26.1. Provider adapters are edge translators, not alternate orchestrators.
### 26.2. Canonical bundle semantics remain upstream of projection.
### 26.3. Canonical tool semantics remain upstream of projection.
### 26.4. Provider outputs are normalized before write governance.
### 26.5. Governance semantics remain provider-neutral.
### 26.6. Adapter behavior remains auditable.
### 26.7. Cross-provider semantic drift remains evaluable.
### 26.8. Provider-specific logic remains isolated from the core system model.

These invariants are central to the system’s provider-agnostic promise.

---

## 27. Provider adapter summary

The provider adapter layer should be understood as the system’s semantic shield at the execution edge.

It turns:
- canonical bundles,
- canonical tool contracts,
- canonical system outputs,

into:
- provider/runtime-specific execution surfaces,
- provider/runtime-specific interaction forms,
- normalized canonical writeback inputs.

This is what allows the orchestrator to serve many model environments while still remaining one coherent system.

---

## 28. What this document enables next

Once provider adapter architecture is defined, the next implementation-facing documents become much more grounded:

1. Implementation Decomposition for Coding Agent
2. Future deployment model documentation
3. Future control-plane or operational runtime documentation if needed

This is because the full architecture now has a clear provider-agnostic execution edge.

---

## 29. Final statement

Provider adapters are the architectural layer that makes provider-agnosticism operational rather than rhetorical.

Their quality determines whether the orchestrator remains a stable context infrastructure layer across hosts and runtimes, or whether provider-specific behavior quietly becomes the true system design.
