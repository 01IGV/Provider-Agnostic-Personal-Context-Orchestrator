#!/usr/bin/env node

import {
  createDeterministicInvocationDenialProofSummary,
  createInvocationDenialProofVerificationSummary,
  findInvocationDenialProofFailures
} from "../packages/system-assembly/dist/index.js";

const summary = createDeterministicInvocationDenialProofSummary();
const failures = findInvocationDenialProofFailures(summary);

if (failures.length > 0) {
  console.error(
    JSON.stringify(
      {
        verification_result: "invocation_denial_default_deny_failed",
        contract_version: summary.contract_version,
        proof_id: summary.proof_id,
        source_invocation_seam_id: summary.source_invocation_seam_id,
        failure_count: failures.length,
        failures
      },
      null,
      2
    )
  );
  process.exit(1);
}

console.log(JSON.stringify(createInvocationDenialProofVerificationSummary(summary), null, 2));
