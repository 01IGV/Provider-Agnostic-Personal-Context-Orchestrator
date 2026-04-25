#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  composeDeterministicEndToEndNonExecutingProofPath,
  createStableProofArtifactSummary,
  findStableProofArtifactRuntimeActionAssertionFailures
} from "../packages/system-assembly/dist/index.js";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const goldenSnapshotRelativePath =
  "docs/04-implementation/proof-artifacts/end-to-end-non-executing-proof.golden.json";
const goldenSnapshotPath = resolve(repoRoot, goldenSnapshotRelativePath);

const proof = composeDeterministicEndToEndNonExecutingProofPath();
const summary = createStableProofArtifactSummary(proof);
const failedAssertions = findStableProofArtifactRuntimeActionAssertionFailures(summary);

if (failedAssertions.length > 0) {
  console.error(
    JSON.stringify(
      {
        verification_result: "failed_runtime_action_assertions",
        contract_version: summary.contract_version,
        failed_assertions: failedAssertions
      },
      null,
      2
    )
  );
  process.exit(1);
}

const actual = `${JSON.stringify(summary, null, 2)}\n`;
const expected = readFileSync(goldenSnapshotPath, "utf8");

const findFirstMismatch = (expectedText, actualText) => {
  const expectedLines = expectedText.split("\n");
  const actualLines = actualText.split("\n");
  const maxLength = Math.max(expectedLines.length, actualLines.length);

  for (let index = 0; index < maxLength; index += 1) {
    if (expectedLines[index] !== actualLines[index]) {
      return {
        line: index + 1,
        expected: expectedLines[index] ?? "<missing>",
        actual: actualLines[index] ?? "<missing>"
      };
    }
  }

  return null;
};

if (actual !== expected) {
  const firstMismatch = findFirstMismatch(expected, actual);

  console.error(
    JSON.stringify(
      {
        verification_result: "stable_proof_artifact_snapshot_mismatch",
        contract_version: summary.contract_version,
        golden_snapshot_path: goldenSnapshotRelativePath,
        first_mismatch: firstMismatch,
        expected_length: expected.length,
        actual_length: actual.length
      },
      null,
      2
    )
  );
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      verification_result: "stable_proof_artifact_matches_golden_snapshot",
      contract_version: summary.contract_version,
      proof_id: summary.proof_id,
      golden_snapshot_path: goldenSnapshotRelativePath,
      runtime_action_assertions_all_false: true
    },
    null,
    2
  )
);
