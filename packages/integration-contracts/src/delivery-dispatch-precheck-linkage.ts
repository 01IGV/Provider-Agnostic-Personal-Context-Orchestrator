import type { IsoDateTimeString, OperationalContour } from "@orchestrator/core-foundation";
import type { CanonicalResponseEnvelope, TypedSurfaceResponse } from "./request-response.js";
import type { SurfaceResponseStatus } from "./vocabularies.js";

export interface DeliveryDispatchPrecheckIntegrationWarning {
  code: string;
  message: string;
}

export interface DeliveryDispatchPrecheckLinkageShape<TResult = Record<string, unknown>> {
  linkage_id: string;
  delivery_dispatch_precheck_id: string;
  delivery_dispatch_intent_id: string;
  dispatch_readiness_id: string;
  publication_preparation_id: string;
  normalized_outcome_id: string;
  request_id: string;
  operation_id: string;
  source_precheck_id: string;
  source_dispatch_intent_id: string;
  runtime_handoff_id: string;
  attempt_id: string;
  delivery_dispatch_precheck_family: string;
  delivery_dispatch_precheck_status: string;
  delivery_dispatch_intent_family: string;
  delivery_dispatch_intent_status: string;
  dispatch_readiness_family: string;
  dispatch_readiness_status: string;
  publication_preparation_family: string;
  publication_preparation_status: string;
  normalized_outcome_family: string;
  normalized_outcome_status: string;
  lifecycle_state: string;
  contour_target: OperationalContour | "unknown";
  integration_response_status: SurfaceResponseStatus;
  canonical_response: CanonicalResponseEnvelope<TResult>;
  typed_surface_response: TypedSurfaceResponse<TResult>;
  linkage_boundary: {
    delivery_dispatch_precheck_placeholder_only: true;
    actual_dispatch_execution: false;
    actual_publication_delivery: false;
    actual_handler_result: false;
    actual_delivery_result: false;
    provider_transport_result: false;
  };
  warnings: DeliveryDispatchPrecheckIntegrationWarning[];
  linked_at: IsoDateTimeString;
}

export interface DeliveryDispatchPrecheckLinkageBuilder {
  build<TResult = Record<string, unknown>>(input: {
    linkage_id: string;
    delivery_dispatch_precheck_id: string;
    delivery_dispatch_intent_id: string;
    dispatch_readiness_id: string;
    publication_preparation_id: string;
    normalized_outcome_id: string;
    request_id: string;
    operation_id: string;
    source_precheck_id: string;
    source_dispatch_intent_id: string;
    runtime_handoff_id: string;
    attempt_id: string;
    delivery_dispatch_precheck_family: string;
    delivery_dispatch_precheck_status: string;
    delivery_dispatch_intent_family: string;
    delivery_dispatch_intent_status: string;
    dispatch_readiness_family: string;
    dispatch_readiness_status: string;
    publication_preparation_family: string;
    publication_preparation_status: string;
    normalized_outcome_family: string;
    normalized_outcome_status: string;
    lifecycle_state: string;
    contour_target: OperationalContour | "unknown";
    integration_response_status: SurfaceResponseStatus;
    canonical_response: CanonicalResponseEnvelope<TResult>;
    typed_surface_response: TypedSurfaceResponse<TResult>;
    warnings?: DeliveryDispatchPrecheckIntegrationWarning[];
    now?: IsoDateTimeString;
  }): DeliveryDispatchPrecheckLinkageShape<TResult>;
}

export const createDeliveryDispatchPrecheckLinkageBuilder = (): DeliveryDispatchPrecheckLinkageBuilder => {
  return {
    build<TResult = Record<string, unknown>>(input: {
      linkage_id: string;
      delivery_dispatch_precheck_id: string;
      delivery_dispatch_intent_id: string;
      dispatch_readiness_id: string;
      publication_preparation_id: string;
      normalized_outcome_id: string;
      request_id: string;
      operation_id: string;
      source_precheck_id: string;
      source_dispatch_intent_id: string;
      runtime_handoff_id: string;
      attempt_id: string;
      delivery_dispatch_precheck_family: string;
      delivery_dispatch_precheck_status: string;
      delivery_dispatch_intent_family: string;
      delivery_dispatch_intent_status: string;
      dispatch_readiness_family: string;
      dispatch_readiness_status: string;
      publication_preparation_family: string;
      publication_preparation_status: string;
      normalized_outcome_family: string;
      normalized_outcome_status: string;
      lifecycle_state: string;
      contour_target: OperationalContour | "unknown";
      integration_response_status: SurfaceResponseStatus;
      canonical_response: CanonicalResponseEnvelope<TResult>;
      typed_surface_response: TypedSurfaceResponse<TResult>;
      warnings?: DeliveryDispatchPrecheckIntegrationWarning[];
      now?: IsoDateTimeString;
    }): DeliveryDispatchPrecheckLinkageShape<TResult> {
      const linkedAt = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
      return {
        linkage_id: input.linkage_id,
        delivery_dispatch_precheck_id: input.delivery_dispatch_precheck_id,
        delivery_dispatch_intent_id: input.delivery_dispatch_intent_id,
        dispatch_readiness_id: input.dispatch_readiness_id,
        publication_preparation_id: input.publication_preparation_id,
        normalized_outcome_id: input.normalized_outcome_id,
        request_id: input.request_id,
        operation_id: input.operation_id,
        source_precheck_id: input.source_precheck_id,
        source_dispatch_intent_id: input.source_dispatch_intent_id,
        runtime_handoff_id: input.runtime_handoff_id,
        attempt_id: input.attempt_id,
        delivery_dispatch_precheck_family: input.delivery_dispatch_precheck_family,
        delivery_dispatch_precheck_status: input.delivery_dispatch_precheck_status,
        delivery_dispatch_intent_family: input.delivery_dispatch_intent_family,
        delivery_dispatch_intent_status: input.delivery_dispatch_intent_status,
        dispatch_readiness_family: input.dispatch_readiness_family,
        dispatch_readiness_status: input.dispatch_readiness_status,
        publication_preparation_family: input.publication_preparation_family,
        publication_preparation_status: input.publication_preparation_status,
        normalized_outcome_family: input.normalized_outcome_family,
        normalized_outcome_status: input.normalized_outcome_status,
        lifecycle_state: input.lifecycle_state,
        contour_target: input.contour_target,
        integration_response_status: input.integration_response_status,
        canonical_response: input.canonical_response,
        typed_surface_response: input.typed_surface_response,
        linkage_boundary: {
          delivery_dispatch_precheck_placeholder_only: true,
          actual_dispatch_execution: false,
          actual_publication_delivery: false,
          actual_handler_result: false,
          actual_delivery_result: false,
          provider_transport_result: false
        },
        warnings: input.warnings ?? [],
        linked_at: linkedAt
      };
    }
  };
};
