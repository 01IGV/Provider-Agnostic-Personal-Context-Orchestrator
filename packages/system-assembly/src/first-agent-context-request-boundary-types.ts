import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type {
  AgentContextRequestBoundaryShape,
  BoundedContextResponseEnvelopeShape
} from "@orchestrator/integration-contracts";
import type { AuthorityBoundaryDenialProofSummaryShape } from "./authority-boundary-denial-proof-integration-types.js";

export interface FirstAgentContextRequestBoundaryInputShape {
  authority_boundary_denial_proof: AuthorityBoundaryDenialProofSummaryShape;
  now?: IsoDateTimeString;
}

export interface FirstAgentContextRequestBoundaryResultShape {
  request: AgentContextRequestBoundaryShape;
  response: BoundedContextResponseEnvelopeShape;
}

export interface FirstAgentContextRequestBoundaryBuilder {
  create(input: FirstAgentContextRequestBoundaryInputShape): FirstAgentContextRequestBoundaryResultShape;
}
