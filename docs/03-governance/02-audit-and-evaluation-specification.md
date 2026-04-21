# Audit and Evaluation Specification

## 0. Purpose of this document

This document defines the audit and evaluation specification of the Provider-Agnostic Personal Context Orchestrator.

Its role is to describe how the system:
- explains what it did;
- records why it did it;
- measures whether it did it well;
- detects degradation in continuity quality, boundedness, governance, and transfer behavior.

This document answers questions such as:
- what should be auditable in the system;
- what should be evaluated in the system;
- how audit differs from evaluation;
- how traces should relate to read, pack, write, and handoff;
- what quality dimensions matter most;
- what failure signals should be captured over time.

This is not merely a logging note.
It is the canonical definition of **how the system proves and measures its own context behavior**.

---

## 1. Audit and evaluation thesis

A context orchestration system cannot be trusted if it only acts and never explains or measures itself.

### Canonical statement

> Audit explains what happened and why. Evaluation measures whether the system’s context behavior is good enough.

Both are necessary.
Audit without evaluation produces traceability without quality control.
Evaluation without audit produces metrics without explainability.

---

## 2. Audit vs evaluation

These terms must remain distinct.

### Audit
Audit is the structured trace of system decisions, inputs, outputs, rules applied, and records affected.

Audit answers:
- what happened;
- why it happened;
- which rules or decisions were involved;
- which records were read, written, excluded, or transferred.

### Evaluation
Evaluation is the measurement discipline that assesses how well the system performed its context work.

Evaluation answers:
- was the selected context relevant enough;
- was the bundle bounded enough;
- was writeback clean enough;
- was handoff useful enough;
- were policy decisions correct enough;
- is the system getting better or worse over time.

### Canonical rule

> Audit is about traceability. Evaluation is about quality.

---

## 3. Why this layer is first-class

This system makes high-impact decisions about context authority.
Without audit and evaluation, it becomes difficult to know whether it is:
- selecting too much or too little;
- storing too much noise;
- losing active state;
- creating weak handoffs;
- hiding uncertainty;
- drifting into provider-specific behavior;
- degrading over time without obvious failure.

### Rule

> A production-grade context layer must be inspectable and measurable, not only functional.

---

## 4. Scope of audit and evaluation

Audit and evaluation apply across the entire operational lifecycle:

### 4.1. Read
- request interpretation
- scope resolution
- candidate discovery
- filtering
- ranking

### 4.2. Pack
- section planning
- compression choices
- boundedness decisions
- uncertainty preservation

### 4.3. Write
- candidate extraction
- classification
- admissibility decisions
- dedup/conflict handling
- canonical mutation outcomes

### 4.4. Handoff
- trigger detection
- target-boundary choice
- transfer content selection
- portability quality
- warning preservation

### 4.5. Governance
- policy application
- scope and visibility enforcement
- retention and lifecycle actions
- rejection logic

### Rule

> Audit and evaluation must cover the full context lifecycle, not just one contour.

---

## 5. Core objectives

A strong audit and evaluation layer should achieve at least these objectives:

1. reconstructability of important decisions
2. visibility into context flow quality
3. diagnosability of failure modes
4. measurability of continuity outcomes
5. accountability for governance actions
6. comparability across providers and runtimes
7. support for iteration and improvement
8. detection of degradation over time

These objectives should guide all trace and metric design.

---

## 6. Audit domains

The audit layer should be organized around these domains:

1. **Request Audit**
2. **Read Audit**
3. **Pack Audit**
4. **Write Audit**
5. **Handoff Audit**
6. **Governance Audit**
7. **Integration Audit**
8. **Artifact Provenance Audit**

These domains should remain distinct even if implementation events overlap.

---

## 7. Evaluation domains

The evaluation layer should be organized around these domains:

1. **Relevance Evaluation**
2. **Boundedness Evaluation**
3. **Continuity Evaluation**
4. **Write Quality Evaluation**
5. **Handoff Quality Evaluation**
6. **Governance Quality Evaluation**
7. **Provider Neutrality Evaluation**
8. **Operational Stability Evaluation**

These domains express the quality logic of the system.

---

## 8. Request audit

### Purpose
Record how an external request entered the system and how it was normalized.

### Should capture at minimum
- request identifier
- client identity
- invocation surface used
- subject identity
- session/workflow references
- target runtime/provider/model hints
- normalized request envelope snapshot
- correlation identifiers
- request timestamp

### Why this matters
If later behavior is poor, the system should be able to reconstruct what it thought it was responding to.

### Rule

> Audit should preserve the request context that initiated a context decision chain.

---

## 9. Read audit

### Purpose
Explain how the system chose what context to consider.

### Should capture at minimum
- interpreted intent and mode
- resolved scopes
- candidate source families queried
- candidate counts before and after filtering
- rejected candidates with reasons
- top-ranked selected candidates with reasons
- boundedness truncation actions
- read confidence notes

### Why this matters
Read quality problems are often invisible without a selection trace.

### Rule

> Read audit should make context acquisition reconstructible, not magical.

---

## 10. Pack audit

### Purpose
Explain how selected context became a structured bundle.

### Should capture at minimum
- packing strategy selected
- section plan
- candidate-to-section assignment summary
- compression actions taken
- omitted sections or omitted candidates with reasons
- boundedness adjustments
- uncertainty markers preserved or added
- resulting bundle metadata

### Why this matters
A bundle can fail because of poor packing even when selection was correct.

### Rule

> Pack audit should explain delivery shaping decisions, not only final bundle output.

---

## 11. Write audit

### Purpose
Explain how post-execution signals were turned into canonical mutations or rejections.

### Should capture at minimum
- writeback envelope summary
- extracted candidate set
- candidate classification results
- rejected candidates with reasons
- dedup/conflict analysis results
- final decision outcomes
- affected canonical record IDs
- derived artifact refreshes triggered
- lifecycle changes applied

### Why this matters
Without write audit, memory pollution and state corruption become very difficult to diagnose.

### Rule

> Write audit should explain how the system decided the fate of new context.

---

## 12. Handoff audit

### Purpose
Explain why a handoff was or was not created and how it was shaped.

### Should capture at minimum
- handoff trigger type
- target-boundary type
- selected transfer candidates
- omitted continuity elements with reasons
- handoff packaging strategy
- warnings or uncertainty included
- resulting handoff artifact metadata
- refresh or supersession actions

### Why this matters
Handoffs often fail because they are too large, too vague, or too cleanly compressed.

### Rule

> Handoff audit should explain continuity transfer decisions, not only store the final handoff artifact.

---

## 13. Governance audit

### Purpose
Explain how policy and governance influenced system behavior.

### Should capture at minimum
- applied policy rules
- visibility decisions
- scope restrictions
- admissibility results
- retention/lifecycle decisions
- conflict handling outcome
- provider-neutrality protection where relevant
- explicit warnings or risk flags

### Why this matters
A system cannot claim governance if governance outcomes are untraceable.

### Rule

> Governance audit should expose rule application clearly enough for trust and debugging.

---

## 14. Integration audit

### Purpose
Capture how external surfaces interacted with the canonical system.

### Should capture at minimum
- surface type used (MCP or API)
- client capability class
- invocation metadata
- normalized internal envelope linkage
- response family returned
- error class where relevant
- transport-level shaping notes if meaningful

### Why this matters
Cross-surface inconsistency is otherwise difficult to diagnose.

### Rule

> Integration audit should preserve boundary traceability from surface to core.

---

## 15. Artifact provenance audit

### Purpose
Preserve traceability from derived artifacts back to canonical records and triggering events.

### Applies to
- bundles
- summaries
- handoffs
- digests
- provider-specific packed variants

### Should capture at minimum
- source record IDs
- source event IDs where applicable
- generation timestamp
- generation strategy or mode
- superseded/refresh lineage where applicable

### Rule

> Derived artifacts must remain traceable if they are to be trusted.

---

## 16. Evaluation methodology stance

Evaluation should not be treated as a single score.
It should be multi-dimensional because the system solves multiple intertwined problems.

### Evaluation must account for at least
- relevance
- boundedness
- continuity
- governance correctness
- transfer quality
- operational stability

### Rule

> A single overall score is useful only after the system measures the important dimensions separately.

---

## 17. Relevance evaluation

### Purpose
Measure whether the read path and pack loop deliver the right context for the task.

### Example evaluation dimensions
At minimum:
- did the bundle include the records that mattered most;
- did it omit critical context;
- did it include too much irrelevant material;
- did scope resolution select the right domains;
- did ranking overvalue similarity and undervalue continuity.

### Example signals
- critical record recall
- irrelevant record rate
- scope precision
- context sufficiency rating

### Rule

> Relevance evaluation should measure task-shaped usefulness, not only retrieval similarity.

---

## 18. Boundedness evaluation

### Purpose
Measure whether the system stays compact without losing critical meaning.

### Example evaluation dimensions
At minimum:
- bundle size relative to budget
- section overgrowth frequency
- omission of low-priority material under pressure
- preservation of critical constraints and active state
- over-compression incidents

### Example signals
- average bundle size
- critical section preservation rate
- low-priority truncation rate
- over-compression failure count

### Rule

> Boundedness evaluation should reward disciplined compactness, not maximal inclusion.

---

## 19. Continuity evaluation

### Purpose
Measure whether meaningful progress survives across sessions, tasks, and runtime changes.

### Example evaluation dimensions
At minimum:
- session restart continuity quality
- active state recovery quality
- open-loop survival
- continuity loss frequency
- provider-switch continuity stability

### Example signals
- continuity success rate
- active state recovery rate
- lost-open-loop incidents
- restart-from-zero frequency

### Rule

> Continuity evaluation should measure survivable progress, not just memory presence.

---

## 20. Write quality evaluation

### Purpose
Measure whether writeback stays useful, sparse, and governed.

### Example evaluation dimensions
At minimum:
- signal-to-noise ratio of accepted writes
- duplicate creation frequency
- state-memory confusion frequency
- incorrect admissibility rate
- supersession correctness

### Example signals
- accepted candidate quality score
- duplicate rate
- false-accept rate
- false-reject rate
- state/memory misclassification rate

### Rule

> Write quality evaluation should reward durable relevance and operational correctness, not write volume.

---

## 21. Handoff quality evaluation

### Purpose
Measure whether handoff artifacts help the next context continue effectively.

### Example evaluation dimensions
At minimum:
- handoff usefulness to next context
- transfer boundedness quality
- uncertainty preservation quality
- target-context appropriateness
- handoff freshness at consumption time

### Example signals
- handoff consumption success rate
- handoff restart usefulness rating
- oversized handoff rate
- hidden-uncertainty incidents
- stale-handoff usage rate

### Rule

> Handoff evaluation should reward transfer usefulness, not handoff creation frequency.

---

## 22. Governance quality evaluation

### Purpose
Measure whether governance decisions are helping rather than silently distorting context behavior.

### Example evaluation dimensions
At minimum:
- admissibility correctness
- scope enforcement quality
- visibility correctness
- conflict handling quality
- retention correctness
- audit completeness

### Example signals
- policy rejection correctness rate
- scope leak incidents
- visibility leak incidents
- unresolved-conflict persistence rate
- audit coverage rate

### Rule

> Governance evaluation should measure correctness of control, not just strictness of rules.

---

## 23. Provider neutrality evaluation

### Purpose
Measure whether the system’s core semantics remain stable across different runtimes and providers.

### Example evaluation dimensions
At minimum:
- semantic consistency of bundles across providers
- stable candidate classification across providers
- stable governance outcomes across providers
- stable handoff meaning across providers

### Example signals
- cross-provider semantic drift rate
- provider-specific anomaly count
- cross-runtime bundle stability score

### Rule

> Provider neutrality evaluation should detect semantic drift, not just transport compatibility.

---

## 24. Operational stability evaluation

### Purpose
Measure whether the system behaves reliably over time in realistic operation.

### Example evaluation dimensions
At minimum:
- rate of degraded reads
- rate of stale derived artifacts
- repeated conflict accumulation
- audit lag or missing audit traces
- degraded bundle regeneration quality

### Example signals
- stale-artifact rate
- missing-audit rate
- repeated-conflict recurrence
- degraded-continuity incident frequency

### Rule

> Operational stability evaluation should detect slow system decay, not only catastrophic failure.

---

## 25. Evaluation units

The system should support evaluation at multiple units of analysis.

### At minimum:
- per request
- per session
- per workflow
- per subject
- per client/runtime
- per provider
- per time window

### Why this matters
A system may look healthy globally while failing in one scope, one client type, or one workflow family.

### Rule

> Evaluation should support granular inspection, not only aggregated reporting.

---

## 26. Audit record model

The system should treat audit traces as first-class records.

### At minimum, an audit record should support
- `audit_id`
- `audit_type`
- `related_record_ids`
- `request_id` (nullable)
- `session_id` (nullable)
- `workflow_id` (nullable)
- `decision_id` (nullable)
- `summary`
- `details`
- `created_at`
- `actor_type`
- `actor_id` (nullable)
- `correlation_id` (nullable)

### Audit subtypes should include at minimum
- read audit
- pack audit
- write audit
- handoff audit
- governance audit
- integration audit

### Rule

> Audit records should be structured enough to reconstruct system behavior without re-running the original context flow.

---

## 27. Evaluation record model

The system should treat evaluation outputs as first-class structured results, even if not all are persisted equally.

### At minimum, an evaluation record should support
- `evaluation_id`
- `evaluation_type`
- `evaluation_scope`
- `related_request_ids` (nullable)
- `related_session_ids` (nullable)
- `related_workflow_ids` (nullable)
- `subject_id` (nullable)
- `client_id` (nullable)
- `provider` (nullable)
- `metrics`
- `findings`
- `created_at`
- `time_window` (nullable)
- `version`

### Evaluation types should include at minimum
- relevance evaluation
- boundedness evaluation
- continuity evaluation
- write quality evaluation
- handoff quality evaluation
- governance quality evaluation
- provider-neutrality evaluation
- operational stability evaluation

### Rule

> Evaluation results should preserve dimension-level findings, not only an opaque overall score.

---

## 28. Audit and evaluation linkage

Audit and evaluation should not be isolated from each other.

### Audit supports evaluation by providing
- raw decision traces
- provenance chains
- rejection reasons
- boundedness actions
- lifecycle changes

### Evaluation supports audit by highlighting
- which traces deserve review
- where drift appears
- where failures cluster
- which contours need deeper inspection

### Rule

> Audit and evaluation should reinforce each other: explanation feeding measurement, and measurement directing explanation.

---

## 29. Human review and operator use

The system should conceptually support human inspection even if some flows are automated.

### Audit should support
- case reconstruction
- decision review
- failure diagnosis
- trust verification

### Evaluation should support
- system tuning
- regression detection
- rollout readiness
- provider comparison
- quality monitoring over time

### Rule

> Audit and evaluation should be useful not only to the machine, but also to the human operator or builder.

---

## 30. Audit and evaluation failure modes

The architecture should explicitly guard against these failure modes:

### 30.1. Logging without meaning
Large traces exist, but they do not explain system decisions.

### 30.2. Metrics without semantics
Scores exist, but they are disconnected from actual context failures.

### 30.3. Missing contour coverage
Read is measured, but write or handoff is ignored.

### 30.4. No provenance in derived artifacts
Bundles, summaries, or handoffs cannot be traced back.

### 30.5. Audit gaps on governance decisions
Rules are applied, but not captured clearly enough to inspect.

### 30.6. Single-score illusion
One aggregate score hides major problems in one contour.

### 30.7. No drift detection
The system degrades slowly with no evaluation framework to detect it.

### 30.8. Provider-specific blind spots
One provider behaves differently, but evaluation is too shallow to reveal semantic drift.

---

## 31. Audit and evaluation invariants

The following must remain true across implementations:

### 31.1. Major decisions remain auditable.
### 31.2. Audit spans read, pack, write, handoff, governance, and integration.
### 31.3. Evaluation remains multi-dimensional.
### 31.4. Audit records preserve provenance and linkage.
### 31.5. Evaluation does not collapse into one score too early.
### 31.6. Derived artifacts remain traceable enough for trust.
### 31.7. Cross-provider semantic drift remains observable.
### 31.8. Audit and evaluation outputs remain useful to human inspection.

These invariants are central to the system’s trustworthiness.

---

## 32. Audit and evaluation summary

The audit and evaluation layer should be understood as the system’s trust and quality discipline.

It turns:
- context decisions,
- control actions,
- lifecycle changes,
- transfer events,
- provider/runtime variation,

into:
- explainable traces,
- measurable quality signals,
- diagnosable failures,
- evidence for iteration and reliability improvement.

This is what allows the orchestrator to be trusted as infrastructure rather than treated as a black box.

---

## 33. What this document enables next

Once audit and evaluation are defined, the next files become much more grounded:

1. Provider Adapter Architecture
2. Implementation Decomposition for Coding Agent
3. Future operational dashboards or control-plane specs if needed later

This is because the system now knows how it will justify and measure its own behavior.

---

## 34. Final statement

Audit and evaluation are the proof discipline of the orchestrator.

Their quality determines whether the system can be trusted, debugged, tuned, and compared over time — or whether it remains an opaque context engine whose failures are hard to see until they become costly.
