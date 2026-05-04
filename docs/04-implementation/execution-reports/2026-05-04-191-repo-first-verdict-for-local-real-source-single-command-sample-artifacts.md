# Execution Report

## Pass ID
`2026-05-04-191-repo-first-verdict-for-local-real-source-single-command-sample-artifacts`

## Date
`2026-05-04`

## Pass Title
Repo-first verdict for local real-source single-command sample artifacts.

## Objective
Choose the next bounded implementation after the local real-source single-command agent tool v0.

## Verdict
The next implementation should be:

```text
local real-source single-command sample artifact set
```

## Rationale
The single-command tool is the most agent-usable local real-source path so far. The next practical readiness step is to publish a deterministic sample artifact set for AI-agent inspection:

```text
sample request
sample response
sample summary
sample index
```

This gives an agent a concrete example of what to call, what it receives, which refs were selected, which receipt/provenance/permission/audit refs are carried, and which actions remain denied.

## Bounded Scope
The implementation should:

- call the existing single-command tool;
- write request/response/summary/index artifacts to explicit paths;
- add an index artifact for AI-agent inspection;
- expose selected source refs, digests, receipt refs, and denial posture;
- add package script, verifier, CI step, manifest entry, and execution report.

## Guardrails
Do not add:

- direct agent repo file access;
- arbitrary source paths;
- directory traversal/listing;
- repo scanning;
- MCP server;
- MCP tool/resource registration;
- API routes/controllers;
- runtime handlers;
- provider SDK calls;
- concrete persistence adapters;
- auth/IAM implementation;
- token/session validation;
- policy engine execution;
- permission grants;
- model calls;
- storage writes beyond explicit artifact output paths;
- contour execution.
