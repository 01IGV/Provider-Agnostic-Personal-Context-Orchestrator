# Execution Report

## Pass ID
`2026-04-24-47-ci-workspace-project-reference-resolution-fix`

## Date
`2026-04-24`

## Pass Title
CI workspace project-reference resolution fix.

## Objective
Fix the clean CI TypeScript/module-resolution failure found by the proof-output regression workflow.

The goal is to make a clean workspace able to run:

```bash
npm install
npm run typecheck
npm run proof:end-to-end:non-executing:verify
```

without `Cannot find module '@orchestrator/integration-contracts'` errors.

## Source Context Read
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `tsconfig.base.json`
- `.github/workflows/proof-output-regression.yml`
- `packages/integration-contracts/package.json`
- `packages/integration-contracts/tsconfig.json`
- `packages/audit-eval/package.json`
- `packages/audit-eval/tsconfig.json`
- `packages/provider-adapters/package.json`
- `packages/provider-adapters/tsconfig.json`
- `packages/runtime-surface/package.json`
- `packages/runtime-surface/tsconfig.json`
- `packages/audit-eval/src/audit-traces.ts`
- repository search for imports of `@orchestrator/integration-contracts`

## CI Failure Cause
The CI failure was not caused by the proof artifact shape, golden snapshot, or proof command semantics.

The clean CI environment exposed a workspace/project-reference dependency drift:

- `packages/audit-eval/src/audit-traces.ts` imports `IntegrationSurfaceType` from `@orchestrator/integration-contracts`.
- `packages/audit-eval/package.json` did not declare `@orchestrator/integration-contracts` as a dependency.
- `packages/audit-eval/tsconfig.json` did not reference `../integration-contracts`.
- root `tsconfig.json` listed `audit-eval` before `integration-contracts`, so clean project-reference build ordering could attempt to build `audit-eval` before the dependency was available.

Local builds could previously pass if `dist` artifacts already existed from prior builds.

## Changes Made
Updated `packages/audit-eval/package.json`:
- added `@orchestrator/integration-contracts` dependency.

Updated `packages/audit-eval/tsconfig.json`:
- added project reference to `../integration-contracts`.

Updated root `tsconfig.json`:
- moved `./packages/integration-contracts` before `./packages/audit-eval` in root project references.

Updated `package-lock.json`:
- synchronized `packages/audit-eval` dependency metadata to include `@orchestrator/integration-contracts`.

## Why This Is a Narrow Fix
This pass only aligns the existing import graph with package dependencies and TypeScript project references.

It does not change:
- proof artifact shape;
- golden snapshot;
- proof command semantics;
- stable proof artifact contract semantics;
- runtime handlers;
- MCP/API routes/controllers;
- dispatch execution;
- publication delivery;
- delivery runtime;
- provider SDK calls;
- transport execution;
- concrete persistence;
- auth/IAM;
- payment rails;
- actual contour execution;
- real model calls;
- real storage writes;
- placeholder layers.

## Verification Performed
- Pre-write safety check confirmed `fix/ci-workspace-project-reference-resolution` existed and `main...fix/ci-workspace-project-reference-resolution` was clean: `ahead_by: 0`, `behind_by: 0`, `files: []`.
- After first write, compare confirmed the branch became ahead of `main` and `main` was not directly changed.
- Static connector review confirmed the missing dependency/reference against the source import in `packages/audit-eval/src/audit-traces.ts`.

Local npm verification could not be executed in this connector session because repository access was via GitHub connector file operations rather than a local git/npm workspace.

## Verification Gap
Open until local or CI verification runs:

```bash
git checkout fix/ci-workspace-project-reference-resolution
npm install
npm run typecheck
npm run proof:end-to-end:non-executing:verify
```

Recommended clean-ish verification:

```bash
rm -rf packages/*/dist
npm run typecheck
npm run proof:end-to-end:non-executing:verify
```

## GitHub Actions Observation
Not observed in this session.

Depending on workflow triggers, GitHub Actions may not run until PR or merge/push activity triggers `.github/workflows/proof-output-regression.yml`.

## Known Issues Introduced or Updated
Added a temporary verification gap in `KNOWN_IMPLEMENTATION_ISSUES.md` requiring local/CI confirmation for the CI workspace project-reference fix.

## Current Outcome
The workspace dependency graph now explicitly reflects the `audit-eval` dependency on `integration-contracts`.

This should allow clean TypeScript project-reference builds to resolve `@orchestrator/integration-contracts` when building `audit-eval` and downstream packages.

## Next Recommended Bounded Step
Run local verification:

```bash
git checkout fix/ci-workspace-project-reference-resolution
npm install
npm run typecheck
npm run proof:end-to-end:non-executing:verify
```

Then, if possible, run:

```bash
rm -rf packages/*/dist
npm run typecheck
npm run proof:end-to-end:non-executing:verify
```

If verification passes, perform a docs-only verification sync in this branch before merge.

If verification fails, perform one narrow workspace/project-reference/dependency graph fix only.
