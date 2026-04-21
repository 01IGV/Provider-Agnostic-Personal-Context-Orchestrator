# Core Concepts and Terminology

## 0. Purpose of this document

This document defines the canonical vocabulary of the Provider-Agnostic Personal Context Orchestrator.

Its role is to stabilize meaning before deeper technical decomposition.
Without a shared vocabulary, the system will drift into weak implementation patterns such as:
- mixing memory with state;
- treating summaries as truth;
- confusing retrieval with orchestration;
- confusing a candidate with a canonical record;
- confusing a bundle with raw context.

This document exists to prevent that drift.

---

## 1. Why terminology matters here

This system is not a narrow feature.
It is an infrastructure layer with multiple interacting concerns:
- continuity;
- memory;
- state;
- selection;
- packing;
- handoff;
- governance;
- portability.

If those concerns are described with vague or overlapping language, the architecture will degrade quickly.

### Canonical rule

> Every major concept in this system must have one intended meaning.

---

## 2. Core definition of the system

### Personal Context Orchestrator
The Personal Context Orchestrator is a provider-agnostic control layer that stores, selects, packs, governs, and transfers bounded context for models and agents across sessions, tasks, workflows, providers, and execution environments.

This is the system-level definition.

---

## 3. Primary conceptual categories

The system depends on 8 primary conceptual categories:

1. **Context**
2. **Memory**
3. **State**
4. **Bundle**
5. **Candidate**
6. **Canonical Record**
7. **Handoff**
8. **Policy**

These categories should remain distinct.

---

## 4. Context

### Context
Context is any information that may help a model or agent perform a task more correctly, more efficiently, or with better continuity.

Context is the broadest category.
It may include:
- memory;
- active state;
- constraints;
- recent decisions;
- summaries;
- linked artifacts;
- role or mode hints;
- workflow position;
- uncertainty notes.

### Important distinction
Context is not automatically memory.
Context is not automatically durable.
Context is not automatically eligible for storage.

### Canonical rule

> Context is what may be useful now. Memory is only one durable subset of context.

---

## 5. Memory

### Memory
Memory is durable context that the system has decided to preserve beyond the current turn because it is likely to matter again.

Examples:
- stable user preference;
- durable fact;
- persistent project constraint;
- long-lived goal;
- important decision;
- relationship between entities.

### Memory is not
Memory is not:
- the full chat history;
- every extracted sentence;
- active transient state;
- every intermediate reasoning artifact.

### Canonical rule

> Memory is preserved context with reuse value, not just observed information.

---

## 6. State

### State
State is the currently active operational condition of work.

It describes what is true **now** in an active process rather than what should remain durable as reusable memory.

Examples:
- current workflow step;
- pending question;
- active branch of work;
- waiting for user input;
- draft in progress;
- current mode of a session.

### State vs memory
State is about active progression.
Memory is about durable continuity.

A piece of information may move from state into memory later, but the categories must remain conceptually separate.

### Canonical rule

> State tracks current progression. Memory preserves durable relevance.

---

## 7. Event

### Event
An event is a recorded occurrence in the chronology of the system.

Examples:
- user message received;
- model response produced;
- tool call made;
- state changed;
- memory candidate submitted;
- handoff created.

Events are not automatically memory or state.
They are the raw historical trail.

### Canonical rule

> Event is chronology, not necessarily significance.

---

## 8. Context Object

### Context Object
A context object is a typed unit of information that the orchestrator can reason about.

It may represent:
- memory;
- state;
- decision;
- open loop;
- artifact reference;
- risk note;
- constraint.

A context object is the semantic unit the system works with.

### Canonical rule

> The system should operate on typed context objects, not raw text blobs.

---

## 9. Memory Object

### Memory Object
A memory object is a typed durable record representing preserved context.

It has semantics, scope, provenance, timestamps, and lifecycle metadata.

It is a canonical durable unit, not a temporary suggestion.

---

## 10. State Object

### State Object
A state object is a typed record representing active operational state.

It is distinct from a memory object even if both live in the same broader system.

Examples:
- workflow status;
- unresolved branch;
- current step;
- blocked status;
- waiting state.

---

## 11. Candidate

### Candidate
A candidate is a proposed record or action that has not yet become canonical.

Examples:
- memory candidate;
- state update candidate;
- handoff candidate;
- summary refresh candidate.

A candidate is always provisional.
It must pass through decision logic before becoming authoritative.

### Canonical rule

> Candidate means proposed, not accepted.

---

## 12. Canonical Record

### Canonical Record
A canonical record is an accepted system record that the platform treats as authoritative within its scope and lifecycle.

Examples:
- an accepted memory object;
- an accepted state object;
- an accepted handoff artifact;
- an accepted audit record.

Canonical does not mean universally true for all time.
It means the system has accepted it as a governed record.

### Canonical rule

> Canonical records are governed system truth surfaces, not raw model output.

---

## 13. Scope

### Scope
Scope defines the domain boundary within which a piece of context is valid, visible, or relevant.

Typical scopes:
- global user;
- workspace;
- project;
- workflow;
- task;
- session;
- agent-local;
- shared-agent.

Scope is critical because the same fact may be relevant in one domain and irrelevant or unsafe in another.

### Canonical rule

> Scope determines where context belongs and where it may be used.

---

## 14. Subject

### Subject
The subject is the entity that a record is about.

Examples:
- the user;
- a project;
- a task;
- a workflow;
- an agent;
- an artifact.

Subject prevents records from becoming ownerless fragments.

---

## 15. Owner

### Owner
The owner is the entity responsible for or logically holding the record within the system model.

In many cases subject and owner may align, but they are not always identical.

This distinction matters for access, lifecycle, and accountability.

---

## 16. Bundle

### Bundle
A bundle is a bounded, task-shaped package of selected context prepared for a specific model invocation, workflow step, or agent interaction.

A bundle is not raw memory.
A bundle is not the entire storage.
A bundle is not just a summary.

A bundle may include:
- user frame;
- relevant facts;
- active state;
- constraints;
- open loops;
- recent decisions;
- uncertainty notes;
- artifact references;
- metadata.

### Canonical rule

> A bundle is a delivery format, not the underlying memory model.

---

## 17. Bounded Context

### Bounded Context
Bounded context is context intentionally limited to what is justified for a specific task, scope, and execution budget.

Boundedness is essential for:
- relevance;
- token efficiency;
- clarity;
- governance;
- portability.

### Canonical rule

> The system should deliver bounded context, not maximal context.

---

## 18. Context Packing

### Context Packing
Context packing is the process of turning selected context objects into a structured bounded bundle.

It includes:
- choosing sections;
- deciding order;
- deciding what stays verbatim vs compressed;
- applying target-model constraints;
- attaching metadata.

This is a distinct system function, not the same thing as selection.

---

## 19. Context Selection

### Context Selection
Context selection is the process of determining which candidate context objects are relevant enough to be considered for inclusion in a bundle.

It happens before packing.

Selection may depend on:
- intent;
- scope;
- recency;
- importance;
- confidence;
- policy;
- relation graph;
- current state.

### Canonical rule

> Selection answers “what matters”; packing answers “how to deliver it.”

---

## 20. Handoff

### Handoff
Handoff is a bounded transfer of continuity from one execution context to another.

Examples:
- one session to the next;
- one agent to another;
- one workflow step to another;
- one provider/runtime to another.

A handoff should be explicit, typed, scoped, and portable.

### Handoff Artifact
A handoff artifact is the concrete structured output used to perform that transfer.

### Canonical rule

> Handoff is not “remember everything later.” It is explicit continuity transfer.

---

## 21. Summary

### Summary
A summary is a derived compressed representation of other context surfaces.

Examples:
- session summary;
- rolling summary;
- project digest;
- handoff brief.

A summary is useful, but it is not the sole truth layer.

### Canonical rule

> Summary is derived context, not canonical context by default.

---

## 22. Derived Artifact

### Derived Artifact
A derived artifact is any computed context surface produced from canonical layers.

Examples:
- summary;
- bundle;
- digest;
- handoff brief;
- risk view.

Derived artifacts improve usability and efficiency but should remain regenerable from canonical layers.

---

## 23. Provenance

### Provenance
Provenance is the trace of where a record came from and why it exists.

It may include:
- source event;
- source artifact;
- tool source;
- time of creation;
- chain of derivation.

Provenance is required for trust, auditability, and conflict handling.

### Canonical rule

> A useful context system does not only know content. It knows where that content came from.

---

## 24. Freshness

### Freshness
Freshness is the degree to which a record is still timely and appropriate for current use.

Freshness is not the same as creation date.
A record may be old but still valid, or recent but already stale.

---

## 25. Confidence

### Confidence
Confidence is the system’s estimate of how reliable or stable a record is.

Confidence may reflect:
- repeated confirmation;
- source quality;
- ambiguity level;
- conflict presence.

Confidence is not truth.
It is an operational assessment.

---

## 26. Importance

### Importance
Importance is the expected future usefulness or decision relevance of a record.

Importance helps the system decide what deserves durable retention and what should stay ephemeral.

---

## 27. Retention

### Retention
Retention is the policy logic governing how long a record should remain stored and active.

Retention may depend on:
- type;
- scope;
- subject;
- sensitivity;
- reuse value;
- freshness decay;
- legal or policy rules.

---

## 28. TTL

### TTL
TTL means time-to-live.
It is one mechanism for limiting the active lifetime of a record.

TTL is a policy instrument, not the same thing as record truth.

---

## 29. Deduplication

### Deduplication
Deduplication is the process of preventing equivalent or near-equivalent records from multiplying unnecessarily.

This is especially important for writeback quality.

---

## 30. Conflict

### Conflict
A conflict exists when two or more records cannot be naively accepted together without qualification.

Examples:
- changed preference;
- competing task states;
- contradictory constraints;
- outdated vs newer versions.

Conflict is not always an error.
It is often a normal condition that requires resolution logic.

---

## 31. Policy

### Policy
Policy is the explicit set of rules governing what the system may store, expose, update, retain, or omit.

Policy applies to:
- visibility;
- write admissibility;
- scope access;
- retention;
- archival;
- conflict handling;
- safety and trust boundaries.

### Canonical rule

> Policy is the guardrail layer that keeps context handling governed rather than ad hoc.

---

## 32. Governance

### Governance
Governance is the broader control discipline around policy, auditability, retention, permissions, and explainability.

Policy is a mechanism inside governance.
Governance is the larger operating principle.

---

## 33. Orchestration

### Orchestration
Orchestration is the coordinated decision-making process that governs how context moves through the system.

It includes:
- intake interpretation;
- scope resolution;
- selection;
- packing;
- controlled expansion;
- write routing;
- handoff generation.

### Canonical rule

> Orchestration is not just retrieval. It is the active governance of context flow.

---

## 34. Retrieval

### Retrieval
Retrieval is the process of locating candidate information from storage or indexes.

Retrieval is a subordinate function.
It does not decide by itself:
- what is canonical;
- what is active state;
- what belongs in the bundle;
- what should survive across sessions.

### Canonical rule

> Retrieval finds candidates. Orchestration decides meaning and use.

---

## 35. Integration Surface

### Integration Surface
The integration surface is the set of externally exposed interfaces through which clients and runtimes use the system.

Examples:
- MCP tools;
- MCP resources;
- API endpoints;
- model-facing tool schemas.

This is the entry and exit boundary of the platform.

---

## 36. Provider Adapter

### Provider Adapter
A provider adapter is the layer that maps core system behavior into a provider-specific execution environment without changing the core semantics.

It handles differences such as:
- tool-calling shape;
- context formatting;
- token constraints;
- runtime quirks.

---

## 37. External Client

### External Client
An external client is any runtime or system that invokes the orchestrator.

Examples:
- Codex;
- ChatGPT-compatible MCP host environments;
- agent runtimes;
- custom applications.

The orchestrator should remain valid as an external service for such clients.

---

## 38. Audit Record

### Audit Record
An audit record is a stored explanation or trace of a system decision.

Examples:
- why a bundle was assembled this way;
- why a candidate was rejected;
- which policy rule was applied;
- which sources influenced selection.

Audit records provide accountability and diagnosability.

---

## 39. Canonical vs Derived

### Canonical
Canonical means accepted by the system as an authoritative governed record.

### Derived
Derived means computed from canonical layers for operational use.

### Canonical rule

> Canonical records are durable truth surfaces. Derived artifacts are usable projections built from them.

---

## 40. Portable Context

### Portable Context
Portable context is context represented in a way that can survive transfer across:
- sessions;
- agents;
- runtimes;
- model providers.

Portability is one of the system’s defining properties.

---

## 41. Continuity

### Continuity
Continuity is the property that meaningful work, context, and state can persist across time and execution boundaries without requiring full replay of raw history.

Continuity is broader than memory.
It depends on memory, state, handoffs, summaries, and governance together.

### Canonical rule

> Continuity is the system outcome. Memory is only one ingredient.

---

## 42. Non-equivalent pairs that must not be confused

The following pairs must remain distinct:

- context ≠ memory
- memory ≠ state
- event ≠ memory
- selection ≠ packing
- candidate ≠ canonical record
- summary ≠ truth source
- retrieval ≠ orchestration
- bundle ≠ storage
- provider adapter ≠ core logic
- policy ≠ product business logic
- continuity ≠ chat history

These distinctions are mandatory for a correct system.

---

## 43. Canonical terminology table

| Term | Canonical meaning |
|---|---|
| Context | Information that may help now |
| Memory | Durable reusable context |
| State | Active operational condition |
| Event | Chronological occurrence |
| Candidate | Proposed but not accepted record/action |
| Canonical Record | Accepted authoritative system record |
| Bundle | Bounded delivery package for execution |
| Handoff | Explicit continuity transfer |
| Summary | Derived compressed view |
| Provenance | Origin and trace of a record |
| Policy | Rules governing admissibility and access |
| Governance | Broader control discipline around policy and audit |
| Retrieval | Candidate discovery |
| Orchestration | Coordinated control of context flow |
| Continuity | Persistence of meaningful progress across boundaries |

---

## 44. Final statement

This document defines the language of the system.

Future architecture, data model, contracts, and implementation work should use these meanings consistently.

If later documents need to refine terms, they should refine them without violating the distinctions established here.
