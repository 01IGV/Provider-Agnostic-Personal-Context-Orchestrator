import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type {
  LocalJsonRequestResponseRunnerRequestEnvelopeShape,
  LocalJsonRequestResponseRunnerResponseEnvelopeShape,
  LocalJsonRequestResponseRunnerSummaryShape,
  VerifiedResponseProtocolSurfaceAdapterShape,
  VerifiedResponseProtocolSurfaceAdapterSummaryShape
} from "@orchestrator/integration-contracts";
import type { LocalDeterministicContextSourceAdapterContractsResultShape } from "./local-deterministic-context-source-adapter-contracts-types.js";

export interface LocalJsonRequestResponseRunnerShapeInput {
  local_context_result?: LocalDeterministicContextSourceAdapterContractsResultShape;
  now?: IsoDateTimeString;
}

export interface LocalJsonRequestResponseRunnerShapeResult {
  runner_request: LocalJsonRequestResponseRunnerRequestEnvelopeShape;
  runner_response: LocalJsonRequestResponseRunnerResponseEnvelopeShape;
  runner_summary: LocalJsonRequestResponseRunnerSummaryShape;
  adapter_shape: VerifiedResponseProtocolSurfaceAdapterShape;
  adapter_summary: VerifiedResponseProtocolSurfaceAdapterSummaryShape;
}

export interface LocalJsonRequestResponseRunnerShapeBuilder {
  create(input?: LocalJsonRequestResponseRunnerShapeInput): LocalJsonRequestResponseRunnerShapeResult;
}
