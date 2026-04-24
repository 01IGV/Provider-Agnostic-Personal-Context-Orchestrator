# Identity, Delegation, and Provenance Specification

## 0. Purpose of this document

This document defines the identity, delegation, and provenance governance boundary for the Provider-Agnostic Personal Context Orchestrator.

It is not an authentication implementation plan.
It is not an enterprise IAM specification.
It is not a payment or authorization-rail design.

Its role is to define how identity and delegated authority must be represented in the system before actual runtime handlers, provider transport, or delivery execution are implemented.

---

## 1. Core thesis

A provider-agnostic context gateway cannot be governed unless it knows:
- who is acting;
- on behalf of whom;
- through which client or runtime;
- under which delegated authority;
- with what capability boundary;
- with what provenance trail;
- with what revocation path.

### Canonical statement

> Context access is never only a technical request. It is an authority-bearing action involving subject identity, client identity, runtime identity, agent identity, delegated permission, policy, and provenance.

---

## 2. Identity classes

The system should distinguish at least the following identity classes.

### 2.1. Subject identity
The person, workspace, project, organization, or entity whose context is being accessed or changed.

Examples:
- a personal user profile;
- a project context scope;
- an organization workspace;
- a shared workflow context.

### 2.2. User identity
The human user or account associated with the request.

This may be the same as the subject, but it should not always be assumed to be the same.

### 2.3. Client identity
The external application or surface invoking the orchestrator.

Examples:
- Codex-like environment;
- ChatGPT-compatible MCP host;
- custom API client;
- workflow backend;
- local desktop agent environment.

### 2.4. Runtime identity
The execution environment in which an agent, model, or workflow is operating.

Examples:
- MCP host runtime;
- API service runtime;
- local runtime;
- cloud orchestration runtime;
- CI-like automation runtime.

### 2.5. Agent identity
The agent, assistant, model-driven process, or autonomous workflow actor that requests access or produces a writeback candidate.

Agent identity should be explicit when an agent acts with any delegated capability.

### 2.6. Tool identity
The tool or operation surface through which an action is requested.

Tool identity matters because permissions can differ across tools even under the same client.

---

## 3. Delegated authority

Delegated authority describes what an actor is permitted to do on behalf of a subject.

A delegation should define:
- delegator;
- delegate;
- subject;
- allowed capability families;
- allowed scopes;
- allowed surfaces;
- allowed duration;
- revocation path;
- audit requirements;
- whether sub-delegation is allowed.

### Rule

> No client, runtime, model, or agent should receive context authority merely because it can technically call a tool or API.

---

## 4. Permission boundaries

Permissions should be bounded across multiple dimensions.

Minimum dimensions:
- scope boundary;
- capability boundary;
- surface boundary;
- runtime boundary;
- temporal boundary;
- subject boundary;
- data-class boundary;
- writeback boundary;
- transfer boundary;
- audit boundary.

### Examples
A client may be allowed to:
- read active state but not durable memory;
- request a bounded bundle but not expand context;
- propose writeback candidates but not approve canonical writes;
- create a handoff candidate but not transfer it to another agent;
- inspect audit summaries but not raw event logs.

---

## 5. Capability inheritance

Capability inheritance must be explicit and conservative.

If a user authorizes a client, that does not automatically authorize:
- every agent inside that client;
- every tool exposed through that client;
- every runtime execution path;
- every downstream provider or model;
- every future workflow spawned by the client.

### Rule

> Capability inheritance should be opt-in, bounded, traceable, and revocable.

---

## 6. Provenance chain

Every major context action should be able to produce a provenance chain.

A provenance chain should answer:
- who initiated the request?
- which client carried it?
- which runtime executed it?
- which agent or model participated?
- which tool or operation was used?
- what delegated authority was claimed?
- which policy checks were applied?
- which context scopes were accessed?
- which context artifacts were exposed?
- what was written, rejected, suppressed, or transferred?

---

## 7. Revocation and kill-switch semantics

The system must support the concept of revocation even before a concrete auth implementation exists.

Revocation may apply to:
- a client;
- an agent;
- a runtime;
- a tool;
- a delegation record;
- a scope;
- a workflow;
- a transfer path;
- a writeback authority.

### Kill-switch semantics
A kill switch should mean that affected future actions cannot proceed until a new valid authority path is established.

A kill switch should not silently erase audit history.

---

## 8. Identity and read access

Read access should consider:
- subject identity;
- requester identity;
- delegated authority;
- requested scope;
- requested context class;
- client and runtime trust level;
- target model or agent boundary;
- audit requirements.

### Rule

> A context object being relevant does not mean it is authorized to be shown.

---

## 9. Identity and bundle packing

Bundle packing should preserve authority boundaries.

A bundle should be shaped not only by relevance and token budget, but also by:
- who will receive it;
- whether the receiver is a model, agent, tool, client, or runtime;
- what authority that receiver has;
- whether the context can be transferred beyond the original surface;
- what must be redacted or summarized.

---

## 10. Identity and writeback

Writeback should never become canonical merely because a model or agent proposed it.

A writeback candidate should carry:
- submitting actor identity;
- client identity;
- runtime identity;
- subject identity;
- claimed authority;
- source anchors;
- candidate class;
- requested scope;
- provenance metadata.

Governance then decides whether the candidate is admissible.

---

## 11. Identity and handoff

Handoff is a delegated transfer event.

A handoff should carry:
- source subject;
- source client/runtime/agent;
- target client/runtime/agent where applicable;
- transfer scope;
- delegated authority;
- what may be preserved;
- what must be withheld;
- expiry or revocation assumptions;
- provenance chain.

### Rule

> Handoff should not be treated as simple summarization. It is controlled context transfer.

---

## 12. Identity and audit

Audit should preserve identity and delegation metadata for major decisions.

At minimum, audit records should be able to reference:
- identity chain;
- delegation record or authority claim;
- policy checks applied;
- accepted or rejected capability;
- exposed context bundle;
- writeback candidate decision;
- handoff transfer decision;
- revocation or kill-switch state where relevant.

---

## 13. Payment and authorization rails

Payment and economic authorization rails are relevant future adjacency areas, especially in an agent economy where agents may act, buy, subscribe, or delegate.

However, they should not become active implementation scope at this stage.

For now, this repository should only preserve the architectural boundary required for future payment or authorization integration:
- authority chain;
- capability scope;
- revocation;
- provenance;
- auditability;
- explicit delegation.

### Rule

> Payment rails may later rely on delegation and provenance, but the current system should not expand into payment settlement logic.

---

## 14. Governance failure modes

The system must guard against these failure modes:

1. **Implicit authority**
   - assuming a caller can act because it has a tool.

2. **Subject/client confusion**
   - treating the calling client as the subject whose context is accessed.

3. **Agent identity collapse**
   - losing which agent or workflow acted.

4. **Unbounded delegation**
   - granting broad capability without scope, time, or revocation.

5. **Missing provenance**
   - failing to preserve the chain behind context exposure or writeback.

6. **Direct canonical writeback**
   - allowing model or agent output to bypass governance.

7. **Untracked transfer**
   - passing context across agents, sessions, or runtimes without trace.

8. **Auth implementation leakage**
   - confusing this governance model with a specific auth provider or IAM product.

---

## 15. Relationship to gateway/control plane

Identity and delegation are not separate from the context gateway.
They are core control-plane inputs.

The gateway should use identity/delegation context when deciding:
- capability exposure;
- context bundle eligibility;
- writeback admissibility;
- handoff transfer eligibility;
- audit requirements;
- revocation and kill-switch behavior.

---

## 16. Implementation implication

Before actual runtime handlers, delivery execution, provider SDK transport, or concrete MCP/API behavior are implemented, the repository should preserve type-level and architecture-level room for:
- subject identity;
- user identity;
- client identity;
- runtime identity;
- agent identity;
- delegated authority;
- provenance chain;
- revocation state;
- permission boundaries.

This does not require a full auth implementation yet.
It requires the system not to erase these distinctions.

---

## 17. Final statement

A provider-agnostic context control layer cannot be trusted if it cannot explain who acted, on behalf of whom, through which surface, under what authority, with what context, and with what audit trail.

Identity, delegation, and provenance are therefore not optional enterprise features.
They are foundational governance boundaries for the context gateway and control plane.
