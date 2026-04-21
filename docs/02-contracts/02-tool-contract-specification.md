# Tool Contract Specification

## 0. Purpose of this document

This document defines the canonical tool contract surface of the Provider-Agnostic Personal Context Orchestrator.

Its role is to specify the external operations through which models, agents, hosts, and client systems interact with the orchestrator’s core capabilities.

This document answers questions such as:
- what tools the system should expose;
- how those tools map to the platform’s operational contours;
- what each tool means semantically;
- what inputs and outputs each tool family should support;
- how tool contracts preserve provider-agnostic semantics across MCP and API surfaces;
- which tool behaviors are mandatory, optional, or restricted by capability class.

This is not the protocol transport document.
It is the **semantic contract layer for externally invokable operations**.

---

## 1. Tool contract thesis

The tool surface is the external operational language of the orchestrator.

### Canonical statement

> Tools must expose the orchestrator’s real system operations, not generic storage actions and not hidden prompt side effects.

A strong tool surface should mirror the system’s true contours:
- read;
- pack;
- write;
- handoff;
- audit;
- governance-aware inspection.

The tool layer should not be a disguised CRUD surface over internal tables.

---

## 2. Tool contract place in the overall architecture

The tool contract sits between the integration layer and the core orchestration layer.

### Position in the architecture
- external client or host
- MCP/API integration layer
- tool contract semantics
- core orchestration layer
- governance and persistence layers

The tool contract is the stable semantic boundary the client sees.

### Rule

> A transport may change, but the meaning of a tool should remain stable.

---

## 3. Tool design principles

The tool surface should follow these principles.

### 3.1. Operation-first, not storage-first
Tools should expose what the system does, not how data happens to be stored.

### 3.2. Provider-agnostic semantics
Tool meaning should remain stable across model hosts and protocol layers.

### 3.3. Typed outputs
Tools should return structured results, not only free-form text.

### 3.4. Explicit boundedness
Tools should make bounded context behavior visible where relevant.

### 3.5. Governance-aware results
Tools should expose decisions and rejections explicitly, not hide them.

### 3.6. Contour alignment
Tools should map cleanly to read, pack, write, handoff, audit, and governance concerns.

### 3.7. Capability-aware exposure
Not every client should receive every tool.

### Rule

> The tool surface should make the orchestrator legible, not magical.

---

## 4. Canonical tool families

The full system should organize its external tool surface into 6 canonical families:

1. **Read Tools**
2. **Bundle Tools**
3. **Write Tools**
4. **Handoff Tools**
5. **Audit and Inspection Tools**
6. **Policy and Capability Tools**

These families should remain semantically distinct.

---

## 5. Read tool family

Read tools are used to acquire or expand relevant context before or during execution.

### Canonical read tools
At minimum, the system should support the following read-oriented operations:

#### 5.1. `get_context_bundle`
Return a bounded context bundle for the current task or request.

#### 5.2. `expand_context`
Request additional bounded context beyond the current bundle.

#### 5.3. `search_related_memory`
Search or discover related memory objects within allowed scopes.

#### 5.4. `get_active_state`
Return currently active state relevant to the subject, scope, task, or workflow.

#### 5.5. `get_recent_decisions`
Return recent decisions relevant to the current continuity problem.

#### 5.6. `get_open_loops`
Return unresolved or still-active open loops.

#### 5.7. `get_relevant_artifacts`
Return artifact references relevant to the current task or handoff.

### Rule

> Read tools should expose bounded acquisition behavior, not unrestricted memory browsing.

---

## 6. Bundle tool family

Bundle tools are used when the client/runtime explicitly needs delivery artifacts rather than raw selected candidates.

### Canonical bundle tools
At minimum:

#### 6.1. `get_context_bundle`
Primary bundle retrieval tool.

#### 6.2. `rebuild_context_bundle`
Force regeneration of a bundle under a new strategy, budget, or target runtime.

#### 6.3. `explain_bundle_selection`
Explain why a specific bundle contains what it contains.

#### 6.4. `get_bundle_metadata`
Return bundle metadata without necessarily returning the whole payload.

### Rule

> Bundle tools should expose derived delivery artifacts as first-class objects, not only implicit prompt material.

---

## 7. Write tool family

Write tools are used to submit proposed changes into the write path.

### Canonical write tools
At minimum:

#### 7.1. `save_memory_candidate`
Submit a structured memory proposal.

#### 7.2. `save_state_update_candidate`
Submit a structured state update proposal.

#### 7.3. `submit_write_signal`
Submit a broader post-execution writeback signal when the client does not want to pre-classify it fully.

#### 7.4. `refresh_summary_candidate`
Request summary regeneration or summary refresh based on changed continuity.

#### 7.5. `resolve_context_conflict`
Submit or request resolution of a detected continuity conflict when a client/runtime needs explicit handling.

### Rule

> Write tools should submit proposals and signals, not perform direct canonical mutation.

---

## 8. Handoff tool family

Handoff tools are used to create, retrieve, refresh, or consume continuity transfer artifacts.

### Canonical handoff tools
At minimum:

#### 8.1. `create_handoff_candidate`
Submit a request or proposal to create a handoff artifact.

#### 8.2. `get_handoff_brief`
Return a bounded handoff artifact for a specified target context.

#### 8.3. `refresh_handoff`
Force handoff regeneration when continuity has materially changed.

#### 8.4. `consume_handoff`
Mark or process a handoff as being used by a downstream context where explicit consumption tracking is desired.

#### 8.5. `list_available_handoffs`
Return handoff artifacts available for the subject/scope/context.

### Rule

> Handoff tools should expose continuity transfer explicitly, not hide it inside summaries or read calls.

---

## 9. Audit and inspection tool family

Audit and inspection tools expose explainability, decision traces, and inspection surfaces.

### Canonical audit tools
At minimum:

#### 9.1. `explain_bundle_selection`
Explain why a bundle was built the way it was.

#### 9.2. `get_write_decision_trace`
Return the decision history for a candidate or resulting canonical record.

#### 9.3. `get_record_provenance`
Return where a memory/state/handoff/summary record came from.

#### 9.4. `inspect_continuity_state`
Return a structured view of current continuity surfaces.

#### 9.5. `get_audit_view`
Return audit-friendly traces for a specified request, session, workflow, or subject.

### Rule

> Inspection tools should make the system debuggable without exposing raw internals carelessly.

---

## 10. Policy and capability tool family

These tools expose the controlled edges of permissions, policies, and capability visibility.

### Canonical policy/capability tools
At minimum:

#### 10.1. `get_policy_view`
Return the effective policy surface relevant to the current request or client.

#### 10.2. `get_available_capabilities`
Return which tool families or operations are available to the current client.

#### 10.3. `validate_scope_access`
Check whether a requested scope is accessible for this client/request.

#### 10.4. `preview_write_admissibility`
Optionally preview whether a write candidate would be admissible before full submission.

### Rule

> Capability and policy surfaces should be explicit enough to reduce hidden interface assumptions.

---

## 11. Canonical minimum tool set

The minimum full-system canonical tool set should include at least:

1. `get_context_bundle`
2. `expand_context`
3. `search_related_memory`
4. `get_active_state`
5. `get_handoff_brief`
6. `save_memory_candidate`
7. `save_state_update_candidate`
8. `create_handoff_candidate`
9. `refresh_summary_candidate`
10. `explain_bundle_selection`
11. `resolve_context_conflict`
12. `get_policy_view`

These tools were already implied by prior documents and are here elevated into a formal contract baseline.

---

## 12. Canonical tool semantics

Each tool should have a stable semantic contract.

### Example principle
`get_context_bundle` should always mean:
- retrieve or generate a bounded context bundle for a task/context,
not:
- dump all memory,
not:
- return raw storage rows,
not:
- implicitly perform writeback.

The same principle applies to every tool.

### Rule

> Tool names should correspond to stable platform meanings, not surface-specific convenience behavior.

---

## 13. Common input structure expectations

Although each tool will have its own schema, the tool surface should converge around recurring input concepts.

### Recurring input dimensions
At minimum, many tools will need some subset of:
- `subject_id`
- `scope_id` or `scope_ids`
- `session_id` (nullable)
- `workflow_id` (nullable)
- `request_id` (nullable)
- `target_runtime` (nullable)
- `target_provider` (nullable)
- `target_model` (nullable)
- `mode` (nullable)
- `budget_hint` (nullable)
- `client_id` (implicit or explicit)
- `correlation_id` (nullable)

### Rule

> Tool schemas should reuse canonical system dimensions rather than invent per-tool naming drift.

---

## 14. Common output structure expectations

Tools should return typed structured results rather than ambiguous text-only outputs.

### Recurring output families
At minimum, the tool surface should support outputs such as:
- `bundle_result`
- `context_expansion_result`
- `candidate_submission_result`
- `write_decision_result`
- `handoff_result`
- `audit_result`
- `policy_result`
- `capability_result`
- `rejection_result`

### Rule

> Tools should return results that preserve the system’s semantic object model.

---

## 15. Read tool contract behavior

Read-oriented tools should preserve the following semantics.

### 15.1. `get_context_bundle`
Should:
- accept request/task context;
- apply read and pack loops;
- return a structured bounded bundle.

Should not:
- bypass scope governance;
- return full memory by default;
- silently persist new canonical records.

### 15.2. `expand_context`
Should:
- request additional bounded context;
- preserve task continuity;
- return controlled expansion, not unlimited browsing.

Should not:
- become a hidden “show me everything” escape hatch.

### 15.3. `search_related_memory`
Should:
- search within permitted scopes;
- return context objects or references in a typed way.

Should not:
- act like a raw vector database query tool divorced from orchestration semantics.

---

## 16. Write tool contract behavior

Write-oriented tools should preserve the following semantics.

### 16.1. `save_memory_candidate`
Should:
- submit a memory proposal;
- return a candidate submission result or decision result.

Should not:
- create canonical memory unilaterally.

### 16.2. `save_state_update_candidate`
Should:
- submit an operational state proposal;
- preserve distinction from durable memory.

Should not:
- write durable memory by accident.

### 16.3. `submit_write_signal`
Should:
- submit broader post-execution writeback context when structured candidate extraction is delegated inward.

Should not:
- bypass write-time governance.

---

## 17. Handoff tool contract behavior

Handoff-oriented tools should preserve the following semantics.

### 17.1. `create_handoff_candidate`
Should:
- request or propose transfer-oriented continuity packaging.

Should not:
- behave like a generic summary request.

### 17.2. `get_handoff_brief`
Should:
- return a typed transfer artifact;
- remain target-context-aware.

Should not:
- simply echo the latest session summary without handoff semantics.

### 17.3. `refresh_handoff`
Should:
- regenerate a handoff when state or continuity materially changed.

Should not:
- create redundant duplicate handoffs automatically.

---

## 18. Audit tool contract behavior

Audit tools should preserve inspection semantics.

### They should
- explain,
- trace,
- justify,
- inspect.

### They should not
- mutate canonical records by default;
- expose raw internal structures carelessly;
- flatten explanations into vague text with no linkage to request, candidate, or record IDs.

### Rule

> Audit tools are for explainability surfaces, not hidden admin shortcuts.

---

## 19. Policy and capability tool behavior

Policy/capability tools should expose controlled insight into what the client may do and why.

### They should
- make permission boundaries legible;
- expose admissibility, scope, and policy-relevant views;
- reduce guessing by external clients.

### They should not
- let the client rewrite policy through read-only inspection operations;
- make governance optional.

---

## 20. Tool contracts and MCP

When exposed through MCP, tools should map cleanly into MCP tool semantics.

### MCP mapping concerns
At minimum:
- tool discoverability;
- argument schema clarity;
- result shape clarity;
- no hidden mutation behind read-oriented tool names;
- no semantic mismatch between MCP tool name and canonical platform meaning.

### Rule

> MCP tool exposure should reveal canonical operations, not host-specific improvisations.

---

## 21. Tool contracts and direct API

When exposed through direct API, the same tool semantics may appear as endpoints or operation calls.

### API mapping concerns
At minimum:
- strong input schemas;
- strong typed responses;
- idempotency or dedup semantics where relevant;
- explicit error classes;
- preserved candidate vs canonical distinctions.

### Rule

> API form may differ from MCP form, but operation meaning must remain the same.

---

## 22. Tool capability classes

The system should not assume all clients can invoke all tools.

### Suggested capability classes
At minimum:
- `read_basic`
- `read_expand`
- `write_candidate`
- `handoff_access`
- `audit_inspect`
- `policy_inspect`
- `admin_control` (optional control-plane extension)

### Why
Capability classes help preserve governance and controlled surface exposure.

### Rule

> Tool availability should be capability-aware, not globally identical.

---

## 23. Tool contract error semantics

Tools should return meaningful failure categories.

### Important tool-level rejection/error categories
At minimum:
- invalid input
- unsupported capability
- policy rejection
- scope denial
- candidate rejected
- not found
- expired artifact
- transient service failure
- internal orchestration failure

### Rule

> Tool responses should distinguish governance rejection from operational failure.

---

## 24. Tool contract versioning

The system should version tool contracts carefully.

### Versioning should preserve
- operation meaning;
- argument meaning;
- output meaning;
- candidate/canonical distinctions;
- bundle/handoff semantics.

### Versioning should allow
- schema refinement;
- field extension;
- transport-specific improvements.

### Rule

> Contract evolution should not silently redefine what a tool fundamentally means.

---

## 25. Canonical tool metadata

Every tool contract should have canonical metadata at the specification level.

### Minimum contract metadata
At minimum:
- `tool_name`
- `tool_family`
- `purpose`
- `input_schema_summary`
- `output_schema_summary`
- `allowed_capability_classes`
- `mutation_behavior`
- `governance_dependencies`
- `audit_expectations`

### Why
This keeps the tool layer consistent even across multiple surface implementations.

---

## 26. Canonical tool contract record model

The exact implementation may vary, but conceptually the specification should support a tool definition model containing:

- `tool_name`
- `semantic_description`
- `operation_family`
- `input_contract`
- `output_contract`
- `preconditions`
- `postconditions`
- `side_effect_profile`
- `required_capabilities`
- `related_contours`

This is a specification concept even if not stored directly as a runtime record.

---

## 27. Tool contract failure modes

The architecture should explicitly guard against these failure modes:

### 27.1. CRUD drift
Tools become thin wrappers over storage tables rather than system operations.

### 27.2. Semantic drift across surfaces
MCP and API versions of the “same” tool mean different things.

### 27.3. Hidden mutation
A read-sounding tool silently causes canonical writes.

### 27.4. Governance bypass
Some tools let clients mutate context without candidate/declaration semantics.

### 27.5. Naming ambiguity
Tool names are vague enough that clients guess behavior incorrectly.

### 27.6. Output flattening
Typed system outputs are reduced to generic text.

### 27.7. Capability overexposure
Clients gain tools they should not have.

### 27.8. Provider-specific semantics leaking inward
Tool meanings begin reflecting one host’s tool-calling patterns instead of canonical platform meaning.

---

## 28. Architectural invariants for the tool surface

The following must remain true across implementations:

### 28.1. Tools expose canonical platform operations, not storage internals.
### 28.2. Read tools do not imply unrestricted browsing.
### 28.3. Write tools submit candidates or signals, not direct canonical mutations.
### 28.4. Handoff remains its own tool family.
### 28.5. Audit tools remain inspection-oriented.
### 28.6. Policy/capability tools remain explicit.
### 28.7. MCP and API preserve shared tool semantics.
### 28.8. Capability restrictions remain enforceable.

These invariants are central to the system’s external legibility.

---

## 29. Tool contract summary

The tool surface should be understood as the orchestrator’s explicit operational vocabulary.

It turns:
- host/runtime requests,
- model requests,
- client actions,

into:
- read operations,
- bundle operations,
- write proposals,
- handoff operations,
- audit inspections,
- policy-aware interactions.

This is what makes the platform usable as a real external context infrastructure service.

---

## 30. What this document enables next

Once the tool contract surface is defined, the next documents become much more precise:

1. Policy and Governance Specification
2. Audit and Evaluation Specification
3. Provider Adapter Architecture
4. Implementation Decomposition for Coding Agent

This is because the platform now has a stable external operational language.

---

## 31. Final statement

The tool contract surface is where the orchestrator becomes legible to the outside world.

Its quality determines whether external clients interact with a disciplined context infrastructure layer or with a confusing set of host-specific shortcuts and hidden side effects.
