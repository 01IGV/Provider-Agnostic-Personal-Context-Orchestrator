import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type {
  AuthIamAdjacentAuthorityBoundaryShape,
  AuthIamAdjacentAuthorityBoundarySummaryShape
} from "@orchestrator/governance";
import type { SurfaceBoundaryDenialProofSummaryShape } from "./surface-boundary-denial-proof-integration-types.js";

export interface FirstAuthIamAdjacentAuthorityBoundaryInputShape {
  surface_boundary_denial_proof: SurfaceBoundaryDenialProofSummaryShape;
  now?: IsoDateTimeString;
}

export interface FirstAuthIamAdjacentAuthorityBoundaryBuilder {
  create(input: FirstAuthIamAdjacentAuthorityBoundaryInputShape): AuthIamAdjacentAuthorityBoundaryShape;
  summarize(input: AuthIamAdjacentAuthorityBoundaryShape): AuthIamAdjacentAuthorityBoundarySummaryShape;
}
