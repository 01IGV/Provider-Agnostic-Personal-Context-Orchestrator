import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type { CanonicalResponseEnvelope, SurfaceErrorObject, TypedSurfaceResponse } from "./request-response.js";
import type { SurfaceResponseStatus } from "./vocabularies.js";

export interface DeliveryPrecheckWarning {
  code: string;
  message: string;
}

export interface DeliveryPrecheckHandlerBoundaryExpectationShape {
  target_handler_family: string;
  handler_boundary: "mcp_handler_boundary" | "api_handler_boundary" | "hybrid_handler_boundary" | "unknown_handler_boundary";
  expected_dispatch_mode: "synchronous" | "asynchronous" | "mixed" | "unknown";
  required_dispatch_capabilities: string[];
  readiness_status: string;
}

export interface DeliveryPrecheckLinkageShape<TResult = Record<string, unknown>> {
  linkage_id: string;
  request_id: string;
  operation_id: string;
  dispatch_intent_id: string;
  dispatch_intent_family: string;
  precheck_family: string;
  precheck_status: string;
  target_handler_family: string;
  handler_boundary_expectation: DeliveryPrecheckHandlerBoundaryExpectationShape;
  precheck_response_status: SurfaceResponseStatus;
  canonical_response: CanonicalResponseEnvelope<TResult>;
  typed_surface_response: TypedSurfaceResponse<TResult>;
  linked_error?: SurfaceErrorObject;
  warnings: DeliveryPrecheckWarning[];
  linked_at: IsoDateTimeString;
}

export interface DeliveryPrecheckLinkageBuilder {
  build<TResult = Record<string, unknown>>(input: {
    linkage_id: string;
    request_id: string;
    operation_id: string;
    dispatch_intent_id: string;
    dispatch_intent_family: string;
    precheck_family: string;
    precheck_status: string;
    target_handler_family: string;
    handler_boundary_expectation: DeliveryPrecheckHandlerBoundaryExpectationShape;
    precheck_response_status: SurfaceResponseStatus;
    canonical_response: CanonicalResponseEnvelope<TResult>;
    typed_surface_response: TypedSurfaceResponse<TResult>;
    linked_error?: SurfaceErrorObject;
    warnings?: DeliveryPrecheckWarning[];
    now?: IsoDateTimeString;
  }): DeliveryPrecheckLinkageShape<TResult>;
}

export const createDeliveryPrecheckLinkageBuilder = (): DeliveryPrecheckLinkageBuilder => {
  return {
    build<TResult = Record<string, unknown>>(input: {
      linkage_id: string;
      request_id: string;
      operation_id: string;
      dispatch_intent_id: string;
      dispatch_intent_family: string;
      precheck_family: string;
      precheck_status: string;
      target_handler_family: string;
      handler_boundary_expectation: DeliveryPrecheckHandlerBoundaryExpectationShape;
      precheck_response_status: SurfaceResponseStatus;
      canonical_response: CanonicalResponseEnvelope<TResult>;
      typed_surface_response: TypedSurfaceResponse<TResult>;
      linked_error?: SurfaceErrorObject;
      warnings?: DeliveryPrecheckWarning[];
      now?: IsoDateTimeString;
    }): DeliveryPrecheckLinkageShape<TResult> {
      const linkedAt = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
      return {
        linkage_id: input.linkage_id,
        request_id: input.request_id,
        operation_id: input.operation_id,
        dispatch_intent_id: input.dispatch_intent_id,
        dispatch_intent_family: input.dispatch_intent_family,
        precheck_family: input.precheck_family,
        precheck_status: input.precheck_status,
        target_handler_family: input.target_handler_family,
        handler_boundary_expectation: input.handler_boundary_expectation,
        precheck_response_status: input.precheck_response_status,
        canonical_response: input.canonical_response,
        typed_surface_response: input.typed_surface_response,
        ...(input.linked_error ? { linked_error: input.linked_error } : {}),
        warnings: input.warnings ?? [],
        linked_at: linkedAt
      };
    }
  };
};
