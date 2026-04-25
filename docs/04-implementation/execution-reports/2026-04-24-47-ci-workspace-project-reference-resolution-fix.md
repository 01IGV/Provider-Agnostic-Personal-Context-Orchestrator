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

without `Cannot find module '@orchestrator/integration-contracts'` errors and without depending on pre-existing `dist` artifacts.

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
The original CI failure was not caused by the proof artifact shape, golden snapshot, or proof command semantics.

The clean CI environment exposed a workspace/project-reference dependency drift:

- `packages/audit-eval/src/audit-traces.ts` imports `IntegrationSurfaceType` from `@orchestrator/integration-contracts`.
- `packages/audit-eval/package.json` did not declare `@orchestrator/integration-contracts` as a dependency.
- `packages/audit-eval/tsconfig.json` did not reference `../integration-contracts`.
- root `tsconfig.json` listed `audit-eval` before `integration-contracts`, so clean project-reference build ordering could attempt to build `audit-eval` before the dependency was available.

Local builds could previously pass if `dist` artifacts already existed from prior builds.

## Additional Clean-ish Verification Finding
After the initial graph fix, local verification showed:

```bash
npm install
npm run typecheck
npm run proof:end-to-end:non-executing:verify
```

passed.

But clean-ish verification after removing package `dist` directories failed:

```bash
rm -rf packages/*/dist
npm run typecheck
npm run proof:end-to-end:non-executing:verify
```

The failure was:

```text
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'packages/system-assembly/dist/index.js'
```

Cause: `tsc -b` can consider projects up to date based on existing incremental build metadata even when `dist` was removed manually. The proof scripts import built JavaScript from `dist`, so the proof commands must force re-emit before running Node.

## Changes Made
Updated `packages/audit-eval/package.json`:
- added `@orchestrator/integration-contracts` dependency.

Updated `packages/audit-eval/tsconfig.json`:
- added project reference to `../integration-contracts`.

Updated root `tsconfig.json`:
- moved `./packages/integration-contracts` before `./packages/audit-eval` in root project references.

Updated `package-lock.json`:
- synchronized `packages/audit-eval` dependency metadata to include `@orchestrator/integration-contracts`.

Updated root `package.json`:
- added `build:force` script: `tsc -b --force`;
- changed `proof:end-to-end:non-executing` to run `npm run build:force` before the Node script;
- changed `proof:end-to-end:non-executing:verify` to run `npm run build:force` before the verify Node script.

## Why This Is a Narrow Fix
This pass only aligns the existing import graph with package dependencies and TypeScript project references, then makes the proof commands robust against missing `dist` artifacts in clean-ish workspaces.

It does not change:
- proof artifact shape;
- golden snapshot;
- proof command output semantics;
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
- User-local verification confirmed the initial graph fix passed normal local verification but failed after removing `packages/*/dist`, exposing the proof command forced-build need.

Local npm verification after the forced-build command update has not yet been executed.

## Verification Gap
Open until local or CI verification runs:

```bash
git pull origin fix/ci-workspace-project-reference-resolution
npm install
npm run typecheck
npm run proof:end-to-end:non-executing:verify
rm -rf packages/*/dist
npm run typecheck
npm run proof:end-to-end:non-executing:verify
```

Expected behavior after this update:
- `npm run proof:end-to-end:non-executing:verify` should force rebuild missing `dist` artifacts through `npm run build:force`;
- the stable proof artifact should still match the golden snapshot.

## GitHub Actions Observation
Not observed after the forced-build update in this session.

Depending on workflow triggers, GitHub Actions may not run until PR or merge/push activity triggers `.github/workflows/proof-output-regression.yml`.

## Known Issues Introduced or Updated
Temporary verification gap remains in `KNOWN_IMPLEMENTATION_ISSUES.md` requiring local/CI confirmation for the CI workspace project-reference and forced-build proof command fix.

## Current Outcome
The workspace dependency graph now explicitly reflects the `audit-eval` dependency on `integration-contracts`.

The proof commands now force a TypeScript project build before importing built `dist` modules, reducing reliance on pre-existing local build artifacts.

## Next Recommended Bounded Step
Run local verification:

```bash
git pull origin fix/ci-workspace-project-reference-resolution
npm install
npm run typecheck
npm run proof:end-to-end:non-executing:verify
rm -rf packages/*/dist
npm run typecheck
npm run proof:end-to-end:non-executing:verify
```

If verification passes, perform a docs-only verification sync in this branch before merge.

If verification fails, perform one narrow workspace/project-reference/dependency graph or proof-command build-order fix only.
