# Handoff Architecture

## 0. Purpose of this document

This document defines the handoff architecture of the Provider-Agnostic Personal Context Orchestrator.

Its role is to describe how the system preserves and transfers continuity across execution boundaries.

This document answers questions such as:
- what a handoff is in this system;
- when a handoff should be created;
- what belongs in a handoff artifact;
- how handoff differs from memory, state, and summary;
- how handoffs remain bounded, portable, and traceable;
- how the system supports session-to-session, agent-to-agent, workflow-step, and provider/runtime transitions.

This is not the read document and not the writeback document.
It is specifically about **explicit continuity transfer across boundaries**.

---

## 1. Handoff thesis

Handoff is the architectural function that makes continuity survive change of context.

### Canonical statement

> A handoff is not “remembering everything later.” It is the explicit creation of a bounded portability artifact for continuity transfer.

This means handoff is a first-class system function, not a side effect of summaries or chat history.

---

## 2. Handoff place in the overall architecture

In the full system loop, handoff sits beside the write path and continuity layer.
It can be triggered by execution outcomes, workflow transitions, session endings, or explicit transfer requests.

### Position in the canonical execution loop
1. execution produces new state or decisions
2. write path updates canonical records
3. handoff engine detects continuity-transfer need
4. handoff candidate is assembled
5. governance validates handoff creation
6. handoff artifact is created or refreshed
7. future session/agent/runtime can consume it

Handoff depends on read, packing, and write, but is not reducible to any of them.

---

## 3. Why handoff must be its own subsystem

Without a dedicated handoff function, systems usually fall back to weaker patterns:
- replaying long chat history;
- relying only on summaries;
- depending on implicit session memory;
- forcing the next agent to reconstruct state from raw artifacts.

A dedicated handoff subsystem exists because continuity transfer requires:
- explicit boundedness;
- explicit recipient context;
- explicit scope;
- explicit portability;
- explicit traceability.

### Rule

> Handoff exists because continuity transfer is a different problem from storage and retrieval.

---

## 4. What a handoff is and is not

### A handoff is
- a bounded transfer artifact;
- a continuity bridge;
- a typed derived object;
- a scoped and traceable summary of what must survive into the next execution context.

### A handoff is not
- the full session history;
- the full memory store;
- a generic summary with no target context;
- a provider-specific prompt fragment masquerading as architecture.

### Rule

> Handoff is targeted continuity transfer, not archival recall.

---

## 5. Handoff boundaries

Handoff should be used whenever continuity must cross a meaningful boundary.

### Canonical boundary types
At minimum:
- session -> session
- agent -> agent
- workflow step -> workflow step
- runtime -> runtime
- provider -> provider
- user pause -> later recovery

### Why this matters
A handoff is not needed for every turn.
It is needed when the next execution context should not have to reconstruct everything from scratch.

---

## 6. High-level handoff stages

The handoff subsystem should be understood as 7 stages:

1. **Handoff trigger detection**
2. **Handoff target and boundary identification**
3. **Continuity candidate selection**
4. **Handoff shaping and bounded packaging**
5. **Handoff governance and validation**
6. **Handoff artifact creation or refresh**
7. **Handoff consumption by the next context**

These stages should remain conceptually distinct.

---

## 7. Stage 1 — Handoff trigger detection

### Purpose
Determine whether a continuity transfer artifact should be created.

### Trigger examples
At minimum:
- session ending while work remains active
- workflow checkpoint reached
- explicit transfer to another agent
- cross-provider continuation expected
- model execution completed but unresolved open loops remain
- significant accepted decision changes downstream work
- state branch changes materially
- user pauses and later restart is likely

### Trigger outputs
At minimum:
- `handoff_trigger_type`
- `trigger_source_record_ids`
- `continuity_reason`
- `priority`

### Rule

> Handoff creation should be triggered by continuity need, not by every interaction indiscriminately.

---

## 8. Stage 2 — Handoff target and boundary identification

### Purpose
Determine what kind of future context the handoff is intended for.

### Why this matters
A handoff to the next session is not shaped the same way as a handoff to another agent or another provider runtime.

### Canonical target contexts
At minimum:
- `next_session`
- `next_workflow_step`
- `next_agent`
- `next_runtime`
- `next_provider`
- `later_recovery`

### Boundary-identification outputs
At minimum:
- `handoff_type`
- `source_context_type`
- `target_context_type`
- `target_runtime` (nullable)
- `target_provider` (nullable)
- `expected_use_mode` (nullable)

### Rule

> Handoff design should depend on the destination context, not only the source context.

---

## 9. Stage 3 — Continuity candidate selection

### Purpose
Determine which parts of the existing canonical and derived context must survive into the next context.

### Candidate sources
The handoff engine may draw from:
- active state objects
- relevant memory objects
- open loops
- recent accepted decisions
- workflow checkpoints
- unresolved conflicts or uncertainty notes
- artifact references
- recent summaries
- recent bundles where helpful
- recent audit reasoning where needed for trust continuity

### Selection priorities
Handoff selection should prefer:
- what is still active
- what is unresolved
- what is decision-critical
- what constrains next action
- what explains why the current state exists

### Rule

> Handoff selection should preserve continuity minimums, not reconstruct complete history.

---

## 10. Stage 4 — Handoff shaping and bounded packaging

### Purpose
Turn selected continuity candidates into a portable handoff artifact.

### Why this matters
A handoff is not just a list of selected records.
It must be shaped for transfer, not just for archive.

### Canonical handoff sections
At minimum, a strong handoff architecture should support sections such as:
- `handoff_purpose`
- `current_state`
- `what_changed`
- `what_matters_now`
- `open_loops`
- `constraints`
- `recent_decisions`
- `risks_or_uncertainties`
- `recommended_next_focus`
- `artifact_refs`
- `handoff_metadata`

### Packaging rules
A handoff should be:
- bounded
- typed
- scoped
- readable by the next context
- traceable to sources
- portable across runtimes where possible

### Rule

> Handoff packaging should optimize for survivable continuity, not for exhaustiveness.

---

## 11. Stage 5 — Handoff governance and validation

### Purpose
Ensure that the handoff is appropriate, bounded, and policy-compliant before it becomes a derived artifact.

### Governance concerns
At minimum:
- scope correctness
- visibility and access
- inclusion of only justified continuity elements
- exclusion of irrelevant or unsafe data
- boundedness compliance
- conflict signaling where needed
- traceability to source records

### Possible governance outcomes
At minimum:
- `accept_handoff`
- `revise_handoff`
- `reject_handoff`
- `accept_with_warnings`
- `refresh_existing_handoff`

### Rule

> Handoff creation must be governed because transfer risk is different from storage risk.

---

## 12. Stage 6 — Handoff artifact creation or refresh

### Purpose
Materialize the validated handoff as a derived artifact.

### Handoff artifact fields
At minimum:
- `handoff_id`
- `handoff_type`
- `source_context_type`
- `target_context_type`
- `subject_id`
- `scope_id`
- `content`
- `source_record_ids`
- `generated_at`
- `expires_at` (nullable)
- `status`
- `transfer_metadata`
- `priority`
- `confidence_notes` (nullable)
- `freshness_notes` (nullable)

### Refresh logic
An existing handoff may be:
- created new
- refreshed in place
- superseded by a newer handoff artifact
- archived if no longer relevant

### Rule

> Handoff artifacts should remain explicit derived records with lifecycle, not hidden prompt fragments.

---

## 13. Stage 7 — Handoff consumption by the next context

### Purpose
Enable the next execution context to use the handoff as a continuity bridge.

### Consumption contexts
At minimum:
- next session read path
- next agent read path
- workflow-step entry logic
- provider transfer adapter
- recovery mode startup

### Architectural role
A handoff is not necessarily consumed directly as the final prompt.
It may enter:
- the read path as a high-priority source;
- the packing loop as a continuity accelerator;
- the recovery flow as a bounded restart anchor.

### Rule

> Handoff should be easy to consume, but still remain subordinate to current read-time relevance and governance.

---

## 14. Canonical handoff types

The system should support at least the following canonical handoff types:

### 14.1. Session-to-session handoff
Used when the next session should resume without replaying full history.

### 14.2. Agent-to-agent handoff
Used when one agent transfers continuity to another specialized agent.

### 14.3. Workflow-step handoff
Used when a process transitions to its next defined step.

### 14.4. Provider/runtime handoff
Used when continuity must survive a runtime or provider change.

### 14.5. Recovery handoff
Used for later restart after pause or interruption.

### Rule

> Handoff type should be explicit because transfer needs differ by boundary.

---

## 15. Handoff vs summary

Handoff and summary must remain distinct.

### Summary
A summary is a general derived compressed view.

### Handoff
A handoff is a transfer-oriented continuity artifact aimed at a target next context.

### Key difference
A summary may be broad and informational.
A handoff must be bounded, targeted, and action-oriented for continuation.

### Rule

> Every handoff may contain summary-like compression, but not every summary is a handoff.

---

## 16. Handoff vs memory

Handoff and memory must remain distinct.

### Memory
Durable reusable context in canonical form.

### Handoff
A derived portability artifact built from selected memory, state, and continuity signals.

### Rule

> Memory is what the system preserves. Handoff is what the system transfers.

---

## 17. Handoff vs state

Handoff and state must remain distinct.

### State
Represents what is active now.

### Handoff
Represents what of that active state, plus related continuity context, must survive into the next execution boundary.

### Rule

> State is the present condition. Handoff is the transfer bridge out of that condition.

---

## 18. Handoff and boundedness

Handoffs must be explicitly bounded.

### Why
An overgrown handoff becomes another form of prompt dumping and defeats the point of continuity transfer.

### Handoff boundedness controls
At minimum:
- section limits
- candidate caps
- omission of low-priority background
- emphasis on active and unresolved material
- optional provider/runtime-specific size adaptation downstream

### Rule

> A good handoff gives the next context enough to continue, not enough to drown.

---

## 19. Handoff and traceability

Handoff artifacts should remain traceable back to the canonical and derived records that shaped them.

### Traceability requirements
At minimum:
- source record IDs
- source event references where relevant
- generation timestamp
- triggering reason
- generation strategy metadata

### Why
Without traceability, handoffs become opaque and hard to trust or debug.

### Rule

> Handoff portability must not come at the cost of provenance.

---

## 20. Handoff and uncertainty

A handoff must not hide meaningful uncertainty.

### Examples
- unresolved conflict between records
- low-confidence memory involved in current state
- stale but still tentatively relevant context
- ambiguity about what the next actor should do first

### Required architecture behavior
The handoff subsystem should support:
- explicit uncertainty notes
- risk markers
- conflict signals
- “needs verification” indications

### Rule

> A strong handoff transfers uncertainty honestly rather than pretending continuity is cleaner than it is.

---

## 21. Handoff and provider neutrality

The handoff artifact should remain semantically provider-neutral.

### What may vary downstream
- formatting style
- envelope shape for a specific runtime
- injection point into the next execution flow

### What must remain stable
- transfer intent
- target context type
- continuity semantics
- section meaning
- traceability fields

### Rule

> Handoff portability requires semantic stability across providers.

---

## 22. Canonical handoff data structures

The exact implementation may vary, but conceptually the handoff subsystem should operate on the following structures:

### 22.1. Handoff Trigger Record
Why a transfer artifact is needed.

### 22.2. Handoff Target Definition
What future context the handoff is for.

### 22.3. Handoff Candidate Set
What continuity elements may belong in the transfer.

### 22.4. Handoff Packaging Plan
How the selected continuity should be structured.

### 22.5. Handoff Validation Result
Governance approval, revision, or rejection.

### 22.6. Handoff Artifact
Final transfer-oriented derived record.

These are architectural concepts even if implementation names differ.

---

## 23. Handoff interaction with read and pack loops

Handoff is not isolated from the rest of the system.

### Handoff -> Read path
The next read path may treat handoffs as high-priority continuity sources.

### Handoff -> Pack loop
The next pack loop may use handoff sections as continuity accelerators.

### Constraint
Handoff should assist read/pack, not replace them completely.
Current context relevance still matters.

### Rule

> Handoff is a continuity bridge into the next read/pack cycle, not a permanent shortcut around them.

---

## 24. Handoff failure modes

The architecture should explicitly guard against these failure modes:

### 24.1. History replay substitution
Instead of creating handoffs, the system depends on replaying long chat history.

### 24.2. Summary confusion
The system treats generic summaries as equivalent to explicit handoffs.

### 24.3. Overgrown handoffs
Handoffs become too large and lose boundedness.

### 24.4. Missing target awareness
Handoffs are created without a clear destination context in mind.

### 24.5. Hidden uncertainty
The system strips out conflicts and ambiguity, giving the next context false confidence.

### 24.6. No provenance
The next context cannot tell where the handoff came from.

### 24.7. Provider-specific semantic leakage
Handoff meaning changes based on one runtime’s prompt conventions.

### 24.8. Handoff avoidance
The system avoids explicit handoffs and expects continuity to emerge implicitly.

---

## 25. Architectural invariants for handoff

The following must remain true across implementations:

### 25.1. Handoff is a first-class derived artifact family.
### 25.2. Handoff creation begins from a continuity trigger.
### 25.3. Handoff target context is explicit.
### 25.4. Handoff candidate selection is bounded and purpose-driven.
### 25.5. Handoff governance is mandatory.
### 25.6. Handoff remains traceable to sources.
### 25.7. Handoff stays semantically provider-neutral.
### 25.8. Handoff consumption remains subordinate to future read/pack relevance.

These invariants are central to the system’s continuity promise.

---

## 26. Handoff summary

The handoff subsystem should be understood as the system’s fourth operational intelligence loop.

It turns:
- transition signals,
- plus selected continuity context,
- plus target-boundary awareness,

into:
- a bounded,
- typed,
- scoped,
- traceable transfer artifact for the next execution context.

This is what makes continuity survivable across boundaries.

---

## 27. What this document enables next

Once handoff is defined, the next architectural files become much more precise:

1. MCP and API Integration Architecture
2. Tool Contract Specification
3. Policy and Governance Specification
4. Audit and Evaluation Specification

This is because the system now has all 4 main operational contours defined: read, pack, write, and handoff.

---

## 28. Final statement

Handoff is the architectural function that makes continuity portable.

Its quality determines whether the system can survive boundaries cleanly or whether every new execution context must reconstruct meaning from raw history and partial memory.
