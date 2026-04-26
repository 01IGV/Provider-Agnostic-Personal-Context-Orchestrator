#!/usr/bin/env node

import {
  createDeterministicHandlerBoundaryDenialProofSummary,
  createHandlerBoundaryDenialProofVerificationSummary,
  findHandlerBoundaryDenialProofFailures
} from "../packages/system-assembly/dist/index.js";

const summary = createDeterministicHandlerBoundaryDenialProofSummary();
const failures = findHandlerBoundaryDenialProofFailures(summary);

if (failures.length > 0) {
  console.error(
    JSON.stringify(
      {
        verification_result: "handler_boundary_denial_default_deny_failed",
        contract_version: summary.contract_version,
        proof_id: summary.proof_id,
        source_handler_boundary_id: summary.source_handler_boundary_id,
        source_invocation_denial_proof_id: summary.source_invocation_denial_proof_id,
        failure_count: failures.length,
        failures
      },
      null,
      2
    )
  );
  process.exit(1);
}

console.log(JSON.stringify(createHandlerBoundaryDenialProofVerificationSummary(summary), null, 2));
