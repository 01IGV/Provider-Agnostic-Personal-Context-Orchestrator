import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type {
  RuntimeAdjacentHandlerBoundaryShape,
  RuntimeAdjacentHandlerBoundarySummaryShape
} from "@orchestrator/runtime-surface";
import type { InvocationDenialProofSummaryShape } from "./invocation-denial-proof-integration-types.js";

export interface FirstRuntimeAdjacentHandlerBoundaryInputShape {
  invocation_denial_proof: InvocationDenialProofSummaryShape;
  now?: IsoDateTimeString;
}

export interface FirstRuntimeAdjacentHandlerBoundaryBuilder {
  create(input: FirstRuntimeAdjacentHandlerBoundaryInputShape): RuntimeAdjacentHandlerBoundaryShape;
  summarize(input: RuntimeAdjacentHandlerBoundaryShape): RuntimeAdjacentHandlerBoundarySummaryShape;
}
