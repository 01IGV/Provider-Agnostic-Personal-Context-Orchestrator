# Context Gateway and Control Plane Architecture

## 0. Purpose of this document

This document defines the context gateway and control-plane architecture of the Provider-Agnostic Personal Context Orchestrator.

Its role is to clarify the architectural control point that sits above MCP, API, provider adapters, runtime surfaces, and concrete handlers.

This document is not a runtime implementation plan.
It does not introduce actual MCP handlers, API controllers, provider SDK calls, or transport execution.
It defines the system boundary that must exist before those runtime layers are implemented.

---

## 1. Core thesis

The orchestrator should be understood as a provider-agnostic context gateway and control plane for AI models and agents.

### Canonical statement

> MCP and API are surface protocols. The context gateway is the policy-aware control point that decides what context, state, memory, capabilities, and handoff artifacts may be exposed, transferred, written back, or withheld.

This means the core system must remain independent from any single protocol or model host.

---

## 2. What the context gateway is

The context gateway is the controlled boundary between:
- external clients and runtimes;
- model and agent execution environments;
- context storage and derived context artifacts;
- governance and policy engines;
- provider and execution adapters;
- canonical read, pack, write, and handoff contours.

Its role is to mediate context authority.

It answers questions such as:
- which client or runtime is calling?
- what subject or user does the request concern?
- what capabilities may be exposed?
- which scopes are relevant and allowed?
- what context bundle may be delivered?
- what expansion is allowed?
- what writeback candidates may be accepted for governance review?
- what handoff or state transfer is permitted?
- what audit and provenance records must be attached?

---

## 3. What the context gateway is not

The context gateway is not:
- a plain MCP server;
- a generic API router;
- a provider SDK wrapper;
- a vector search gateway;
- a generic agent framework;
- a task execution engine;
- a storage proxy.

It may expose or consume all of these surfaces, but it must not be reduced to any of them.

---

## 4. MCP and API are surfaces, not the control plane

MCP and API are necessary integration surfaces.
They provide protocol-specific ways to expose tools, resources, prompts, operations, and responses.

They do not own:
- context selection;
- bounded bundle construction;
- canonical writeback decisions;
- authority delegation;
- provenance chain evaluation;
- policy enforcement;
- audit semantics;
- continuity management.

### Architectural invariant

> Protocol surfaces may expose capabilities, but they must not redefine core context semantics.

---

## 5. Control-plane responsibilities

The control plane coordinates the decision surfaces that determine how context moves through the system.

Minimum responsibilities:

1. **Capability registry**
   - what tools, resources, operations, and bundles exist;
   - which clients or runtimes may see them;
   - what mode or scope each capability supports.

2. **Policy enforcement point**
   - what can be read, packed, written, transferred, preserved, suppressed, or explained;
   - which scopes and identities are eligible;
   - what requires review or rejection.

3. **Context bundle mediation**
   - how candidate context becomes bounded bundles;
   - how bundles are shaped for models and runtimes;
   - why the selected context is sufficient and bounded.

4. **Writeback gate**
   - how model or agent outputs become candidates;
   - how candidates are classified;
   - when candidates become canonical memory, state, handoff, audit record, or no-op.

5. **Identity and delegation boundary**
   - who is acting;
   - on behalf of whom;
   - under what authority;
   - with what revocation path.

6. **Audit and provenance trail**
   - why a context object was exposed;
   - why a capability was allowed;
   - why a writeback was accepted or rejected;
   - which identity and delegation chain was involved.

7. **Runtime boundary discipline**
   - where planning ends;
   - where actual handler execution begins;
   - how delivery and transport-specific logic stays outside core semantics.

---

## 6. Gateway placement in the system

The gateway/control-plane boundary sits logically between:

1. **External clients and runtimes**
2. **MCP/API/runtime surfaces**
3. **Gateway/control-plane decisions**
4. **Core orchestration contours**
5. **Governance and policy**
6. **Persistence and derived context**
7. **Provider and execution adapters**

The gateway should not replace the core orchestration layer.
It coordinates access into it.

---

## 7. Capability exposure model

Capabilities should be exposed through a governed registry rather than hardcoded surface behavior.

A capability exposure decision should consider:
- client identity;
- subject identity;
- runtime identity;
- agent identity where applicable;
- delegated authority;
- requested operation family;
- allowed scope;
- surface type;
- current mode;
- policy restrictions;
- audit requirements.

### Rule

> A capability being technically available does not mean it is authorized for the current client, subject, scope, runtime, or delegation context.

---

## 8. Context access model

The gateway should never expose raw context storage by default.

Correct access pattern:
1. request enters through a surface;
2. gateway validates identity, capability, and scope;
3. read path selects candidate context;
4. governance filters what can be shown;
5. pack loop creates a bounded bundle;
6. bundle is delivered through a surface or provider adapter;
7. audit records why the bundle was created and exposed.

### Rule

> Models and agents consume bounded context bundles, not full storage.

---

## 9. Writeback model

The gateway must preserve the distinction between proposal and authority.

Correct writeback pattern:
1. model or agent submits a structured candidate;
2. gateway normalizes and classifies the candidate;
3. governance applies admissibility, scope, visibility, conflict, dedup, and retention rules;
4. canonical write occurs only if the gate approves;
5. audit records the decision.

### Rule

> External clients and models may propose context changes, but they must not directly write canonical memory or state.

---

## 10. Handoff and transfer model

The gateway must support controlled transfer across:
- sessions;
- agents;
- workflow steps;
- model providers;
- runtime environments.

A handoff is not a raw summary.
It is a bounded, typed, scoped, traceable transfer artifact.

The gateway should decide:
- what transfer is needed;
- what recipient boundary applies;
- what context can be transferred;
- what must be withheld;
- what provenance and audit records are required.

---

## 11. Runtime execution boundary

The gateway/control plane can prepare and validate execution-related contracts, but it must not silently become the runtime executor.

### Planning/control layer may define
- dispatch intent;
- delivery precheck;
- runtime handoff placeholders;
- handler boundary expectations;
- lifecycle and readiness contracts.

### Runtime execution layer owns
- actual handler invocation;
- actual MCP or API transport mechanics;
- provider SDK calls;
- concrete delivery;
- transport-level retries and streaming;
- runtime-specific operational behavior.

### Rule

> The gateway controls authority and context movement. It does not become a hidden transport runtime.

---

## 12. Provider neutrality

Provider-specific behavior must remain at the edge.

The gateway may know that a target runtime has constraints, but it should not let provider-specific assumptions redefine:
- memory semantics;
- state semantics;
- bundle meaning;
- writeback authority;
- handoff meaning;
- policy decisions;
- audit record meaning.

Provider adapters project canonical artifacts outward.
They do not own canonical truth.

---

## 13. Gateway failure modes

The architecture must guard against these failure modes:

1. **MCP-first collapse**
   - treating MCP tools as the product rather than the exposure surface.

2. **Storage proxy collapse**
   - letting clients query raw memory/state directly.

3. **Runtime leakage**
   - moving handler or transport behavior into gateway contracts.

4. **Provider leakage**
   - allowing one provider's limitations to redefine core semantics.

5. **Ungoverned capability exposure**
   - exposing all operations to all clients by default.

6. **Direct canonical writes**
   - allowing model outputs to bypass candidate review.

7. **Opaque provenance**
   - losing who acted, on behalf of whom, under what authority, and why.

---

## 14. Relationship to current packages

The current package stack should be interpreted as follows:

- `core-foundation` and `core-domain` define canonical semantics.
- `persistence-contracts` defines storage abstractions.
- `governance` defines authority and decision primitives.
- `read-path`, `pack-loop`, `write-path`, and `handoff` define core context contours.
- `audit-eval` defines trace and quality contracts.
- `integration-contracts` defines surface semantics.
- `provider-adapters` defines edge projection and normalization.
- `system-assembly` defines composition, planning, and boundary wiring.
- `runtime-surface` defines entrypoint and handler-shape contracts.

The gateway/control-plane concept cuts across these packages as an architectural boundary, not as an instruction to create an unbounded new package.

---

## 15. Implementation implication

Before actual handlers, transport runtime, provider SDK execution, or concrete delivery are implemented, the repository must preserve:
- explicit capability boundaries;
- identity and delegation context;
- policy enforcement points;
- audit and provenance linkage;
- separation between control-plane planning and runtime execution.

This document supports that sequencing.

---

## 16. Final statement

The context gateway and control plane is the system's durable control point.

MCP, API, and provider adapters are important surfaces, but the defensible system value lives in governed context authority: selecting, packing, exposing, transferring, writing back, auditing, and preserving bounded context across sessions, agents, workflows, providers, and runtimes.
