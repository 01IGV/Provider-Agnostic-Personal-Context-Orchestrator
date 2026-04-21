# Policy and Governance Specification

## 0. Purpose of this document

This document defines the policy and governance specification of the Provider-Agnostic Personal Context Orchestrator.

Its role is to describe the control discipline that governs what context may be stored, exposed, updated, transferred, archived, merged, rejected, or explained.

This document answers questions such as:
- what governance means in this system;
- how policy differs from architecture and from storage behavior;
- how admissibility, visibility, retention, and conflict handling work;
- how governance applies across read, pack, write, and handoff;
- what decisions are mandatory before canonical mutation;
- how the system remains explainable, bounded, and trustworthy over time.

This is not the implementation plan for policy engines.
It is the canonical definition of **control authority over context behavior**.

---

## 1. Governance thesis

Governance is the layer that turns the orchestrator from a clever memory system into a disciplined context infrastructure layer.

### Canonical statement

> Governance is the authority that decides what the system is allowed to remember, show, transfer, preserve, suppress, merge, supersede, and explain.

Without governance, every other subsystem becomes easier to implement but far less trustworthy.

---

## 2. Policy vs governance

These terms must remain distinct.

### Policy
Policy is the explicit set of rules, constraints, thresholds, and admissibility conditions that govern context behavior.

### Governance
Governance is the broader control discipline that includes:
- policy definition;
- policy enforcement;
- decision authority;
- auditability;
- visibility control;
- lifecycle control;
- conflict handling;
- explainability.

### Canonical rule

> Policy is a mechanism inside governance. Governance is the larger authority model of the system.

---

## 3. Why governance must be first-class

This system is not merely retrieving data or storing memory.
It is making decisions about context authority.

Without a first-class governance layer, the system tends to drift into:
- memory pollution;
- silent context leakage across scopes;
- accidental provider-specific behavior;
- summary-over-truth substitution;
- uncontrolled duplication;
- contradictory records without resolution;
- opaque decisions the user or operator cannot inspect.

### Rule

> Governance must be an architectural zone, not a late-stage safety patch.

---

## 4. Governance scope across the system

Governance applies across all 4 operational contours:

### 4.1. Read governance
Controls what may be surfaced.

### 4.2. Pack governance
Controls how bounded context may be represented and how risk/uncertainty is preserved.

### 4.3. Write governance
Controls what may become canonical or derived records.

### 4.4. Handoff governance
Controls what continuity may be transferred across boundaries.

### Rule

> Governance is not write-only. It must constrain the entire context lifecycle.

---

## 5. Governance objectives

A strong governance layer should achieve at least these objectives:

1. preserve boundedness
2. preserve semantic correctness
3. prevent memory pollution
4. prevent state-memory confusion
5. enforce scope and visibility discipline
6. make conflict explicit and manageable
7. preserve provenance and explainability
8. support provider-neutral semantics
9. maintain continuity without uncontrolled accumulation

These objectives should guide all policy design.

---

## 6. Core governance domains

The governance layer should be organized around the following core domains:

1. **Admissibility Governance**
2. **Visibility Governance**
3. **Scope Governance**
4. **Retention and Lifecycle Governance**
5. **Conflict and Dedup Governance**
6. **Transfer Governance**
7. **Audit and Explainability Governance**
8. **Capability Governance**

These domains should remain conceptually distinct.

---

## 7. Admissibility governance

### Purpose
Decide whether a candidate, artifact, or context item is allowed to enter or remain active in the system.

### Admissibility applies to
- memory candidates
- state candidates
- summary refresh candidates
- handoff candidates
- read-time surface eligibility
- bundle inclusion eligibility

### Admissibility decision dimensions
At minimum:
- grounding and provenance quality
- relevance to scope
- confidence threshold
- importance threshold
- policy compatibility
- visibility safety
- structural validity
- non-triviality

### Canonical outcomes
At minimum:
- admissible
- reject_noise
- reject_invalid
- reject_policy
- reject_scope
- reject_low_confidence
- defer

### Rule

> Not every plausible context item is admissible. Governance must filter for quality and legitimacy.

---

## 8. Visibility governance

### Purpose
Determine who or what is allowed to see a record or derived artifact.

### Visibility applies to
- memory objects
- state objects
- summaries
- bundles
- handoff artifacts
- audit views

### Minimum visibility concepts
At minimum, the system should support concepts such as:
- private
- subject-scoped
- shared-agent
- workspace-visible
- system-internal
- restricted-derived

### Why this matters
The same record may be legitimate to store but not legitimate to expose broadly.

### Rule

> Visibility is not identical to admissibility. A record may be admissible yet only visible within narrow bounds.

---

## 9. Scope governance

### Purpose
Ensure that context is only read, written, or transferred within justified domain boundaries.

### Scope governance concerns
At minimum:
- allowed scope for read access
- allowed scope for write target
- cross-scope transfer restrictions
- scope inheritance rules
- scope narrowing on handoff
- scope widening prohibition unless explicitly justified

### Canonical rule

> Scope is a governance boundary, not just metadata.

---

## 10. Retention and lifecycle governance

### Purpose
Control how long records remain active, visible, durable, or transferable.

### Retention governance applies to
- memory objects
- state objects
- summaries
- handoffs
- bundles
- audit traces where policy requires it

### Lifecycle concerns
At minimum:
- when a record is active
- when it becomes tentative
- when it is superseded
- when it is archived
- when it is invalidated
- when it expires by TTL
- when a derived artifact must refresh or be discarded

### Rule

> Governance should shape record lifetime intentionally, not let persistence duration define meaning by accident.

---

## 11. Conflict and dedup governance

### Purpose
Control how the system handles duplicate, overlapping, or contradictory context.

### Conflict governance concerns
At minimum:
- duplicate detection policy
- near-duplicate merge policy
- contradictory preference policy
- superseded decision handling
- overlapping state resolution
- ambiguous continuity handling
- explicit uncertainty preservation

### Dedup governance concerns
At minimum:
- when to merge
- when to update existing
- when to preserve two records with qualifiers
- when to archive older versions

### Rule

> Governance should preserve continuity integrity, not just minimize record count.

---

## 12. Transfer governance

### Purpose
Control what continuity may be transferred across boundaries via handoffs or related artifacts.

### Transfer governance applies to
- session-to-session handoffs
- agent-to-agent handoffs
- workflow-step transfers
- provider/runtime transfers
- recovery artifacts

### Transfer governance concerns
At minimum:
- target-context legitimacy
- boundedness of transferred material
- visibility restrictions
- uncertainty inclusion requirements
- cross-scope transfer safety
- freshness requirements for transfer

### Rule

> Transfer is a governance-sensitive act because context can become less safe when it moves.

---

## 13. Audit and explainability governance

### Purpose
Ensure that major context decisions are reconstructible and inspectable.

### This governance domain applies to
- bundle selection decisions
- write decisions
- handoff generation decisions
- visibility restrictions
- policy rejections
- retention actions
- supersession and archival actions

### Explainability requirements
At minimum, the system should be able to explain:
- why this was shown
- why this was hidden
- why this was stored
- why this was rejected
- why this replaced or merged into something else
- why this handoff was created
- why this artifact expired or was archived

### Rule

> Governance must leave explanation trails, not only enforcement outcomes.

---

## 14. Capability governance

### Purpose
Determine which clients, runtimes, or actors may invoke which capabilities.

### Applies to
- read tools
- expansion tools
- write-candidate tools
- handoff tools
- audit tools
- policy inspection tools
- control-plane operations if introduced later

### Canonical principle
Clients should receive tool families according to capability class, not global maximum privilege.

### Rule

> Capability exposure is part of governance because interface power changes system risk.

---

## 15. Governance across operational contours

The governance layer must be applied differently across the 4 operational loops.

## 15.1. Read-time governance
Should decide:
- which scopes are open
- which records are visible
- which stale or low-confidence items are suppressed
- when risk or uncertainty notes must remain attached

## 15.2. Pack-time governance
Should decide:
- whether high-risk material may be included
- whether a section must preserve warnings explicitly
- whether boundedness rules require omission or compression
- whether provider/runtime shaping risks semantic distortion

## 15.3. Write-time governance
Should decide:
- whether a candidate is admissible
- whether it becomes memory, state, or neither
- whether it updates, merges, supersedes, archives, or is rejected
- what visibility and retention apply

## 15.4. Handoff-time governance
Should decide:
- whether a handoff is justified
- what transfer boundary it targets
- what continuity must be included
- what must be suppressed, bounded, or marked uncertain

### Rule

> Governance is contour-specific, even when core policy principles are shared.

---

## 16. Canonical governance decisions

The governance layer should produce explicit decision outcomes.

### Read-facing decision outcomes
At minimum:
- include
- include_with_warning
- exclude
- exclude_by_policy
- exclude_by_scope
- exclude_as_stale
- defer_to_manual_review (optional later)

### Write-facing decision outcomes
At minimum:
- accept_new
- update_existing
- merge_into_existing
- reject
- supersede_existing
- archive_existing_then_accept
- derive_only
- defer

### Handoff-facing decision outcomes
At minimum:
- create_handoff
- refresh_handoff
- reject_handoff
- create_handoff_with_warnings
- archive_handoff

### Rule

> Governance outcomes should be explicit enough to audit and reason about later.

---

## 17. Governance inputs

The governance layer should not decide from content alone.

### At minimum, governance decisions should consider
- subject
- scope
- owner
- actor and client identity
- candidate type
- confidence
- importance
- freshness
- source provenance
- existing conflicting records
- retention rules
- visibility rules
- target context type
- capability class of the caller

### Rule

> Governance should evaluate context as a typed, scoped, time-sensitive entity, not as raw text.

---

## 18. Governance outputs

The governance layer should produce structured outputs.

### At minimum, outputs should include
- decision outcome
- applied policy rules
- reasoning summary
- affected record IDs
- lifecycle changes
- visibility assignment
- retention assignment
- warnings or risk notes where relevant
- audit references

### Rule

> Governance output should be structured enough to drive canonical mutation and audit without reinterpreting the decision later.

---

## 19. Governance and policy record model

The system should be able to represent policy as first-class definable logic.

### Policy record should be able to express
- rule key
- rule type
- applicable scopes
- applicable record families
- decision thresholds
- status
- creation and update timestamps

### Decision record should capture
- what was evaluated
- what outcome was chosen
- what policies were applied
- who or what decided
- when it was decided

### Rule

> Governance should be modelable as records and outcomes, not only as hidden code branches.

---

## 20. Governance and boundedness

Boundedness is a governance concern, not only a packing concern.

### Governance should help decide
- whether too much context is being surfaced
- whether low-priority material should be suppressed
- whether a handoff is oversized
- whether write volume is inflating continuity noise
- whether bundle composition violates section discipline

### Rule

> Boundedness is part of trustworthiness because excess context is a form of governance failure.

---

## 21. Governance and uncertainty

The governance layer must not force false certainty.

### It should support
- explicit uncertainty markers
- conflict-preserving decisions
- low-confidence suppression
- inclusion with warning
- uncertainty-aware transfer rules

### Why this matters
A trustworthy context system must sometimes say:
- this may be wrong
- this is stale but possibly useful
- this conflicts with another record
- this transfer should preserve caution

### Rule

> Governance should preserve epistemic honesty, not just cleanliness.

---

## 22. Governance and provider neutrality

Governance must not change semantics based on provider quirks.

### What may vary by provider/runtime
- transport shape
- structured output richness
- host capability model
- runtime constraints

### What must not vary
- what counts as memory vs state
- what admissibility means
- what supersession means
- what visibility means
- what handoff legitimacy means

### Rule

> Governance semantics must remain stable even when clients and providers vary.

---

## 23. Governance and manual review

The full system may later support human-in-the-loop or operator review paths.

### Even if not mandatory at first, governance should conceptually allow
- defer decisions
- mark for review
- preserve candidate plus reason for deferment
- expose explainable unresolved governance states

### Rule

> A strong governance model should allow uncertainty and deferment instead of forcing weak automatic decisions everywhere.

---

## 24. Governance failure modes

The architecture should explicitly guard against these failure modes:

### 24.1. Governance bypass
Some path writes, reads, or transfers context without passing through rules.

### 24.2. Scope collapse
Context crosses domains because scope is treated as optional metadata.

### 24.3. Silent visibility leakage
Records are surfaced more broadly than justified.

### 24.4. Memory pollution
Weak admissibility lets low-value records accumulate.

### 24.5. State-memory corruption
Operational state becomes durable memory or vice versa without rule discipline.

### 24.6. Conflict blindness
Contradictory context coexists without explicit handling.

### 24.7. Summary substitution
Derived artifacts become substitutes for canonical governance decisions.

### 24.8. Provider-shaped policy
One host’s conventions redefine core rules.

### 24.9. Opaque enforcement
The system applies rules but cannot explain them.

---

## 25. Governance invariants

The following must remain true across implementations:

### 25.1. Governance is mandatory for canonical mutation.
### 25.2. Governance applies across read, pack, write, and handoff.
### 25.3. Scope is enforced as a real boundary.
### 25.4. Visibility is explicit, not implicit.
### 25.5. Memory and state remain governed separately.
### 25.6. Conflict and dedup are first-class governance functions.
### 25.7. Transfer is governance-sensitive.
### 25.8. Governance decisions remain auditable and explainable.
### 25.9. Governance semantics remain provider-neutral.

These invariants are central to the system’s trust model.

---

## 26. Governance summary

The governance layer should be understood as the system’s control authority over context.

It turns:
- candidate proposals,
- selected context,
- visibility needs,
- retention and lifecycle rules,
- transfer situations,

into:
- admissible vs inadmissible outcomes,
- explicit visibility boundaries,
- lifecycle assignments,
- dedup and conflict decisions,
- bounded transfer decisions,
- auditable system behavior.

This is what prevents the orchestrator from becoming an uncontrolled context accumulator.

---

## 27. What this document enables next

Once policy and governance are defined, the next governance and execution-adjacent files become much more precise:

1. Audit and Evaluation Specification
2. Provider Adapter Architecture
3. Implementation Decomposition for Coding Agent

This is because the control authority of the system is now explicit.

---

## 28. Final statement

Policy and governance are the system’s context authority model.

Their quality determines whether the orchestrator can be trusted as a real provider-agnostic context infrastructure layer or whether it collapses into a technically impressive but weakly controlled memory machine.
