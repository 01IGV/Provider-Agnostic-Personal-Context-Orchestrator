import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type { McpApiAdjacentSurfaceBoundaryShape, McpApiAdjacentSurfaceBoundarySummaryShape } from "@orchestrator/integration-contracts";
import type { HandlerBoundaryDenialProofSummaryShape } from "./handler-boundary-denial-proof-integration-types.js";

export interface FirstMcpApiAdjacentSurfaceBoundaryInputShape {
  handler_boundary_denial_proof: HandlerBoundaryDenialProofSummaryShape;
  now?: IsoDateTimeString;
}

export interface FirstMcpApiAdjacentSurfaceBoundaryBuilder {
  create(input: FirstMcpApiAdjacentSurfaceBoundaryInputShape): McpApiAdjacentSurfaceBoundaryShape;
  summarize(input: McpApiAdjacentSurfaceBoundaryShape): McpApiAdjacentSurfaceBoundarySummaryShape;
}
