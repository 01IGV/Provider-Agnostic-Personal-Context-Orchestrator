# MCP and API Integration Architecture

## 0. Purpose of this document

This document defines the MCP and API integration architecture of the Provider-Agnostic Personal Context Orchestrator.

Its role is to describe how the system is exposed to external clients, runtimes, and agent environments without collapsing its internal semantics into provider-specific interface patterns.

This document answers questions such as:
- how the orchestrator should appear as an external service;
- what MCP is responsible for in this architecture;
- what direct API is responsible for in this architecture;
- how external clients interact with read, pack, write, and handoff capabilities;
- how provider-agnostic semantics remain stable across multiple integration surfaces;
- how tool, resource, and request boundaries should be structured.

This is not the tool contract specification itself.
It is the architectural definition of the external integration surfaces.

---

## 1. Integration architecture thesis

The system should be consumable as an external context infrastructure service through explicit interfaces rather than hidden runtime coupling.

### Canonical statement

> MCP and API are the delivery surfaces of the orchestrator, not the source of its intelligence.

This means the orchestrator’s core semantics must exist independently of any single protocol, host, or provider runtime.

---

## 2. Why this layer exists

The system is intended to serve multiple execution environments, such as:
- Codex through MCP;
- ChatGPT-compatible MCP host surfaces where supported;
- other agent runtimes;
- custom applications;
- local orchestration systems;
- workflow engines and service backends.

Without an explicit integration architecture, the system would risk:
- collapsing into one runtime’s calling model;
- leaking provider-specific assumptions inward;
- exposing inconsistent semantics across clients;
- duplicating context logic in each integration.

### Rule

> The orchestrator should integrate with many clients through stable surfaces, not be rewritten per host.

---

## 3. Top-level integration model

The integration architecture should expose the orchestrator through two primary surface families:

1. **MCP Surface**
2. **Direct API Surface**

These surfaces should sit above the core orchestration layer and below external clients.

### Architectural placement
- external clients and runtimes
- MCP/API integration layer
- core orchestration layer
- governance and persistence layers

The integration layer should translate external requests into canonical internal envelopes and translate canonical outputs into externally consumable responses.

---

## 4. MCP role in this architecture

MCP should be treated as the standardized interactive capability surface for model-hosted environments.

### MCP is best suited for
- tool-mediated context access;
- resource-style bounded context exposure;
- prompt-support surfaces where appropriate;
- model-driven pull of additional context;
- explicit interaction from agentic runtimes.

### MCP is not
- the whole product;
- the canonical data model;
- the internal orchestration engine;
- the only way the platform is meant to be consumed.

### Architectural role
MCP is the **host-facing capability protocol** of the orchestrator.

### Rule

> MCP should expose orchestrator capabilities cleanly, but should not redefine orchestrator semantics.

---

## 5. Direct API role in this architecture

The direct API should be treated as the structured service surface for applications, backend systems, workflow engines, and runtimes that are not operating through MCP.

### API is best suited for
- direct request submission;
- context bundle retrieval;
- explicit writeback submission;
- state queries;
- handoff operations;
- audit inspection;
- administrative and control-plane operations where appropriate.

### API is not
- a replacement for the orchestrator core;
- a reason to duplicate internal business semantics in multiple endpoints.

### Architectural role
The direct API is the **service interface layer** of the orchestrator.

### Rule

> API should expose the same canonical system semantics as MCP, but through service-oriented request/response forms.

---

## 6. Shared semantic contract across integration surfaces

The core integration requirement is that MCP and API must preserve the same system meaning.

### Must remain stable across surfaces
- request envelope semantics;
- read/pack/write/handoff contours;
- candidate vs canonical distinction;
- memory vs state distinction;
- handoff meaning;
- bundle meaning;
- governance authority;
- auditability expectations.

### May vary by surface
- invocation mechanics;
- transport shape;
- schema nesting style;
- streaming or synchronous behavior;
- host-specific affordances.

### Rule

> Surface differences may change interaction mechanics, but not the meaning of the system.

---

## 7. External client categories

The integration architecture should recognize at least these client families:

### 7.1. MCP Host Client
Examples:
- Codex-like agent hosts
- ChatGPT-compatible MCP host surfaces where available
- desktop agent runtimes with MCP tool and resource support

### 7.2. API Client
Examples:
- backend services
- workflow engines
- local orchestration apps
- custom product backends

### 7.3. Hybrid Client
A client that may use API for orchestration setup and MCP for live context interaction.

### Rule

> Different client types may invoke different surfaces, but all should meet the same canonical system behavior.

---

## 8. Integration responsibilities

The MCP/API integration layer should own the following responsibilities:

### 8.1. Request normalization
Convert external request formats into canonical internal envelopes.

### 8.2. Authentication and client identity handoff
Carry client identity and invocation context into the orchestrator boundary.

### 8.3. Surface-level validation
Reject malformed requests before they reach core orchestration logic.

### 8.4. Response shaping
Convert canonical system outputs into MCP-friendly or API-friendly responses.

### 8.5. Capability exposure
Make the right tools, resources, and operations available to the right client class.

### 8.6. Interface-level audit metadata
Attach or pass through correlation identifiers and invocation metadata.

### Rule

> The integration layer should translate and expose. It should not duplicate core context logic.

---

## 9. MCP surface architecture

The MCP surface should be designed around three capability families:

1. **Tools**
2. **Resources**
3. **Prompt-support artifacts** where useful

### 9.1. MCP Tools
Tools should expose operations where the model/runtime actively requests action or additional context.

### 9.2. MCP Resources
Resources should expose bounded inspectable context surfaces where a host benefits from reading contextual artifacts explicitly.

### 9.3. Prompt-support artifacts
These may exist where the host environment benefits from reusable prompt-side scaffolding, but they must remain subordinate to canonical bundle semantics.

### Rule

> MCP should separate active operations from passive context surfaces.

---

## 10. API surface architecture

The direct API should be organized around operation families rather than arbitrary endpoint sprawl.

### 10.1. Request family
Operations that start or continue context-aware execution flows.

### 10.2. Read family
Operations that retrieve bundle-ready or context-oriented outputs.

### 10.3. Write family
Operations that submit candidates, state updates, or continuity-relevant events.

### 10.4. Handoff family
Operations that create, refresh, retrieve, or consume handoff artifacts.

### 10.5. Audit family
Operations that inspect bundle selection, write decisions, or handoff generation traces.

### 10.6. Control family
Administrative or configuration-facing operations where necessary.

### Rule

> API design should map to the system’s operational contours, not to storage tables or internal code modules.

---

## 11. Canonical integration flow

The integration architecture should support a stable canonical flow regardless of surface.

### Canonical external flow
1. external client invokes MCP tool/resource or API operation
2. integration layer validates and normalizes request
3. canonical request envelope enters orchestrator core
4. orchestrator runs read/pack/write/handoff logic as needed
5. canonical outputs return to integration layer
6. integration layer shapes response for MCP or API consumer

### Rule

> The integration layer should be a stable bridge into canonical orchestration, not an alternate orchestration engine.

---

## 12. Integration and request normalization

Both MCP and API surfaces must converge into the same internal request model.

### Why
If each surface produces different internal semantics, the platform will drift into inconsistent behavior.

### Canonical normalized request dimensions
At minimum:
- client identity
- request type
- subject identity
- session/workflow context
- task signal
- target runtime/provider/model hints
- scope hints
- mode hints
- correlation identifiers

### Rule

> Surface diversity is acceptable only if internal request semantics remain unified.

---

## 13. Integration and response semantics

The integration layer must not flatten all outputs into generic text.

### Important output families
At minimum:
- bundle-oriented outputs
- read results
- write decision results
- handoff artifacts
- audit views
- policy-aware rejection results

### Why
The system produces structured objects with meaning.
That meaning should survive the surface boundary.

### Rule

> MCP and API responses should preserve typed output semantics, not erase them into undifferentiated blobs.

---

## 14. Integration and provider neutrality

The integration layer is one of the main places where provider lock-in can silently enter.

### Common risk
A provider-specific host may encourage:
- provider-specific bundle semantics
- provider-specific memory assumptions
- provider-specific write shortcuts
- provider-specific handoff meaning

### Architectural protection
The integration layer must:
- keep internal semantics canonical;
- isolate provider-specific protocol quirks;
- translate without redefining;
- avoid leaking one host’s assumptions into the shared system model.

### Rule

> Integration should adapt to providers and hosts at the edge, not in the core semantics.

---

## 15. Integration and tool-mediated interaction

One of the central design goals is that the orchestrator remains a tool-mediated system rather than a hidden prompt-stuffing layer.

### This means
- external hosts should call explicit tools or endpoints;
- bundle access should be explicit and bounded;
- context expansion should be explicit;
- writeback should be explicit;
- handoff creation and retrieval should be explicit.

### Rule

> Important context operations should be visible at the interface level, not hidden behind implicit side effects.

---

## 16. Integration and read/pack/write/handoff contours

The integration architecture should reflect the platform’s 4 core operational contours.

### Read-facing integration
Clients should be able to request or trigger context acquisition for a current task.

### Pack-facing integration
Clients should be able to receive structured bundle outputs or bundle-like execution surfaces.

### Write-facing integration
Clients should be able to propose structured write candidates or submit write-relevant signals.

### Handoff-facing integration
Clients should be able to request, create, consume, or refresh handoff artifacts.

### Rule

> Integration should expose the operational contours of the system, not bury them under generic catch-all calls.

---

## 17. Integration and client permissions

Not every client should receive the same capability set.

### Examples
At minimum, the architecture should allow differentiation such as:
- read-only client
- read-plus-expand client
- write-candidate client
- handoff-capable client
- audit-capable client
- administrative client

### Why
Capability differences matter for trust, governance, and boundedness.

### Rule

> Capability exposure should be surface-aware and client-aware, not universally open by default.

---

## 18. Integration and observability

The integration layer should participate in observability without becoming the core audit engine.

### It should preserve or attach
At minimum:
- request identifiers
- client identifiers
- runtime hints
- surface type used
- correlation identifiers
- response class
- error class where relevant

### Why
This makes cross-surface debugging and quality evaluation possible.

### Rule

> Integration should preserve traceability across the boundary between client and orchestrator.

---

## 19. Integration and errors

The integration layer should not return opaque failures when canonical system outcomes are more meaningful.

### Error/result families should distinguish among
- malformed request
- unsupported capability
- policy rejection
- scope denial
- write candidate rejection
- runtime shaping failure
- transient service failure
- not-found artifact
- expired handoff or bundle

### Rule

> External clients should be able to distinguish validation failure, governance rejection, and operational failure.

---

## 20. MCP-specific architectural concerns

The MCP surface should account for host-driven model interaction patterns.

### Important concerns
At minimum:
- tool discoverability
- bounded resource exposure
- explicitness of context expansion
- safe writeback proposals
- clean mapping between MCP tool intent and canonical internal operations

### Constraint
The system should avoid designing MCP capabilities that encourage clients to bypass canonical read/pack/write/handoff logic.

### Rule

> MCP capability design should reinforce orchestrator discipline, not encourage shortcutting the system.

---

## 21. API-specific architectural concerns

The API surface should account for service-to-service and workflow-oriented interaction patterns.

### Important concerns
At minimum:
- idempotent write candidate submission where relevant
- explicit operation boundaries
- typed response bodies
- audit-capable result surfaces
- clear separation between direct canonical operations and derived artifact operations

### Rule

> The API should feel like a disciplined service interface, not a thin wrapper over storage internals.

---

## 22. Integration and versioning

The integration architecture should anticipate change without corrupting canonical semantics.

### Versioning should protect
- request envelope meaning
- bundle output meaning
- candidate submission meaning
- handoff artifact meaning
- audit result meaning

### What versioning should not do
It should not silently redefine the core semantics of memory, state, or handoff per client.

### Rule

> Interface versioning should preserve semantic clarity while allowing transport evolution.

---

## 23. Canonical integration data structures

The exact implementation may vary, but conceptually the integration layer should operate on these structures:

### 23.1. External Invocation Envelope
What arrives from MCP or API.

### 23.2. Canonical Request Envelope
Normalized internal request.

### 23.3. Capability Descriptor
What a client is allowed to invoke.

### 23.4. Surface Response Object
What the integration layer returns outward.

### 23.5. Surface Error Object
What the integration layer returns when the request cannot proceed or is rejected.

These are architectural concepts even if implementation names differ.

---

## 24. Integration failure modes

The architecture should explicitly guard against these failure modes:

### 24.1. Surface-semantic drift
MCP and API expose the same system differently enough that meaning diverges.

### 24.2. Provider leakage
One host or provider’s assumptions distort canonical semantics.

### 24.3. Hidden orchestration duplication
Too much orchestration logic moves into surface handlers.

### 24.4. Opaque outputs
Clients cannot tell whether they received a bundle, a decision result, a handoff, or a raw error.

### 24.5. Capability sprawl
Clients receive too many operations with unclear discipline.

### 24.6. Surface bypass
Clients can bypass governance or canonical mutation rules through integration shortcuts.

### 24.7. Storage-shaped API design
The API begins reflecting database layout instead of system operations.

### 24.8. MCP treated as the whole product
The protocol begins to dictate system identity.

---

## 25. Architectural invariants for MCP and API integration

The following must remain true across implementations:

### 25.1. MCP and API are interface layers, not orchestration replacements.
### 25.2. Both surfaces normalize into shared internal semantics.
### 25.3. Surface differences do not redefine memory, state, bundle, or handoff meaning.
### 25.4. Client capabilities remain explicit and governable.
### 25.5. Structured outputs preserve typed system meaning.
### 25.6. Surface implementations do not bypass governance.
### 25.7. Provider-specific quirks remain edge concerns.
### 25.8. Integration remains auditable and traceable.

These invariants are central to the system’s provider-agnostic identity.

---

## 26. Integration summary

The MCP and API integration layer should be understood as the system’s external interaction bridge.

It turns:
- external invocations,
- host/runtime-specific request mechanics,
- capability constraints,

into:
- canonical internal requests,
- canonical orchestration execution,
- typed external responses.

This is what allows the orchestrator to remain one system while serving many client environments.

---

## 27. What this document enables next

Once MCP and API integration architecture is defined, the next contract-level files become much more precise:

1. Tool Contract Specification
2. Policy and Governance Specification
3. Audit and Evaluation Specification
4. Provider Adapter Architecture

This is because the system now has a clear external surface model.

---

## 28. Final statement

MCP and API integration are the architectural edges of the orchestrator.

Their quality determines whether the system remains a clean provider-agnostic context infrastructure layer or becomes fragmented across host-specific integration patterns.
