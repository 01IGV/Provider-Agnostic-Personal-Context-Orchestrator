#!/usr/bin/env node

import {
  composeDeterministicEndToEndNonExecutingProofPath,
  createStableProofArtifactSummary,
  findStableProofArtifactRuntimeActionAssertionFailures
} from "../packages/system-assembly/dist/index.js";

const proof = composeDeterministicEndToEndNonExecutingProofPath();
const summary = createStableProofArtifactSummary(proof);
const failedAssertions = findStableProofArtifactRuntimeActionAssertionFailures(summary);

if (failedAssertions.length > 0) {
  console.error(
    JSON.stringify(
      {
        proof_result: "failed_runtime_action_assertions",
        contract_version: summary.contract_version,
        failed_assertions: failedAssertions
      },
      null,
      2
    )
  );
  process.exit(1);
}

console.log(JSON.stringify(summary, null, 2));
