# Read Path Architecture

## 0. Purpose of this document

This document defines the read path architecture of the Provider-Agnostic Personal Context Orchestrator.

Its role is to describe how the system moves from an incoming request to a bounded set of selected context candidates that are ready for packing.

This document answers questions such as:
- how the system interprets an incoming request;
- how it determines relevant scopes;
- how it finds candidate context;
- how it separates relevance from noise;
- how it decides what should move forward into bundle construction;
- how read-time governance constrains context access.

This is not the packing document and not the writeback document.
It is specifically about **context acquisition and selection before delivery**.

---

## 1. Read path thesis

The read path is the controlled process by which the orchestrator determines what context should be considered for the current execution.

### Canonical statement

> The read path must not be a raw retrieval dump. It must be a governed selection pipeline that transforms a task signal into a bounded set of context candidates.

The read path is therefore not just search.
It is the first operational interpretation layer of the system.

---

## 2. Read path place in the overall architecture

In the full system loop, the read path begins after request intake and ends before bundle packing.

### Position in the canonical execution loop
1. client invocation
2. intake normalization
3. intent and mode resolution
4. scope resolution
5. candidate context discovery
6. filtering and ranking
7. handoff to pack loop

The read path owns steps 2 through 6.
The pack loop begins after that.

---

## 3. High-level read path stages

The read path should be understood as 7 stages:

1. **Request normalization**
2. **Intent and mode interpretation**
3. **Scope resolution**
4. **Candidate discovery**
5. **Eligibility filtering**
6. **Ranking and selection**
7. **Read result packaging for the pack loop**

Each stage must remain conceptually distinct.

---

## 4. Stage 1 — Request normalization

### Purpose
Convert incoming client/runtime input into a canonical internal request envelope.

### Why this matters
Different clients may invoke the system in different ways:
- Codex via MCP tool calls;
- agent runtimes through APIs;
- internal apps through structured payloads;
- interactive assistants through tool-mediated requests.

The read path must begin from a provider-neutral internal shape.

### Canonical request envelope fields
At minimum, the normalized request should include:
- `request_id`
- `client_id`
- `request_type`
- `subject_id`
- `owner_id` (nullable)
- `session_id` (nullable)
- `workflow_id` (nullable)
- `task_signal`
- `user_input` or `input_payload`
- `requested_scope_hints` (nullable)
- `execution_mode_hint` (nullable)
- `target_runtime` (nullable)
- `target_provider` (nullable)
- `target_model` (nullable)
- `created_at`

### Rule

> Read path logic should begin from a normalized request envelope, not from raw client-specific payloads.

---

## 5. Stage 2 — Intent and mode interpretation

### Purpose
Infer what kind of work the system is supporting right now.

### What this stage decides
At minimum:
- is this a new request or a continuation;
- is this a personal, project, workflow, or hybrid task;
- what operating mode should apply;
- how much contextual depth is justified;
- what context families are likely needed.

### Canonical intent outputs
This stage should produce at least:
- `intent_type`
- `continuation_flag`
- `mode`
- `depth_hint`
- `context_family_hints`
- `risk_or_uncertainty_flags` (nullable)

### Example modes
The exact taxonomy can evolve, but examples may include:
- `quick_answer`
- `continuation`
- `planning`
- `handoff_recovery`
- `workflow_execution`
- `deep_context`
- `state_reconstruction`

### Rule

> The read path must not search blindly. It must first interpret what kind of context problem this request represents.

---

## 6. Stage 3 — Scope resolution

### Purpose
Determine which scopes are both relevant and permitted for this request.

### Why this matters
The system should not search everything by default.
It should search the smallest justified context domain.

### Inputs to scope resolution
- request envelope
- intent and mode outputs
- subject identity
- workflow/session references
- policy and visibility rules
- client/runtime identity

### Scope resolution outputs
At minimum:
- `eligible_scopes`
- `preferred_scopes`
- `excluded_scopes`
- `scope_priority_order`
- `scope_confidence`

### Scope examples
- global user
- workspace
- project
- workflow
- task
- session
- agent-local
- shared-agent
- external linked scope

### Rule

> The read path must decide where context may come from before deciding which records matter.

---

## 7. Stage 4 — Candidate discovery

### Purpose
Retrieve potential context candidates from the layered persistence model and related indexes.

### Candidate discovery sources
The read path may discover candidates from:
- memory objects
- state objects
- recent events
- summaries
- handoff artifacts
- artifact references
- relation edges
- retrieval indexes
- prior bundle metadata
- prior invocation traces

### Discovery strategies
A strong system should support multiple strategies rather than one universal query.

#### 7.1. Direct scope lookup
Useful for:
- active state
- recent session context
- workflow-local records
- project-local records

#### 7.2. Recency-biased lookup
Useful for:
- current continuity recovery
- recent decisions
- recent open loops
- latest active branch

#### 7.3. Semantic retrieval
Useful for:
- approximate relevance
- similar prior discussions
- loosely phrased user references

#### 7.4. Relation traversal
Useful for:
- finding linked tasks, decisions, risks, and artifacts
- preserving cross-entity continuity

#### 7.5. Handoff-first retrieval
Useful when continuation or cross-agent transfer is suspected.

### Discovery output
This stage should produce a candidate pool, not a final bundle.

### Rule

> Discovery should be source-diverse and scope-bounded.

---

## 8. Stage 5 — Eligibility filtering

### Purpose
Remove candidates that should not move forward to ranking.

### Why this matters
A large percentage of discovered records will be irrelevant, stale, unsafe, redundant, or low-value.

### Filtering criteria
At minimum, eligibility filtering should consider:
- scope mismatch
- visibility restrictions
- stale or expired records
- invalidated or archived status
- low confidence below threshold
- exact duplicates
- irrelevant type for the current intent
- provider/runtime incompatibility when relevant
- policy-based exclusion

### Filtering outputs
At minimum:
- `eligible_candidates`
- `rejected_candidates`
- `rejection_reasons`

### Rule

> The read path must actively remove bad context, not only try to find good context.

---

## 9. Stage 6 — Ranking and selection

### Purpose
Determine which eligible candidates are most relevant to the current request.

### Difference from discovery
Discovery answers: what could matter?
Ranking answers: what matters most now?

### Selection dimensions
At minimum, ranking should consider:
- scope proximity
- subject match
- recency
- importance
- confidence
- continuity value
- state criticality
- explicit request match
- relation distance
- handoff priority
- policy weighting

### Canonical ranking outputs
At minimum:
- `candidate_id`
- `rank_score`
- `selection_reason`
- `priority_class`

### Priority classes
Examples:
- `critical`
- `high`
- `supporting`
- `optional`
- `defer`

### Rule

> Ranking must prefer task-shaped relevance over raw retrieval similarity.

---

## 10. Stage 7 — Read result handoff to the pack loop

### Purpose
Deliver a bounded, typed, ordered set of context candidates to the pack loop.

### This stage must not
- create the final bundle;
- apply final formatting for the target provider;
- collapse everything into one summary.

### This stage should output
At minimum:
- ordered candidate list
- candidate types
- selection reasons
- excluded category notes
- scope summary
- read confidence notes
- packing hints

### Rule

> The read path ends with a selection set, not with a final prompt-shaped artifact.

---

## 11. Canonical read path data structures

The exact implementation may vary, but conceptually the read path should operate on these intermediate structures:

### 11.1. Request Envelope
Normalized client request.

### 11.2. Intent Resolution Result
Contains intent, mode, and depth assumptions.

### 11.3. Scope Resolution Result
Contains eligible and prioritized scopes.

### 11.4. Candidate Pool
The raw discovered set.

### 11.5. Eligibility Filter Result
Contains eligible/rejected split with reasons.

### 11.6. Ranked Selection Result
Contains ordered selected candidates with reasons and priorities.

### 11.7. Pack Input
The final read output passed into the pack loop.

These are architectural concepts even if concrete class names differ.

---

## 12. Types of records the read path should prefer by situation

The read path should not treat all entity types equally.
Different task situations should bias toward different candidate families.

### 12.1. Continuation requests
Bias toward:
- recent active state
- recent open loops
- recent decisions
- recent handoffs
- latest relevant summaries

### 12.2. Planning requests
Bias toward:
- goals
- constraints
- decisions
- risks
- workflow state
- linked artifacts

### 12.3. State reconstruction
Bias toward:
- active state objects
- latest checkpoints
- recent events
- unresolved branch states
- waiting states

### 12.4. Personal preference-sensitive tasks
Bias toward:
- stable preferences
- instruction preferences
- durable profile attributes

### 12.5. Cross-agent handoff recovery
Bias toward:
- handoff artifacts
- recent summaries
- current state
- linked decision history

### Rule

> The read path should be type-sensitive, not just text-sensitive.

---

## 13. Read-time governance

The read path is not governance-free.
Read-time governance determines what may be surfaced at all.

### Read-time governance concerns
At minimum:
- scope visibility
- subject isolation
- client/runtime permissions
- stale data suppression
- policy-based omission
- confidence floor
- archival handling
- special sensitivity classes if introduced later

### Architectural rule

> Selection without read-time governance is not safe enough to be canonical.

---

## 14. Read path interaction with memory vs state

The read path must explicitly treat memory and state as different families.

### Memory in the read path
Memory contributes:
- durable preferences
- long-term goals
- durable facts
- constraints
- prior decisions

### State in the read path
State contributes:
- what is active now
- what is unresolved
- where the workflow currently stands
- what is blocked or waiting

### Rule

> The read path must combine memory and state, but never confuse them.

---

## 15. Read path interaction with derived artifacts

Derived artifacts can be highly useful during reading, but they should not replace canonical records.

### Valid uses of summaries and handoffs in the read path
- accelerate continuity recovery
- provide compact read shortcuts
- reconstruct recent direction
- support cross-session entry

### Constraint
When a derived artifact is used, the read path should still preserve traceability to underlying canonical records where practical.

### Rule

> Derived artifacts may accelerate reading, but canonical layers remain the deeper authority.

---

## 16. Read path interaction with relation edges

Relations are important because continuity is often graph-shaped, not flat.

### Why relation traversal matters
A user request may indirectly require:
- a project linked to a task
- a decision linked to a risk
- a task linked to an artifact
- an open loop linked to a previous handoff

### Rule

> The read path should be able to follow meaningful context adjacency, not only direct keyword similarity.

---

## 17. Read path boundedness

Boundedness begins in the read path, not only in packing.

### Why
If the read path returns too many candidates, the pack loop becomes overloaded and degrades into aggressive compression rather than intelligent delivery.

### Boundedness controls
At minimum, the read path should support:
- candidate count limits
- per-type candidate limits
- per-scope candidate limits
- recency caps
- low-priority truncation
- optional hard stop rules for noisy branches

### Rule

> The read path should produce a bounded candidate universe before the pack loop begins.

---

## 18. Read path outputs for auditability

The read path should be inspectable.
It should not feel like unexplained magic.

### Audit-friendly outputs
At minimum, read-path observability should capture:
- what request was interpreted
- which intent/mode was chosen
- which scopes were opened or excluded
- which sources were queried
- which candidates were rejected and why
- why the selected candidates ranked highest
- whether boundedness rules truncated anything

This information may feed audit records or evaluation layers.

---

## 19. Read path failure modes

The architecture should explicitly guard against these failure modes:

### 19.1. Search-everything behavior
The system ignores scope discipline and queries broadly by default.

### 19.2. Retrieval-only simplification
The system mistakes semantic search for full read logic.

### 19.3. Summary overdependence
The system reads mostly from summaries and loses canonical grounding.

### 19.4. Memory-state collapse
The system cannot distinguish active operational state from durable memory.

### 19.5. Weak filtering
The candidate pool remains noisy because the system discovers but does not reject enough.

### 19.6. No selection reasons
The read output cannot explain why selected candidates were chosen.

### 19.7. Unbounded read result
The pack loop receives too much candidate material and loses structural clarity.

---

## 20. Architectural invariants for the read path

The following must remain true across implementations:

### 20.1. The read path begins from a normalized request envelope.
### 20.2. Scope resolution happens before broad candidate discovery.
### 20.3. Discovery and selection remain separate stages.
### 20.4. Eligibility filtering is mandatory.
### 20.5. Memory and state remain separate candidate families.
### 20.6. Derived artifacts may help but do not replace canonical layers.
### 20.7. The read path returns a bounded selected set, not a final bundle.
### 20.8. Read decisions remain auditable.

These invariants are central to the system’s identity.

---

## 21. Read path summary

The read path should be understood as the system’s first operational intelligence loop.

It turns:
- an incoming request,
- plus subject/session/workflow context,
- plus governed access rules,

into:
- a bounded,
- type-aware,
- scope-aware,
- relevance-ranked set of context candidates.

Only after that should packing begin.

---

## 22. What this document enables next

Once the read path is defined, the next files become cleaner:

1. Bundle Packing Architecture
2. Write Path Architecture
3. Handoff Architecture
4. MCP and API Integration Architecture
5. Tool Contract Specification

This is because the system now knows what its pre-bundle acquisition logic looks like.

---

## 23. Final statement

The read path is the disciplined process that decides what context deserves a chance to be delivered.

Its quality determines whether the entire system behaves like a real context orchestrator or degrades into a noisy retrieval wrapper.
