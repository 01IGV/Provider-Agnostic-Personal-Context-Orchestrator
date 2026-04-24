import type { IsoDateTimeString, OperationalContour } from "@orchestrator/core-foundation";
import type { CanonicalResponseEnvelope, TypedSurfaceResponse } from "./request-response.js";
import type { SurfaceResponseStatus } from "./vocabularies.js";

export interface ExecutionAttemptLifecycleIntegrationWarning {
  code: string;
  message: string;
}

export interface ExecutionAttemptLifecycleLinkageShape<TResult = Record<string, unknown>> {
  linkage_id: string;
  request_id: string;
  operation_id: string;
  precheck_id: string;
  dispatch_intent_id: string;
  runtime_handoff_id: string;
  attempt_id: string;
  attempt_family: string;
  contour_target: OperationalContour | "unknown";
  lifecycle_state: string;
  result_family: string;
  integration_response_status: SurfaceResponseStatus;
  canonical_response: CanonicalResponseEnvelope<TResult>;
  typed_surface_response: TypedSurfaceResponse<TResult>;
  warnings: ExecutionAttemptLifecycleIntegrationWarning[];
  linked_at: IsoDateTimeString;
}

export interface ExecutionAttemptLifecycleLinkageBuilder {
  build<TResult = Record<string, unknown>>(input: {
    linkage_id: string;
    request_id: string;
    operation_id: string;
    precheck_id: string;
    dispatch_intent_id: string;
    runtime_handoff_id: string;
    attempt_id: string;
    attempt_family: string;
    contour_target: OperationalContour | "unknown";
    lifecycle_state: string;
    result_family: string;
    integration_response_status: SurfaceResponseStatus;
    canonical_response: CanonicalResponseEnvelope<TResult>;
    typed_surface_response: TypedSurfaceResponse<TResult>;
    warnings?: ExecutionAttemptLifecycleIntegrationWarning[];
    now?: IsoDateTimeString;
  }): ExecutionAttemptLifecycleLinkageShape<TResult>;
}

export const createExecutionAttemptLifecycleLinkageBuilder = (): ExecutionAttemptLifecycleLinkageBuilder => {
  return {
    build<TResult = Record<string, unknown>>(input: {
      linkage_id: string;
      request_id: string;
      operation_id: string;
      precheck_id: string;
      dispatch_intent_id: string;
      runtime_handoff_id: string;
      attempt_id: string;
      attempt_family: string;
      contour_target: OperationalContour | "unknown";
      lifecycle_state: string;
      result_family: string;
      integration_response_status: SurfaceResponseStatus;
      canonical_response: CanonicalResponseEnvelope<TResult>;
      typed_surface_response: TypedSurfaceResponse<TResult>;
      warnings?: ExecutionAttemptLifecycleIntegrationWarning[];
      now?: IsoDateTimeString;
    }): ExecutionAttemptLifecycleLinkageShape<TResult> {
      const linkedAt = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
      return {
        linkage_id: input.linkage_id,
        request_id: input.request_id,
        operation_id: input.operation_id,
        precheck_id: input.precheck_id,
        dispatch_intent_id: input.dispatch_intent_id,
        runtime_handoff_id: input.runtime_handoff_id,
        attempt_id: input.attempt_id,
        attempt_family: input.attempt_family,
        contour_target: input.contour_target,
        lifecycle_state: input.lifecycle_state,
        result_family: input.result_family,
        integration_response_status: input.integration_response_status,
        canonical_response: input.canonical_response,
        typed_surface_response: input.typed_surface_response,
        warnings: input.warnings ?? [],
        linked_at: linkedAt
      };
    }
  };
};
