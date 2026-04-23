import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type { CanonicalResponseEnvelope, SurfaceErrorObject, TypedSurfaceResponse } from "./request-response.js";
import type { IntegrationPublicationChannelFamily } from "./channel-bound-egress-linkage.js";
import type { SurfaceResponseStatus } from "./vocabularies.js";

export interface PublicationDispatchIntentWarning {
  code: string;
  message: string;
}

export interface PublicationDispatchIntentHandlerBoundaryExpectationShape {
  expected_handler_boundary: "mcp_handler_boundary" | "api_handler_boundary" | "hybrid_handler_boundary" | "unknown_handler_boundary";
  required_dispatch_capabilities: string[];
  expected_dispatch_mode: "synchronous" | "asynchronous" | "mixed" | "unknown";
}

export interface PublicationDispatchIntentLinkageShape<TResult = Record<string, unknown>> {
  linkage_id: string;
  request_id: string;
  operation_id: string;
  channel_family: IntegrationPublicationChannelFamily;
  dispatch_intent_family: string;
  dispatch_intent_status: string;
  dispatch_target_family: string;
  handler_boundary_expectation: PublicationDispatchIntentHandlerBoundaryExpectationShape;
  dispatch_status: SurfaceResponseStatus;
  canonical_response: CanonicalResponseEnvelope<TResult>;
  typed_surface_response: TypedSurfaceResponse<TResult>;
  linked_error?: SurfaceErrorObject;
  warnings: PublicationDispatchIntentWarning[];
  linked_at: IsoDateTimeString;
}

export interface PublicationDispatchIntentLinkageBuilder {
  build<TResult = Record<string, unknown>>(input: {
    linkage_id: string;
    request_id: string;
    operation_id: string;
    channel_family: IntegrationPublicationChannelFamily;
    dispatch_intent_family: string;
    dispatch_intent_status: string;
    dispatch_target_family: string;
    handler_boundary_expectation: PublicationDispatchIntentHandlerBoundaryExpectationShape;
    dispatch_status: SurfaceResponseStatus;
    canonical_response: CanonicalResponseEnvelope<TResult>;
    typed_surface_response: TypedSurfaceResponse<TResult>;
    linked_error?: SurfaceErrorObject;
    warnings?: PublicationDispatchIntentWarning[];
    now?: IsoDateTimeString;
  }): PublicationDispatchIntentLinkageShape<TResult>;
}

export const createPublicationDispatchIntentLinkageBuilder = (): PublicationDispatchIntentLinkageBuilder => {
  return {
    build<TResult = Record<string, unknown>>(input: {
      linkage_id: string;
      request_id: string;
      operation_id: string;
      channel_family: IntegrationPublicationChannelFamily;
      dispatch_intent_family: string;
      dispatch_intent_status: string;
      dispatch_target_family: string;
      handler_boundary_expectation: PublicationDispatchIntentHandlerBoundaryExpectationShape;
      dispatch_status: SurfaceResponseStatus;
      canonical_response: CanonicalResponseEnvelope<TResult>;
      typed_surface_response: TypedSurfaceResponse<TResult>;
      linked_error?: SurfaceErrorObject;
      warnings?: PublicationDispatchIntentWarning[];
      now?: IsoDateTimeString;
    }): PublicationDispatchIntentLinkageShape<TResult> {
      const linkedAt = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
      return {
        linkage_id: input.linkage_id,
        request_id: input.request_id,
        operation_id: input.operation_id,
        channel_family: input.channel_family,
        dispatch_intent_family: input.dispatch_intent_family,
        dispatch_intent_status: input.dispatch_intent_status,
        dispatch_target_family: input.dispatch_target_family,
        handler_boundary_expectation: input.handler_boundary_expectation,
        dispatch_status: input.dispatch_status,
        canonical_response: input.canonical_response,
        typed_surface_response: input.typed_surface_response,
        ...(input.linked_error ? { linked_error: input.linked_error } : {}),
        warnings: input.warnings ?? [],
        linked_at: linkedAt
      };
    }
  };
};
