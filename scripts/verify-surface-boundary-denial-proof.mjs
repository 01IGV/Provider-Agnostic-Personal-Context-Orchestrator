import {
  createDeterministicSurfaceBoundaryDenialProofSummary,
  createSurfaceBoundaryDenialProofVerificationSummary
} from "../packages/system-assembly/dist/index.js";

const proof = createDeterministicSurfaceBoundaryDenialProofSummary();
const verification = createSurfaceBoundaryDenialProofVerificationSummary(proof);

console.log(JSON.stringify(verification, null, 2));

if (verification.verification_result !== "surface_boundary_denial_default_deny_verified") {
  process.exit(1);
}
