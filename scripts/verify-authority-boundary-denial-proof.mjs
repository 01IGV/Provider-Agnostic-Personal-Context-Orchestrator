#!/usr/bin/env node

import {
  createAuthorityBoundaryDenialProofVerificationSummary,
  createDeterministicAuthorityBoundaryDenialProofSummary,
  findAuthorityBoundaryDenialProofFailures
} from "../packages/system-assembly/dist/index.js";

const summary = createDeterministicAuthorityBoundaryDenialProofSummary();
const failures = findAuthorityBoundaryDenialProofFailures(summary);

if (failures.length > 0) {
  console.error(
    JSON.stringify(
      {
        verification_result: "authority_boundary_denial_default_deny_failed",
        contract_version: summary.contract_version,
        proof_id: summary.proof_id,
        authority_boundary_id: summary.authority_boundary_id,
        source_surface_boundary_denial_proof_id: summary.source_surface_boundary_denial_proof_id,
        failure_count: failures.length,
        failures
      },
      null,
      2
    )
  );
  process.exit(1);
}

console.log(JSON.stringify(createAuthorityBoundaryDenialProofVerificationSummary(summary), null, 2));
