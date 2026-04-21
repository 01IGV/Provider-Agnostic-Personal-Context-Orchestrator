# Write Path Architecture

## 0. Purpose of this document

This document defines the write path architecture of the Provider-Agnostic Personal Context Orchestrator.

Its role is to describe how the system receives post-execution signals, evaluates candidate records, applies governance, and decides what becomes canonical memory, canonical state, derived artifacts, or nothing at all.

This document answers questions such as:
- how new information enters the system after execution;
- how the model is allowed to propose memory or state changes;
- how write candidates are validated and routed;
- how memory is distinguished from state;
- how deduplication, conflict handling, retention, and policy shape write decisions;
- how canonical records are created, updated, rejected, or superseded.

This is not the read document and not the handoff document.
It is specifically about **governed writeback into the system**.

---

## 1. Write path thesis

The write path is the controlled process by which observed signals become governed system records.

### Canonical statement

> The write path must not be direct model-to-memory writing. It must be a governed candidate-to-decision-to-record pipeline.

This is what prevents the system from degrading into noisy uncontrolled accumulation.

---

## 2. Write path place in the overall architecture

In the full system loop, the write path begins after a model or runtime has produced outputs and/or tool actions, and ends when canonical records and derived continuity surfaces are updated.

### Position in the canonical execution loop
1. model execution completes
2. post-execution signals are collected
3. write candidates are produced
4. write candidates are validated
5. governance decisions are applied
6. canonical or derived records are created/updated/rejected
7. audit and continuity surfaces are refreshed

The write path owns steps 2 through 7.

---

## 3. High-level write path stages

The write path should be understood as 8 stages:

1. **Post-execution signal intake**
2. **Candidate generation**
3. **Candidate normalization**
4. **Candidate classification and routing**
5. **Eligibility validation**
6. **Governance decisioning**
7. **Canonical mutation or derived artifact update**
8. **Audit and continuity update**

These stages should remain conceptually distinct.

---

## 4. Stage 1 — Post-execution signal intake

### Purpose
Capture relevant signals produced during or after model execution.

### Signal sources
The write path may receive signals from:
- model output
- model tool calls
- explicit memory candidate tools
- explicit state update tools
- workflow transitions
- external client actions
- system-generated events
- handoff creation flows
- summary refresh triggers

### Intake output
At minimum, intake should produce a normalized write signal envelope containing:
- `write_signal_id`
- `request_id`
- `client_id`
- `subject_id`
- `session_id` (nullable)
- `workflow_id` (nullable)
- `source_event_ids`
- `source_actor_type`
- `source_actor_id` (nullable)
- `raw_signal_payload`
- `signal_timestamp`
- `runtime_metadata` (nullable)

### Rule

> The write path must begin from normalized post-execution signals, not from ad hoc parsing directly into storage.

---

## 5. Stage 2 — Candidate generation

### Purpose
Turn write signals into structured candidates.

### Why this matters
The system should not treat raw output text as storage-ready truth.
It must first become a candidate proposal.

### Candidate families
At minimum, the system should support:
- `memory_candidate`
- `state_candidate`
- `handoff_candidate`
- `summary_candidate`
- `audit_candidate` (optional internal path)
- `no_write_candidate` as an explicit valid outcome

### Candidate generation sources
Candidates may come from:
- model-proposed structured tool calls
- explicit client API calls
- system-generated heuristic extraction
- workflow engine transitions
- governance-triggered refresh logic

### Rule

> Candidate generation is where possible write intent becomes structured, but not yet accepted.

---

## 6. Stage 3 — Candidate normalization

### Purpose
Convert proposed write candidates into canonical internal candidate shapes.

### Minimum normalized candidate fields
At minimum:
- `candidate_id`
- `candidate_type`
- `proposed_record_type`
- `subject_id`
- `owner_id` (nullable)
- `scope_id`
- `content`
- `proposed_metadata`
- `source_event_ids`
- `proposed_by_actor_type`
- `proposed_by_actor_id` (nullable)
- `submitted_at`
- `why_store` (nullable)
- `status`

### Rule

> The system should normalize candidate structure before classification and validation logic begins.

---

## 7. Stage 4 — Candidate classification and routing

### Purpose
Decide what kind of system action the candidate implies.

### Why this matters
Not every candidate should go through the same write logic.
Memory, state, summaries, and handoffs have different semantics and different lifecycles.

### Routing questions
At minimum, the write path should ask:
- is this durable memory or active state?
- is this a new record or an update to existing context?
- is this a handoff artifact request?
- is this only a derived artifact refresh?
- is this insufficiently grounded and therefore rejectable?

### Canonical route outputs
At minimum:
- `route_family`
- `candidate_semantic_type`
- `candidate_priority`
- `expected_target_entity_type`
- `requires_conflict_check`
- `requires_dedup_check`
- `requires_policy_review`

### Rule

> The write path must classify before mutating. Wrong classification is one of the fastest ways to corrupt continuity.

---

## 8. Stage 5 — Eligibility validation

### Purpose
Filter out candidates that should not proceed into governance decisions.

### Validation dimensions
At minimum, eligibility validation should consider:
- missing subject/scope identity
- malformed candidate structure
- empty or trivial content
- low grounding or source absence
- policy-incompatible write attempts
- scope mismatch
- invalid status transitions
- obviously duplicate proposals
- stale post-execution signals
- prohibited record types for the invoking client/runtime

### Validation outputs
At minimum:
- `valid_candidates`
- `invalid_candidates`
- `validation_reasons`

### Rule

> The write path must reject structurally or semantically weak candidates early, before they pollute governance and storage logic.

---

## 9. Stage 6 — Governance decisioning

### Purpose
Apply the system’s canonical authority over whether and how a valid candidate becomes part of the platform.

### Decision outcomes
At minimum, governance must support:
- `accept_new`
- `update_existing`
- `merge_into_existing`
- `reject`
- `archive_existing_and_replace`
- `defer`
- `derive_only`

### Governance decision dimensions
At minimum:
- memory vs state correctness
- duplicate detection
- conflict detection
- confidence adequacy
- importance threshold
- freshness and timeliness
- visibility and access policy
- retention and TTL rules
- scope appropriateness
- whether this is durable enough to preserve

### Canonical output
At minimum, decisioning should produce a decision record containing:
- `decision_id`
- `candidate_id`
- `decision_outcome`
- `target_record_id` (nullable)
- `applied_policy_rules`
- `reasoning_summary`
- `decided_at`
- `decided_by_actor_type`
- `decided_by_actor_id` (nullable)

### Rule

> Governance is the canonical write authority of the system.

---

## 10. Stage 7 — Canonical mutation or derived artifact update

### Purpose
Execute the approved result of governance decisioning.

### Mutation paths
At minimum, the system should support:
- create new memory object
- update existing memory object
- merge into existing memory object
- create new state object
- update existing state object
- supersede existing record
- archive existing record
- generate or refresh summary artifact
- generate or refresh handoff artifact
- record a no-op with audit trace

### Important distinction
Not every accepted candidate leads to a new canonical record.
Some accepted outcomes may mean:
- update an existing record;
- merge into an existing record;
- only refresh a derived artifact.

### Rule

> The write path should mutate the system with semantic precision, not with “always create a new record” behavior.

---

## 11. Stage 8 — Audit and continuity update

### Purpose
Preserve explainability and refresh future continuity surfaces.

### Outputs of this stage
At minimum:
- audit records
- event log updates
- continuity summary refresh triggers
- handoff refresh triggers
- affected bundle invalidation or refresh hints
- retention review hints where appropriate

### Rule

> Every meaningful write decision should leave a trace that future debugging and continuity reconstruction can rely on.

---

## 12. Canonical write path data structures

The exact implementation may vary, but conceptually the write path should operate on the following structures:

### 12.1. Write Signal Envelope
Normalized post-execution input.

### 12.2. Candidate Record
Structured proposed record or action.

### 12.3. Validation Result
Eligibility screening output.

### 12.4. Routing Result
Semantic and entity-family routing output.

### 12.5. Decision Record
Governance outcome.

### 12.6. Mutation Plan
Operational plan for canonical mutation or derived updates.

### 12.7. Write Result
Final structured result of the write path.

These are architectural concepts even if implementation names differ.

---

## 13. Write path interaction with the model

The model must remain a participant, not the authority.

### The model may
- propose memory candidates
- propose state updates
- propose handoff candidates
- provide justification fields such as `why_store`

### The model must not
- write canonical memory directly
- update canonical state directly
- silently bypass governance
- decide retention and visibility rules by itself

### Rule

> The model proposes. The orchestrator decides. Storage executes.

---

## 14. Memory vs state decision logic

One of the most important write-path responsibilities is deciding whether a candidate belongs in memory, state, both, or neither.

### Durable memory indicators
Examples:
- stable preference
- durable fact
- reusable constraint
- accepted decision
- long-lived goal
- repeated user signal with likely future reuse

### State indicators
Examples:
- currently active step
- pending question
- waiting state
- blocked branch
- draft in progress
- active workflow condition

### Mixed cases
Some candidates may:
- update active state now;
- later contribute to durable memory;
- trigger summary or handoff refresh.

### Rule

> The write path must explicitly classify durable continuity separately from active progression.

---

## 15. Deduplication and merge logic

A strong write path must prevent memory inflation through repetition.

### Deduplication questions
At minimum:
- is this candidate materially equivalent to an existing record?
- is this an updated version of an existing record?
- is this a restatement with no additional value?
- should the record be merged rather than duplicated?

### Merge behavior
Merge should preserve:
- provenance
- version awareness
- confidence updates
- updated timestamps
- supersession logic where needed

### Rule

> The write path should reward continuity through consolidation, not through record multiplication.

---

## 16. Conflict handling

Conflict is a normal write-path condition, not an edge case.

### Common conflict situations
- changed preference
- contradictory constraints
- superseded decision
- overlapping active states
- conflicting workflow interpretations

### Required write-path behavior
At minimum, the system should be able to:
- reject a conflicting candidate
- mark an existing record as superseded
- preserve both records with conflict markers
- escalate uncertainty into explicit notes
- create a derived warning without forcing immediate destructive overwrite

### Rule

> Conflict handling should preserve continuity integrity, not force naive last-write-wins behavior everywhere.

---

## 17. Retention and TTL handling

Retention is part of write architecture, not an afterthought.

### Why
At write time, the system is best positioned to assign:
- expected durability
- visibility
- TTL
- archival path
- refresh expectations

### Retention-aware write logic
At minimum, the write path should support:
- no TTL for durable records when appropriate
- bounded TTL for transient state
- archival transition rules
- expiration metadata for derived artifacts
- optional review triggers for aging records

### Rule

> A record’s lifecycle should be shaped at write time, not only after it already pollutes the system.

---

## 18. Write path and summaries

Summaries should not be treated as the primary write destination.

### Correct role of summaries in write logic
Summaries may be:
- refreshed because canonical memory/state changed
- updated when continuity compression is useful
- regenerated when handoff or session recovery needs improve

### Constraint
The write path should prefer canonical memory/state mutation first, and summary refresh second.

### Rule

> Summaries are downstream continuity aids, not the main durable write surface.

---

## 19. Write path and handoff generation

Writeback sometimes implies that continuity transfer artifacts should be refreshed.

### Example triggers
- major state transition
- accepted decision
- workflow checkpoint reached
- cross-agent continuation expected
- session end with unresolved open loops

### Rule

> Handoff generation may be triggered by writes, but handoff artifacts remain their own derived family.

---

## 20. Write-time governance

Governance in the write path is broader than validation.

### Governance concerns
At minimum:
- admissibility
- visibility
- scope correctness
- conflict policy
- retention and archival
- deduplication behavior
- trustworthiness threshold
- actor permissions
- client/runtime authorization to propose certain record families

### Architectural rule

> No write should become canonical unless governance explicitly permits the mutation path.

---

## 21. Write path outputs for auditability

The write path should remain inspectable.

### Audit-friendly outputs
At minimum, the system should be able to explain:
- what write signals were received
- which candidates were produced
- which candidates were rejected before governance and why
- which policy rules were applied
- why a record was accepted, merged, updated, rejected, or archived
- whether summaries or handoffs were refreshed as downstream effects

### Rule

> Write decisions should be reviewable after the fact, not buried in hidden mutations.

---

## 22. Write path failure modes

The architecture should explicitly guard against these failure modes:

### 22.1. Direct model-to-memory writes
The model writes canonical records without governance.

### 22.2. Memory inflation
Every similar signal becomes a new memory record.

### 22.3. State-memory confusion
Temporary operational facts get preserved as durable memory or vice versa.

### 22.4. Naive overwrite behavior
New signals destroy useful historical context without supersession or audit.

### 22.5. Conflict blindness
Contradictory records are stored side by side without detection.

### 22.6. Summary-first writing
The system writes mostly summaries and loses canonical granularity.

### 22.7. Weak provenance
New canonical records cannot be traced back to source events or candidate decisions.

### 22.8. Governance bypass via tools or runtimes
Some clients obtain write shortcuts that bypass core rules.

---

## 23. Architectural invariants for the write path

The following must remain true across implementations:

### 23.1. The write path begins from normalized post-execution signals.
### 23.2. All write intent becomes a candidate before governance.
### 23.3. Candidate classification precedes canonical mutation.
### 23.4. Memory and state remain distinct write families.
### 23.5. Deduplication and conflict handling are first-class functions.
### 23.6. Canonical writes cannot bypass governance.
### 23.7. Summaries and handoffs remain downstream or parallel derived artifacts.
### 23.8. Write decisions remain auditable.

These invariants are central to the system’s trustworthiness.

---

## 24. Write path summary

The write path should be understood as the system’s third operational intelligence loop.

It turns:
- post-execution signals,
- plus structured candidate proposals,
- plus governance rules,

into:
- canonical memory mutations,
- canonical state mutations,
- derived continuity updates,
- or explicit rejection.

This is the loop that determines whether the platform remains coherent over time.

---

## 25. What this document enables next

Once the write path is defined, the next architectural files become much more precise:

1. Handoff Architecture
2. MCP and API Integration Architecture
3. Tool Contract Specification
4. Policy and Governance Specification

This is because the system now knows how new context enters canonical continuity.

---

## 26. Final statement

The write path is the architectural function that turns observed interaction into governed continuity.

Its quality determines whether the system becomes a disciplined context infrastructure layer or an untrusted accumulation of model-generated fragments.
