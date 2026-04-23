import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type { CanonicalResponseEnvelope, SurfaceErrorObject, TypedSurfaceResponse } from "./request-response.js";
import type { SurfaceResponseStatus } from "./vocabularies.js";

export interface DeliveryRuntimeHandoffWarning {
  code: string;
  message: string;
}

export interface DeliveryRuntimeTargetExpectationShape {
  target_family: string;
  expected_runtime_surface: "mcp_runtime_surface" | "api_runtime_surface" | "hybrid_runtime_surface" | "unknown_runtime_surface";
  expected_channel_family: string;
  expected_handler_boundary: "mcp_handler_boundary" | "api_handler_boundary" | "hybrid_handler_boundary" | "unknown_handler_boundary";
  required_capabilities: string[];
}

export interface DeliveryRuntimeHandlerInvocationPlaceholderShape {
  placeholder_id: string;
  target_handler_family: string;
  handler_boundary: "mcp_handler_boundary" | "api_handler_boundary" | "hybrid_handler_boundary" | "unknown_handler_boundary";
  invocation_mode: "synchronous" | "asynchronous" | "mixed" | "unknown";
  required_capabilities: string[];
  placeholder_payload: Record<string, unknown>;
}

export interface DeliveryRuntimeHandoffLinkageShape<TResult = Record<string, unknown>> {
  linkage_id: string;
  request_id: string;
  operation_id: string;
  precheck_id: string;
  dispatch_intent_id: string;
  runtime_handoff_family: string;
  runtime_handoff_status: string;
  runtime_target_family: string;
  runtime_target_expectation: DeliveryRuntimeTargetExpectationShape;
  handler_invocation_placeholder: DeliveryRuntimeHandlerInvocationPlaceholderShape;
  handoff_response_status: SurfaceResponseStatus;
  canonical_response: CanonicalResponseEnvelope<TResult>;
  typed_surface_response: TypedSurfaceResponse<TResult>;
  linked_error?: SurfaceErrorObject;
  warnings: DeliveryRuntimeHandoffWarning[];
  linked_at: IsoDateTimeString;
}

export interface DeliveryRuntimeHandoffLinkageBuilder {
  build<TResult = Record<string, unknown>>(input: {
    linkage_id: string;
    request_id: string;
    operation_id: string;
    precheck_id: string;
    dispatch_intent_id: string;
    runtime_handoff_family: string;
    runtime_handoff_status: string;
    runtime_target_family: string;
    runtime_target_expectation: DeliveryRuntimeTargetExpectationShape;
    handler_invocation_placeholder: DeliveryRuntimeHandlerInvocationPlaceholderShape;
    handoff_response_status: SurfaceResponseStatus;
    canonical_response: CanonicalResponseEnvelope<TResult>;
    typed_surface_response: TypedSurfaceResponse<TResult>;
    linked_error?: SurfaceErrorObject;
    warnings?: DeliveryRuntimeHandoffWarning[];
    now?: IsoDateTimeString;
  }): DeliveryRuntimeHandoffLinkageShape<TResult>;
}

export const createDeliveryRuntimeHandoffLinkageBuilder = (): DeliveryRuntimeHandoffLinkageBuilder => {
  return {
    build<TResult = Record<string, unknown>>(input: {
      linkage_id: string;
      request_id: string;
      operation_id: string;
      precheck_id: string;
      dispatch_intent_id: string;
      runtime_handoff_family: string;
      runtime_handoff_status: string;
      runtime_target_family: string;
      runtime_target_expectation: DeliveryRuntimeTargetExpectationShape;
      handler_invocation_placeholder: DeliveryRuntimeHandlerInvocationPlaceholderShape;
      handoff_response_status: SurfaceResponseStatus;
      canonical_response: CanonicalResponseEnvelope<TResult>;
      typed_surface_response: TypedSurfaceResponse<TResult>;
      linked_error?: SurfaceErrorObject;
      warnings?: DeliveryRuntimeHandoffWarning[];
      now?: IsoDateTimeString;
    }): DeliveryRuntimeHandoffLinkageShape<TResult> {
      const linkedAt = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
      return {
        linkage_id: input.linkage_id,
        request_id: input.request_id,
        operation_id: input.operation_id,
        precheck_id: input.precheck_id,
        dispatch_intent_id: input.dispatch_intent_id,
        runtime_handoff_family: input.runtime_handoff_family,
        runtime_handoff_status: input.runtime_handoff_status,
        runtime_target_family: input.runtime_target_family,
        runtime_target_expectation: input.runtime_target_expectation,
        handler_invocation_placeholder: input.handler_invocation_placeholder,
        handoff_response_status: input.handoff_response_status,
        canonical_response: input.canonical_response,
        typed_surface_response: input.typed_surface_response,
        ...(input.linked_error ? { linked_error: input.linked_error } : {}),
        warnings: input.warnings ?? [],
        linked_at: linkedAt
      };
    }
  };
};
