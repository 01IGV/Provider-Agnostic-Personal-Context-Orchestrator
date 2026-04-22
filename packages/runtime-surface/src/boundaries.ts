import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type { AnyRuntimeEntrypointRequest, EntrypointValidationResult, RuntimeEntrypointResponseShape } from "./entrypoints.js";
import type { RuntimeHandlerResultShape } from "./handlers.js";
import type { RuntimeSurfaceBoundaryWarningCode } from "./vocabularies.js";

export interface BoundaryPreservationWarningShape {
  code: RuntimeSurfaceBoundaryWarningCode;
  boundary_id: "request_normalization" | "response_shaping" | "dispatch_contract";
  message: string;
  preserved_contract: boolean;
}

export interface RequestNormalizationBoundaryInput<TPayload = Record<string, unknown>> {
  raw_request: AnyRuntimeEntrypointRequest<TPayload>;
  normalized_at?: IsoDateTimeString;
}

export interface RequestNormalizationBoundaryResult<TPayload = Record<string, unknown>> {
  normalized_request: AnyRuntimeEntrypointRequest<TPayload>;
  validation: EntrypointValidationResult;
  warnings: BoundaryPreservationWarningShape[];
}

export interface ResponseShapingBoundaryInput<TResult = Record<string, unknown>> {
  request_id: string;
  operation_id: string;
  handler_result: RuntimeHandlerResultShape<TResult>;
  boundary_warnings: BoundaryPreservationWarningShape[];
}

export interface ResponseShapingBoundaryResult<TResult = Record<string, unknown>> {
  response: RuntimeEntrypointResponseShape<TResult>;
  warnings: BoundaryPreservationWarningShape[];
}
