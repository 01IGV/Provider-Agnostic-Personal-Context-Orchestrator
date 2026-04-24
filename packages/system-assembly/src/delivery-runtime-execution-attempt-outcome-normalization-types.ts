import type { AuditId, IsoDateTimeString, OperationalContour } from "@orchestrator/core-foundation";
import type {
  NormalizedExecutionAttemptOutcomeAuditLinkageShape,
  NormalizedExecutionAttemptOutcomeTraceShape
} from "@orchestrator/audit-eval";
import type { NormalizedExecutionAttemptOutcomeLinkageShape } from "@orchestrator/integration-contracts";
import type { RuntimeNormalizedExecutionAttemptOutcomeEnvelopeShape } from "@orchestrator/runtime-surface";
import type { ExecutionAttemptLifecycleShape } from "./delivery-runtime-execution-attempt-lifecycle-types.js";
import type {
  DeliveryRuntimeExecutionAttemptOutcomeNormalizationWarningCode,
  DeliveryRuntimeNormalizedExecutionAttemptOutcomeFamily,
  DeliveryRuntimeNormalizedExecutionAttemptOutcomeResult,
  DeliveryRuntimeNormalizedExecutionAttemptOutcomeStatus
} from "./delivery-runtime-execution-attempt-outcome-normalization-vocabularies.js";

export interface DeliveryRuntimeExecutionAttemptOutcomeNormalizationWarningShape {
  code: DeliveryRuntimeExecutionAttemptOutcomeNormalizationWarningCode;
  message: string;
}

export interface ExecutionAttemptOutcomeNormalizationInputShape {
  lifecycle_artifact: ExecutionAttemptLifecycleShape;
  linked_audit_id?: AuditId;
  now?: IsoDateTimeString;
}

export interface ExecutionAttemptOutcomeFamilyMappingShape {
  attempt_family: ExecutionAttemptLifecycleShape["attempt_family"];
  contour_target: OperationalContour | "unknown";
  normalized_outcome_family: DeliveryRuntimeNormalizedExecutionAttemptOutcomeFamily;
}

export interface ExecutionAttemptLifecycleStateOutcomeMappingShape {
  lifecycle_state: ExecutionAttemptLifecycleShape["lifecycle_state"];
  lifecycle_result_family: ExecutionAttemptLifecycleShape["result_family"];
  normalized_outcome_status: DeliveryRuntimeNormalizedExecutionAttemptOutcomeStatus;
  normalized_outcome_result: DeliveryRuntimeNormalizedExecutionAttemptOutcomeResult;
  mapping_boundary: "lifecycle_state_to_non_executing_outcome_placeholder";
}

export interface ExecutionAttemptOutcomeFutureRuntimeBoundaryShape {
  future_handler_runtime_linkage_id: string;
  normalized_outcome_id: string;
  attempt_id: string;
  boundary_status: "normalized_outcome_contract_only_future_runtime_boundary";
  allowed_now: {
    lifecycle_state_to_outcome_mapping: true;
    runtime_surface_outcome_envelope_emission: true;
    integration_outcome_linkage_emission: true;
    audit_eval_outcome_linkage_emission: true;
  };
  disallowed_now: {
    handler_invocation: true;
    delivery_runtime_execution: true;
    transport_delivery: true;
    provider_sdk_execution: true;
    concrete_persistence_write: true;
    canonical_context_direct_access: true;
    canonical_context_direct_writeback: true;
  };
}

export interface NormalizedExecutionAttemptOutcomeShape {
  normalized_outcome_id: string;
  attempt_id: string;
  request_id: string;
  operation_id: string;
  precheck_id: string;
  dispatch_intent_id: string;
  runtime_handoff_id: string;
  normalized_outcome_family: DeliveryRuntimeNormalizedExecutionAttemptOutcomeFamily;
  normalized_outcome_status: DeliveryRuntimeNormalizedExecutionAttemptOutcomeStatus;
  normalized_outcome_result: DeliveryRuntimeNormalizedExecutionAttemptOutcomeResult;
  lifecycle_state: ExecutionAttemptLifecycleShape["lifecycle_state"];
  lifecycle_result_family: ExecutionAttemptLifecycleShape["result_family"];
  contour_target: OperationalContour | "unknown";
  outcome_family_mapping: ExecutionAttemptOutcomeFamilyMappingShape;
  lifecycle_state_outcome_mapping: ExecutionAttemptLifecycleStateOutcomeMappingShape;
  authority_context_placeholder: ExecutionAttemptLifecycleShape["authority_context_placeholder"];
  future_runtime_boundary: ExecutionAttemptOutcomeFutureRuntimeBoundaryShape;
  runtime_surface_outcome_envelope: RuntimeNormalizedExecutionAttemptOutcomeEnvelopeShape;
  integration_outcome_linkage: NormalizedExecutionAttemptOutcomeLinkageShape<Record<string, unknown>>;
  outcome_trace: NormalizedExecutionAttemptOutcomeTraceShape;
  outcome_audit_linkage: NormalizedExecutionAttemptOutcomeAuditLinkageShape;
  warnings: DeliveryRuntimeExecutionAttemptOutcomeNormalizationWarningShape[];
  created_at: IsoDateTimeString;
}

export interface NormalizedExecutionAttemptOutcomeSummaryShape {
  total: number;
  queued: number;
  prepared: number;
  blocked: number;
  deferred: number;
  aborted: number;
  expired: number;
  cancelled: number;
  not_dispatchable: number;
  by_normalized_outcome_family: Record<DeliveryRuntimeNormalizedExecutionAttemptOutcomeFamily, number>;
  warnings: DeliveryRuntimeExecutionAttemptOutcomeNormalizationWarningShape[];
}
