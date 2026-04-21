# System Architecture Overview

## 0. Purpose of this document

This document defines the full structural architecture of the Provider-Agnostic Personal Context Orchestrator.

Its role is to translate the foundational vision into a clear system shape:
- what major subsystems exist;
- how they interact;
- where the core execution loop lives;
- where MCP and API interfaces sit;
- how storage, selection, packing, governance, and model execution relate to one another.

This is not a low-level implementation file.
It is the canonical architectural map of the full system.

---

## 1. Architectural thesis

The system should be built as an external context-control service composed of multiple cooperating layers.

### Canonical architectural statement

> The system is not one memory module. It is a coordinated architecture that governs intake, context selection, bundle packing, controlled expansion, writeback, handoff, policy, and provider-portable integration.

The architecture must preserve one central fact:

> context authority belongs to the orchestrator layer, not to raw storage and not to the main model.

---

## 2. Top-level architectural view

At the highest level, the system consists of 6 major zones:

1. **External Clients and Runtimes**
2. **Integration Surface**
3. **Core Orchestration Layer**
4. **Governance and Control Layer**
5. **Persistence and Derived Context Layer**
6. **Provider and Execution Adapters**

These zones together form the full system.

---

## 3. Top-level zones

## 3.1. External Clients and Runtimes

These are systems that consume the orchestrator.

Examples:
- Codex through MCP;
- ChatGPT through MCP-compatible tool/resource surfaces where available;
- external agent runtimes;
- local orchestration systems;
- custom applications;
- workflow engines.

These clients should treat the orchestrator as an external context infrastructure service.

---

## 3.2. Integration Surface

This is the ingress and egress layer of the orchestrator.

It is responsible for exposing:
- MCP tools;
- MCP resources;
- MCP prompt-support surfaces where needed;
- direct API endpoints;
- model-facing tool contracts;
- typed request/response schemas.

This layer should not contain the full context intelligence.
Its role is interface exposure and protocol alignment.

---

## 3.3. Core Orchestration Layer

This is the heart of the system.

It is responsible for:
- request intake interpretation;
- intent and mode detection;
- scope resolution;
- context candidate selection;
- ranking and filtering;
- bundle construction;
- read-path control;
- write-path routing;
- handoff generation triggers.

This layer is the operational brain of the platform.

---

## 3.4. Governance and Control Layer

This layer decides what is allowed, what is canonical, and what is safe.

It is responsible for:
- policy enforcement;
- visibility and permissions;
- memory write gating;
- state update gating;
- deduplication;
- conflict handling;
- retention and archival rules;
- explainability and audit decisions.

This layer keeps the system from degrading into uncontrolled memory accumulation.

---

## 3.5. Persistence and Derived Context Layer

This layer stores the canonical and derived context surfaces.

It includes:
- event log;
- memory objects;
- state objects;
- relations layer;
- summaries;
- handoff artifacts;
- bundle artifacts;
- retrieval indexes;
- audit records.

This layer must be rich enough to support continuity, but should remain subordinate to orchestrator decisions.

---

## 3.6. Provider and Execution Adapters

This layer bridges the orchestrator into concrete model environments.

It includes adapters for:
- different model providers;
- different tool-calling protocols;
- runtime-specific formatting needs;
- context window constraints;
- provider-specific execution quirks.

This layer protects the core architecture from provider lock-in.

---

## 4. Canonical subsystem breakdown

Below the top-level zones, the architecture should be decomposed into canonical subsystems.

### 4.1. Request Intake Module
Receives incoming signals from users, agents, workflows, or external systems.

### 4.2. Intent and Mode Resolver
Determines:
- task type;
- continuation vs new request;
- mode of operation;
- likely scope families;
- budget assumptions.

### 4.3. Scope Resolver
Determines what scopes are relevant and allowed:
- user-global;
- workspace;
- project;
- workflow;
- task;
- session;
- agent-local;
- shared-agent;
- external linked resources.

### 4.4. Context Selector
Retrieves context candidates and ranks them.
This subsystem may combine:
- scope lookups;
- semantic retrieval;
- recency logic;
- graph traversal;
- rule-based filters;
- priority heuristics.

### 4.5. Bundle Packer
Transforms selected context into task-shaped bounded context bundles.

### 4.6. Tool Gateway
Exposes the orchestrator’s controlled tools to the main model.

### 4.7. Write Gate
Processes all writeback candidates before they become canonical records.

### 4.8. Handoff Engine
Builds bounded transfer artifacts for:
- next session;
- next workflow step;
- another agent;
- another runtime or provider.

### 4.9. Summary Engine
Maintains derived continuity artifacts:
- rolling summaries;
- state briefs;
- handoff briefs;
- digest views.

### 4.10. Storage Manager
Maintains canonical persistence and indexes.

### 4.11. Policy Engine
Applies rules and governance decisions.

### 4.12. Audit and Evaluation Layer
Captures why the system acted as it did, and supports quality inspection.

### 4.13. Provider Adapter Layer
Maps the same core system logic to different provider/runtime environments.

---

## 5. Canonical execution flow

The full architecture should be understood through the main execution loop.

### Step 1 — Client invocation
An external client invokes the orchestrator through MCP or API.

### Step 2 — Intake normalization
The request is normalized into an internal request envelope.
This envelope should include:
- user or subject identity;
- task signal;
- client/runtime identity;
- session or workflow references;
- optional execution hints.

### Step 3 — Intent and mode resolution
The orchestrator determines what kind of request it is and which mode applies.

### Step 4 — Scope resolution
The system chooses which memory/state domains can participate.

### Step 5 — Candidate context discovery
The system retrieves candidate records from the persistence layer and linked retrieval structures.

### Step 6 — Filtering and ranking
The system removes noise and ranks the most useful records.

### Step 7 — Bundle packing
The system creates a bounded package for the target model/runtime.

### Step 8 — Model execution via adapter
The model receives:
- user/task input;
- bounded bundle;
- system contract;
- orchestrator tools.

### Step 9 — Optional controlled expansion
If more information is needed, the model requests it through tools.

### Step 10 — Final model output
The task is completed.

### Step 11 — Writeback proposal handling
The orchestrator receives memory/state/handoff candidates.

### Step 12 — Write gating and routing
The governance layer decides what becomes canonical.

### Step 13 — Persistence and derived updates
Storage and derived context surfaces are updated.

### Step 14 — Audit trail capture
Selection, packing, and write decisions are logged.

This loop defines the architecture more strongly than any single storage choice.

---

## 6. The four internal control loops

The architecture should be understood as four interacting loops.

## 6.1. Read Loop
Responsible for:
- finding candidate context;
- deciding what to show now;
- keeping context bounded.

Primary subsystems:
- intake;
- intent resolver;
- scope resolver;
- selector;
- retrieval/index helpers.

## 6.2. Pack Loop
Responsible for:
- formatting selected context;
- shaping sections;
- budget-aware bundling;
- target-model adaptation.

Primary subsystems:
- bundle packer;
- provider adapter;
- tool hints and metadata shaping.

## 6.3. Write Loop
Responsible for:
- accepting structured candidates;
- validating them;
- deciding memory vs state;
- updating canonical records.

Primary subsystems:
- write gate;
- policy engine;
- storage manager;
- dedup/conflict logic.

## 6.4. Handoff Loop
Responsible for:
- continuity transfer across steps, sessions, and agents;
- explicit portable artifacts;
- survivable state movement.

Primary subsystems:
- handoff engine;
- summary engine;
- scope logic;
- audit trail.

---

## 7. Architectural separation of concerns

A strong version of the system depends on hard separation between certain concerns.

### 7.1. Storage vs Orchestration
Storage keeps records.
Orchestration decides relevance, boundedness, and usage.

### 7.2. Model vs Context Authority
The model consumes and proposes.
The orchestrator governs and decides.

### 7.3. Retrieval vs Continuity
Retrieval finds candidates.
Continuity preserves meaningful progression across time.

### 7.4. Memory vs State
Memory captures durable context.
State captures what is active now.

### 7.5. Canonical vs Derived
Canonical records are durable truth-bearing structures.
Derived artifacts are summaries, bundles, and briefs built from canonical layers.

If these distinctions collapse, the architecture weakens quickly.

---

## 8. Canonical storage architecture role

Even though this document is not the detailed storage spec, the high-level storage architecture must already be visible here.

The persistence layer should contain at least these conceptual stores:

### 8.1. Event Store
Stores the chronological truth trail.

### 8.2. Memory Store
Stores durable typed memory objects.

### 8.3. State Store
Stores active workflow and task state.

### 8.4. Relation Store or Graph Layer
Stores links between entities.

### 8.5. Derived Artifact Store
Stores summaries, handoff briefs, bundle artifacts, and similar derived outputs.

### 8.6. Index Layer
Supports retrieval, ranking, and lookup.

### 8.7. Audit Store
Stores decision traces and system accountability artifacts.

The storage architecture should remain layered rather than flattened into one corpus.

---

## 9. Canonical model interaction architecture

The model should not be treated as a passive recipient of a monolithic prompt.
The architecture should support a controlled interaction model.

### 9.1. Model input contract
The model receives:
- task input;
- system behavior contract;
- bounded context bundle;
- explicit tools.

### 9.2. Model expansion path
The model can request more context through explicit interfaces.

### 9.3. Model writeback path
The model can submit structured candidates, not canonical writes.

### 9.4. Model isolation rule
The model should not hold raw authority over full context or canonical memory.

This is what keeps the architecture governed rather than magical.

---

## 10. MCP and API architecture role

MCP and API layers should be treated as interface architecture, not as the whole product.

### 10.1. MCP role
MCP should expose:
- tools;
- bounded resource views;
- prompt-support surfaces where useful;
- governed context access paths.

### 10.2. API role
API should expose:
- request submission;
- bundle retrieval;
- state queries;
- audit queries;
- writeback and handoff operations;
- system administration functions where appropriate.

### 10.3. Architectural rule

> MCP and API are the delivery surfaces of the system, not the source of its intelligence.

---

## 11. Provider adapter architecture

To remain provider-agnostic, the system should include an explicit provider adapter layer.

This layer should account for:
- tool-calling differences;
- context window differences;
- schema or formatting differences;
- provider-specific capabilities;
- runtime-specific constraints.

The provider adapter layer should adapt the bundle and tool surface without altering the core system semantics.

This layer should be thin enough to avoid hiding core logic, but strong enough to prevent provider coupling from spreading inward.

---

## 12. Governance architecture

Governance is not an optional add-on.
It is a first-class architectural zone.

Its responsibilities include:
- permissions;
- visibility;
- write admissibility;
- duplicate handling;
- conflict rules;
- retention;
- TTL behavior;
- archival decisions;
- explainability;
- audit capture.

### Architectural rule

> No canonical memory or state mutation should bypass the governance layer.

---

## 13. Handoff architecture role

Handoff should be treated as a dedicated subsystem, not just a summary afterthought.

Handoff architecture exists because continuity must survive transitions:
- session to session;
- agent to agent;
- workflow step to workflow step;
- provider to provider.

A strong system should create explicit handoff artifacts that are:
- bounded;
- typed;
- traceable;
- scoped;
- portable.

---

## 14. Derived context architecture

Derived context should not be confused with canonical storage.
It is a separate architectural layer that exists to make the system usable.

Examples of derived context surfaces:
- rolling summaries;
- current state briefs;
- handoff briefs;
- digest views;
- packed bundles;
- provider-specific packed variants.

Derived context improves operational performance, but should remain regenerable from canonical layers.

---

## 15. Audit and evaluation architecture

The system should be architected for inspection, not blind trust.

The audit/evaluation layer should answer questions such as:
- why was this bundle created?
- which candidates were considered and rejected?
- why was this memory stored?
- why was this state updated?
- what policy rule was applied?
- how much context was sent?
- did boundedness degrade?

This layer makes future optimization and reliability work possible.

---

## 16. Target deployment shape

At the architectural level, the system should be deployable as an external service.

That means it should remain conceptually valid as:
- a standalone service;
- a local service for personal workflows;
- a self-hosted system;
- a cloud service;
- a multi-client context backend.

Its architecture should not require being embedded inside one product shell to make sense.

---

## 17. Architectural invariants

The following invariants should hold across future implementation details.

### 17.1. The model never owns canonical context authority.
### 17.2. The orchestrator never degrades into raw storage.
### 17.3. Context bundles remain bounded and task-shaped.
### 17.4. Memory and state remain distinct.
### 17.5. Canonical and derived layers remain distinct.
### 17.6. Provider-specific logic remains outside core semantics.
### 17.7. All canonical writes pass through governance.
### 17.8. Handoff remains an explicit architectural function.
### 17.9. Audit remains available for major decisions.

These invariants are more important than most low-level choices.

---

## 18. Failure patterns this architecture is meant to prevent

This architecture exists to prevent:
- context bloat;
- chat-history dependency;
- hidden prompt stuffing;
- ungoverned memory growth;
- provider lock-in;
- loss of state between sessions;
- weak cross-agent transfer;
- inability to explain context decisions;
- retrieval-only simplification of a larger continuity problem.

---

## 19. Architecture summary in one view

### External side
Clients and runtimes invoke the system through MCP or API.

### Interface side
Integration surfaces expose explicit context capabilities.

### Core side
The orchestration layer decides what context matters now.

### Control side
Governance decides what is allowed, canonical, visible, and retained.

### Persistence side
Canonical and derived context surfaces are stored in layered form.

### Execution side
Provider adapters deliver bounded context into concrete model environments.

This is the full architectural picture.

---

## 20. What this document enables next

Once this overview is accepted, the next files become more grounded:

1. Core Concepts and Terminology
2. Canonical Data Model
3. Read Path Architecture
4. Bundle Packing Architecture
5. Write Path Architecture
6. Handoff Architecture
7. MCP and API Integration Architecture

This is why the architecture overview should come before detailed schemas.

---

## 21. Final statement

The Personal Context Orchestrator should be architected as a multi-layer external context service.

Its strength will come not from one algorithm or one database choice, but from the coordinated architecture that keeps context selection, packing, continuity, writeback, governance, portability, and integration under explicit control.
