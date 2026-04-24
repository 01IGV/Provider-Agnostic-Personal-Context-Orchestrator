import type { IsoDateTimeString, OperationalContour } from "@orchestrator/core-foundation";
import type { CanonicalResponseEnvelope, TypedSurfaceResponse } from "./request-response.js";
import type { SurfaceResponseStatus } from "./vocabularies.js";

export interface ExecutionAttemptOutcomePublicationPreparationIntegrationWarning {
  code: string;
  message: string;
}

export interface ExecutionAttemptOutcomePublicationPreparationLinkageShape<TResult = Record<string, unknown>> {
  linkage_id: string;
  publication_preparation_id: string;
  normalized_outcome_id: string;
  request_id: string;
  operation_id: string;
  precheck_id: string;
  dispatch_intent_id: string;
  runtime_handoff_id: string;
  attempt_id: string;
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
    publication_ready_placeholder_only: true;
    actual_publication_delivery: false;
    actual_handler_result: false;
    actual_delivery_result: false;
    provider_transport_result: false;
  };
  warnings: ExecutionAttemptOutcomePublicationPreparationIntegrationWarning[];
  linked_at: IsoDateTimeString;
}

export interface ExecutionAttemptOutcomePublicationPreparationLinkageBuilder {
  build<TResult = Record<string, unknown>>(input: {
    linkage_id: string;
    publication_preparation_id: string;
    normalized_outcome_id: string;
    request_id: string;
    operation_id: string;
    precheck_id: string;
    dispatch_intent_id: string;
    runtime_handoff_id: string;
    attempt_id: string;
    publication_preparation_family: string;
    publication_preparation_status: string;
    normalized_outcome_family: string;
    normalized_outcome_status: string;
    lifecycle_state: string;
    contour_target: OperationalContour | "unknown";
    integration_response_status: SurfaceResponseStatus;
    canonical_response: CanonicalResponseEnvelope<TResult>;
    typed_surface_response: TypedSurfaceResponse<TResult>;
    warnings?: ExecutionAttemptOutcomePublicationPreparationIntegrationWarning[];
    now?: IsoDateTimeString;
  }): ExecutionAttemptOutcomePublicationPreparationLinkageShape<TResult>;
}

export const createExecutionAttemptOutcomePublicationPreparationLinkageBuilder =
  (): ExecutionAttemptOutcomePublicationPreparationLinkageBuilder => {
    return {
      build<TResult = Record<string, unknown>>(input: {
        linkage_id: string;
        publication_preparation_id: string;
        normalized_outcome_id: string;
        request_id: string;
        operation_id: string;
        precheck_id: string;
        dispatch_intent_id: string;
        runtime_handoff_id: string;
        attempt_id: string;
        publication_preparation_family: string;
        publication_preparation_status: string;
        normalized_outcome_family: string;
        normalized_outcome_status: string;
        lifecycle_state: string;
        contour_target: OperationalContour | "unknown";
        integration_response_status: SurfaceResponseStatus;
        canonical_response: CanonicalResponseEnvelope<TResult>;
        typed_surface_response: TypedSurfaceResponse<TResult>;
        warnings?: ExecutionAttemptOutcomePublicationPreparationIntegrationWarning[];
        now?: IsoDateTimeString;
      }): ExecutionAttemptOutcomePublicationPreparationLinkageShape<TResult> {
        const linkedAt = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
        return {
          linkage_id: input.linkage_id,
          publication_preparation_id: input.publication_preparation_id,
          normalized_outcome_id: input.normalized_outcome_id,
          request_id: input.request_id,
          operation_id: input.operation_id,
          precheck_id: input.precheck_id,
          dispatch_intent_id: input.dispatch_intent_id,
          runtime_handoff_id: input.runtime_handoff_id,
          attempt_id: input.attempt_id,
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
            publication_ready_placeholder_only: true,
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
