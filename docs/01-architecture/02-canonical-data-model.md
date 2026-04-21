# Canonical Data Model

## 0. Purpose of this document

This document defines the canonical data model of the Provider-Agnostic Personal Context Orchestrator.

Its role is to answer the following questions:
- what are the core entities of the system;
- which entities are canonical and which are derived;
- how memory, state, events, bundles, handoffs, and audit records differ;
- what fields and relationships each entity should have;
- what must remain stable across implementations and providers.

This is the semantic backbone of the platform.

---

## 1. Core data model thesis

The system must not store context as one undifferentiated corpus.
It must operate on a layered, typed, governed data model.

### Canonical statement

> The platform should represent context as typed entities with explicit lifecycle, scope, provenance, and relationships, not as a raw prompt archive.

This is what makes continuity, portability, bounded selection, and governance possible.

---

## 2. Data model design principles

The canonical data model should follow these principles:

### 2.1. Typed semantics
Each record class must have a defined meaning.

### 2.2. Canonical vs derived separation
Canonical records must remain distinct from computed artifacts.

### 2.3. Memory vs state separation
Durable continuity and active progression must remain separate.

### 2.4. Provenance-first
Every durable record should be traceable to a source or derivation path.

### 2.5. Scope-aware representation
Every major record should declare where it belongs and where it may be used.

### 2.6. Lifecycle-aware representation
Records should have status and time semantics, not just content.

### 2.7. Provider-neutral core
Core entity semantics should not depend on one provider’s API model.

---

## 3. Canonical entity families

The full data model is built from 7 entity families:

1. **Identity and Scope Entities**
2. **Chronology Entities**
3. **Canonical Context Entities**
4. **Derived Context Entities**
5. **Governance Entities**
6. **Integration Entities**
7. **Relationship Entities**

Each family serves a distinct purpose.

---

## 4. Identity and Scope Entities

These entities anchor context to owners, subjects, sessions, workflows, and domains.

### 4.1. Subject
Represents the entity that a record is about.

Typical subject types:
- user;
- project;
- task;
- workflow;
- agent;
- artifact;
- workspace.

Minimum canonical fields:
- `subject_id`
- `subject_type`
- `display_name`
- `external_refs`
- `created_at`
- `updated_at`

### 4.2. Owner
Represents the entity that owns or logically controls a record within the system.

Minimum canonical fields:
- `owner_id`
- `owner_type`
- `display_name`
- `external_refs`

### 4.3. Scope
Represents the logical domain boundary of a record.

Canonical scope values should support at least:
- `global_user`
- `workspace`
- `project`
- `workflow`
- `task`
- `session`
- `agent_local`
- `shared_agent`
- `organization`
- `external_source`

Minimum canonical fields:
- `scope_id`
- `scope_type`
- `scope_key`
- `parent_scope_id` (nullable)
- `created_at`

### 4.4. Session
Represents a bounded interaction context.

Minimum canonical fields:
- `session_id`
- `subject_id`
- `scope_id`
- `client_id`
- `started_at`
- `ended_at` (nullable)
- `status`

### 4.5. Workflow
Represents an ongoing multi-step process.

Minimum canonical fields:
- `workflow_id`
- `subject_id`
- `scope_id`
- `workflow_type`
- `status`
- `started_at`
- `updated_at`
- `ended_at` (nullable)

---

## 5. Chronology Entities

Chronology entities record what happened over time.

### 5.1. Event
Event is the canonical chronological unit.

Examples:
- user message
- model response
- tool call
- tool result
- state change
- candidate submission
- write decision
- handoff creation

Minimum canonical fields:
- `event_id`
- `event_type`
- `subject_id`
- `owner_id`
- `scope_id`
- `session_id` (nullable)
- `workflow_id` (nullable)
- `actor_type`
- `actor_id` (nullable)
- `timestamp`
- `payload`
- `source_ref` (nullable)
- `correlation_id` (nullable)

### 5.2. Event Stream Reference
Optional logical grouping of events.

Minimum canonical fields:
- `stream_id`
- `stream_type`
- `subject_id`
- `scope_id`

The system may implement event grouping differently, but the concept should remain valid.

---

## 6. Canonical Context Entities

These are the core governed truth surfaces of the platform.

## 6.1. Memory Object

### Purpose
Represents durable reusable context.

### Canonical subtypes
At minimum, support:
- `fact`
- `preference`
- `constraint`
- `goal`
- `relationship_note`
- `decision`
- `open_loop`
- `profile_attribute`
- `risk_note`
- `artifact_reference`
- `instruction_preference`
- `continuity_note`

### Minimum canonical fields
- `memory_id`
- `memory_type`
- `subject_id`
- `owner_id`
- `scope_id`
- `content`
- `normalized_content` (nullable)
- `confidence`
- `importance`
- `freshness_score` (nullable)
- `status`
- `visibility`
- `created_at`
- `updated_at`
- `valid_from` (nullable)
- `valid_to` (nullable)
- `source_event_ids`
- `source_refs`
- `policy_tags`
- `dedup_key` (nullable)
- `version`

### Canonical statuses
At minimum:
- `active`
- `tentative`
- `superseded`
- `archived`
- `invalidated`

### Notes
A memory object is canonical only after passing governance.

---

## 6.2. State Object

### Purpose
Represents active operational progression.

### Canonical subtypes
At minimum, support:
- `workflow_step`
- `task_state`
- `pending_question`
- `checkpoint`
- `waiting_state`
- `mode_state`
- `branch_state`
- `blocked_state`
- `draft_state`

### Minimum canonical fields
- `state_id`
- `state_type`
- `subject_id`
- `owner_id`
- `scope_id`
- `session_id` (nullable)
- `workflow_id` (nullable)
- `content`
- `status`
- `priority` (nullable)
- `started_at` (nullable)
- `updated_at`
- `expires_at` (nullable)
- `source_event_ids`
- `policy_tags`
- `version`

### Canonical statuses
At minimum:
- `active`
- `paused`
- `completed`
- `abandoned`
- `superseded`
- `archived`

### Notes
State should remain operational, not overloaded with durable memory semantics.

---

## 6.3. Artifact Reference

### Purpose
Represents a durable reference to an external artifact relevant to continuity.

Examples:
- document
- file
- repo path
- issue
- PR
- URL
- note
- transcript segment

### Minimum canonical fields
- `artifact_ref_id`
- `subject_id`
- `scope_id`
- `artifact_type`
- `locator`
- `title` (nullable)
- `description` (nullable)
- `source_system`
- `created_at`
- `updated_at`
- `metadata`

This may exist as its own entity or as a memory subtype in implementation, but conceptually it must remain clear.

---

## 7. Derived Context Entities

Derived entities are produced from canonical layers for operational use.
They are important, but they must not replace canonical records.

## 7.1. Context Bundle

### Purpose
Represents the bounded package delivered to a model or agent.

### Minimum canonical fields
- `bundle_id`
- `bundle_type`
- `purpose`
- `target_runtime`
- `target_provider` (nullable)
- `target_model` (nullable)
- `subject_id`
- `scope_ids`
- `generated_at`
- `expires_at` (nullable)
- `token_budget` (nullable)
- `sections`
- `source_record_ids`
- `confidence_notes` (nullable)
- `freshness_notes` (nullable)
- `generation_metadata`

### Bundle sections
The platform should support structured sections such as:
- user frame
- relevant facts
- active state
- open loops
- constraints
- recent decisions
- risks
- artifact refs
- tool hints

---

## 7.2. Summary Artifact

### Purpose
Represents a compressed derived view.

### Summary subtypes
At minimum:
- `session_summary`
- `rolling_summary`
- `project_summary`
- `workflow_summary`
- `state_brief`
- `risk_digest`

### Minimum canonical fields
- `summary_id`
- `summary_type`
- `subject_id`
- `scope_id`
- `content`
- `source_record_ids`
- `generated_at`
- `expires_at` (nullable)
- `generation_metadata`
- `status`

---

## 7.3. Handoff Artifact

### Purpose
Represents an explicit portability unit for continuity transfer.

### Minimum canonical fields
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

### Handoff subtypes
At minimum:
- `session_to_session`
- `agent_to_agent`
- `workflow_step`
- `provider_transfer`

---

## 8. Governance Entities

Governance entities explain and regulate system decisions.

## 8.1. Candidate Record

### Purpose
Represents a proposed but not yet canonical writeback unit.

### Candidate subtypes
At minimum:
- `memory_candidate`
- `state_candidate`
- `handoff_candidate`
- `summary_candidate`

### Minimum canonical fields
- `candidate_id`
- `candidate_type`
- `proposed_record_type`
- `subject_id`
- `owner_id`
- `scope_id`
- `content`
- `proposed_metadata`
- `proposed_by_actor_type`
- `proposed_by_actor_id` (nullable)
- `source_event_ids`
- `submitted_at`
- `status`
- `why_store` (nullable)

### Candidate statuses
At minimum:
- `pending`
- `accepted`
- `rejected`
- `merged`
- `superseded`

---

## 8.2. Decision Record

### Purpose
Represents the outcome of a governance decision.

### Minimum canonical fields
- `decision_id`
- `decision_type`
- `candidate_id` (nullable)
- `target_record_id` (nullable)
- `decision_outcome`
- `applied_policy_rules`
- `reasoning_summary`
- `decided_at`
- `decided_by_actor_type`
- `decided_by_actor_id` (nullable)

### Decision outcomes
At minimum:
- `accepted`
- `rejected`
- `updated_existing`
- `merged`
- `archived`
- `deferred`

---

## 8.3. Policy Record

### Purpose
Represents policy definitions or applied policy state.

### Minimum canonical fields
- `policy_id`
- `policy_type`
- `scope_id` (nullable)
- `subject_id` (nullable)
- `rule_key`
- `rule_definition`
- `status`
- `created_at`
- `updated_at`

This may be implemented differently, but policy must be modelable as first-class governed logic.

---

## 8.4. Audit Record

### Purpose
Represents explainability and accountability information.

### Minimum canonical fields
- `audit_id`
- `audit_type`
- `related_record_ids`
- `event_id` (nullable)
- `decision_id` (nullable)
- `summary`
- `details`
- `created_at`
- `actor_type`
- `actor_id` (nullable)

### Audit subtypes
At minimum:
- `bundle_selection_audit`
- `write_decision_audit`
- `policy_audit`
- `handoff_generation_audit`

---

## 9. Integration Entities

These entities connect the canonical data model to external execution environments.

## 9.1. Client Record

### Purpose
Represents the invoking external system.

### Minimum canonical fields
- `client_id`
- `client_type`
- `display_name`
- `integration_mode`
- `provider_family` (nullable)
- `metadata`

Examples:
- Codex client
- ChatGPT-compatible host
- local runtime
- internal application

---

## 9.2. Runtime Invocation Record

### Purpose
Represents one execution interaction with a runtime.

### Minimum canonical fields
- `invocation_id`
- `client_id`
- `session_id` (nullable)
- `workflow_id` (nullable)
- `bundle_id` (nullable)
- `started_at`
- `completed_at` (nullable)
- `status`
- `provider`
- `model_name` (nullable)
- `tool_usage_summary` (nullable)
- `execution_metadata`

---

## 10. Relationship Entities

Relationships make context traversable and connected.

## 10.1. Relation Edge

### Purpose
Represents a typed relation between two entities.

### Minimum canonical fields
- `relation_id`
- `from_entity_type`
- `from_entity_id`
- `relation_type`
- `to_entity_type`
- `to_entity_id`
- `weight` (nullable)
- `created_at`
- `updated_at`
- `status`
- `source_ref` (nullable)

### Example relation types
- `belongs_to`
- `relates_to`
- `depends_on`
- `derived_from`
- `supersedes`
- `references`
- `blocks`
- `continues_from`
- `owned_by`

### Canonical rule

> Relations are not optional decoration. They are part of the continuity model.

---

## 11. Canonical vs derived model map

The data model should make this distinction explicit.

### Canonical entities
- subject
- owner
- scope
- session
- workflow
- event
- memory object
- state object
- artifact reference
- candidate record
- decision record
- policy record
- audit record
- relation edge
- runtime invocation record
- client record

### Derived entities
- context bundle
- summary artifact
- handoff artifact
- packed provider-specific variants
- digest views

### Rule

Derived entities may be stored, cached, versioned, and reused, but they should remain reconstructible from canonical layers where practical.

---

## 12. Required cross-entity fields

Across many entity classes, the following fields should appear consistently where relevant:

- `id`
- `type`
- `subject_id`
- `owner_id`
- `scope_id`
- `status`
- `created_at`
- `updated_at`
- `source_refs`
- `policy_tags`
- `version`

These recurring fields help preserve system-wide consistency.

---

## 13. Lifecycle model

Most canonical record types should support lifecycle semantics.

### Minimum shared lifecycle states
Where relevant, entities should support concepts such as:
- active
- tentative
- pending
- superseded
- archived
- invalidated
- completed

Not every entity needs every state value, but lifecycle must be explicit.

---

## 14. Time semantics

The data model should distinguish among multiple time meanings.

### Core time fields
- `created_at` — when the record was created
- `updated_at` — when it was last modified
- `valid_from` — when its semantic validity starts
- `valid_to` — when its semantic validity ends or expires
- `started_at` — when a process/state began
- `ended_at` — when it ended
- `generated_at` — when a derived artifact was produced
- `expires_at` — when it should no longer be treated as fresh/active by default

### Canonical rule

> Creation time is not enough. Context records need explicit validity and activity time semantics.

---

## 15. Visibility and access semantics

Most important canonical records should support visibility semantics.

### Minimum visibility ideas
At minimum the model should support concepts such as:
- private
- subject-scoped
- shared-agent
- workspace-visible
- system-internal

Exact enforcement may vary in implementation, but visibility must be representable in the model.

---

## 16. Confidence, importance, freshness

These must be first-class operational attributes, not implicit guesses.

### Confidence
How reliable or stable the record appears.

### Importance
How likely it is to matter again.

### Freshness
How timely or currently usable it is.

These fields should be attachable at least to memory objects, bundles, summaries, and potentially state objects.

---

## 17. Minimal relationship map

The system should conceptually support these key relationships:

- subject -> scope
- subject -> workflow
- workflow -> session
- session -> event
- event -> candidate
- candidate -> decision
- decision -> canonical record
- memory object -> source event
- state object -> source event
- summary -> source records
- bundle -> source records
- handoff -> source records
- invocation -> bundle
- invocation -> client
- relation edge -> linked canonical records

This relationship map is central to continuity and auditability.

---

## 18. Normalization stance

The canonical model should be semantically normalized, but not dogmatically over-normalized.

That means:
- enough separation to preserve meaning;
- enough explicit relationships to support audit and continuity;
- not so much fragmentation that the model becomes unusable.

The system should privilege semantic clarity over theoretical database elegance.

---

## 19. What must remain stable across implementations

Even if storage technology changes, these things should remain stable:
- entity families;
- memory vs state distinction;
- candidate vs canonical distinction;
- canonical vs derived distinction;
- scope semantics;
- provenance requirement;
- lifecycle fields;
- relationship model;
- governance-linked decision records.

These are platform semantics, not implementation accidents.

---

## 20. Failure signs in the data model

The data model is drifting in the wrong direction if:
- memory and state are merged into one record type;
- summaries are treated as the only durable truth;
- bundles are treated as storage;
- candidates are written as canonical records directly;
- provenance disappears;
- scope becomes optional or vague;
- relationships are absent;
- provider-specific concepts leak into core entities;
- raw chat history becomes the de facto model.

---

## 21. Canonical data model summary

### Identity and scope
- subject
- owner
- scope
- session
- workflow

### Chronology
- event
- event stream reference

### Canonical context
- memory object
- state object
- artifact reference

### Derived context
- context bundle
- summary artifact
- handoff artifact

### Governance
- candidate record
- decision record
- policy record
- audit record

### Integration
- client record
- runtime invocation record

### Relationships
- relation edge

This is the minimum full-system conceptual model.

---

## 22. What this document enables next

Once this model is accepted, the next files become much more precise:

1. Read Path Architecture
2. Bundle Packing Architecture
3. Write Path Architecture
4. Handoff Architecture
5. MCP and API Integration Architecture
6. Tool Contract Specification

This is why the canonical data model should exist before interface details.

---

## 23. Final statement

The Personal Context Orchestrator should be built on a typed canonical data model with explicit semantic categories, lifecycle, provenance, scope, and relationships.

That model is what allows the system to behave like a true context infrastructure layer rather than a prompt archive with extra steps.
