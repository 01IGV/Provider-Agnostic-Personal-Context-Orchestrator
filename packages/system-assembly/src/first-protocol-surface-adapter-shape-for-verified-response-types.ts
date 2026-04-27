import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type {
  VerifiedResponseProtocolSurfaceAdapterShape,
  VerifiedResponseProtocolSurfaceAdapterSummaryShape
} from "@orchestrator/integration-contracts";
import type { LocalDeterministicContextSourceAdapterContractsResultShape } from "./local-deterministic-context-source-adapter-contracts-types.js";

export interface FirstProtocolSurfaceAdapterShapeForVerifiedResponseInputShape {
  local_context_result?: LocalDeterministicContextSourceAdapterContractsResultShape;
  now?: IsoDateTimeString;
}

export interface FirstProtocolSurfaceAdapterShapeForVerifiedResponseResultShape {
  adapter_shape: VerifiedResponseProtocolSurfaceAdapterShape;
  summary: VerifiedResponseProtocolSurfaceAdapterSummaryShape;
}

export interface FirstProtocolSurfaceAdapterShapeForVerifiedResponseBuilder {
  create(
    input?: FirstProtocolSurfaceAdapterShapeForVerifiedResponseInputShape
  ): FirstProtocolSurfaceAdapterShapeForVerifiedResponseResultShape;
}
