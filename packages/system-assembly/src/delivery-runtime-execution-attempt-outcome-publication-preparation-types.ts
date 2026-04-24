import type { AuditId, IsoDateTimeString, OperationalContour } from "@orchestrator/core-foundation";
import type {
  ExecutionAttemptOutcomePublicationPreparationAuditLinkageShape,
  ExecutionAttemptOutcomePublicationPreparationTraceShape
} from "@orchestrator/audit-eval";
import type { ExecutionAttemptOutcomePublicationPreparationLinkageShape } from "@orchestrator/integration-contracts";
import type { RuntimeExecutionAttemptOutcomePublicationPreparationEnvelopeShape } from "@orchestrator/runtime-surface";
import type { NormalizedExecutionAttemptOutcomeShape } from "./delivery-runtime-execution-attempt-outcome-normalization-types.js";
import type {
  DeliveryRuntimeExecutionAttemptOutcomePublicationPreparationFamily,
  DeliveryRuntimeExecutionAttemptOutcomePublicationPreparationResult,
  DeliveryRuntimeExecutionAttemptOutcomePublicationPreparationStatus,
  DeliveryRuntimeExecutionAttemptOutcomePublicationPreparationWarningCode
} from "./delivery-runtime-execution-attempt-outcome-publication-preparation-vocabularies.js";

export interface DeliveryRuntimeExecutionAttemptOutcomePublicationPreparationWarningShape {
  code: DeliveryRuntimeExecutionAttemptOutcomePublicationPreparationWarningCode;
  message: string;
}

export interface ExecutionAttemptOutcomePublicationPreparationInputShape {
  normalized_outcome: NormalizedExecutionAttemptOutcomeShape;
  linked_audit_id?: AuditId;
  now?: IsoDateTimeString;
}

export interface ExecutionAttemptOutcomePublicationPreparationFamilyMappingShape {
  normalized_outcome_family: NormalizedExecutionAttemptOutcomeShape["normalized_outcome_family"];
  contour_target: OperationalContour | "unknown";
  publication_preparation_family: DeliveryRuntimeExecutionAttemptOutcomePublicationPreparationFamily;
}

export interface NormalizedOutcomePublicationPreparationMappingShape {
  normalized_outcome_status: NormalizedExecutionAttemptOutcomeShape["normalized_outcome_status"];
  lifecycle_state: NormalizedExecutionAttemptOutcomeShape["lifecycle_state"];
  publication_preparation_status: DeliveryRuntimeExecutionAttemptOutcomePublicationPreparationStatus;
  publication_preparation_result: DeliveryRuntimeExecutionAttemptOutcomePublicationPreparationResult;
  mapping_boundary: "normalized_outcome_to_publication_ready_placeholder";
}

export interface ExecutionAttemptOutcomePublicationPreparationBoundaryShape {
  publication_preparation_id: string;
  normalized_outcome_id: string;
  attempt_id: string;
  boundary_status: "publication_preparation_contract_only_future_publication_boundary";
  allowed_now: {
    normalized_outcome_to_publication_preparation_mapping: true;
    runtime_surface_publication_preparation_envelope_emission: true;
    integration_publication_preparation_linkage_emission: true;
    audit_eval_publication_preparation_linkage_emission: true;
  };
  disallowed_now: {
    actual_publication_delivery: true;
    handler_invocation: true;
    delivery_runtime_execution: true;
    transport_delivery: true;
    provider_sdk_execution: true;
    concrete_persistence_write: true;
    canonical_context_direct_access: true;
    canonical_context_direct_writeback: true;
  };
}

export interface ExecutionAttemptOutcomePublicationPreparationShape {
  publication_preparation_id: string;
  normalized_outcome_id: string;
  attempt_id: string;
  request_id: string;
  operation_id: string;
  precheck_id: string;
  dispatch_intent_id: string;
  runtime_handoff_id: string;
  publication_preparation_family: DeliveryRuntimeExecutionAttemptOutcomePublicationPreparationFamily;
  publication_preparation_status: DeliveryRuntimeExecutionAttemptOutcomePublicationPreparationStatus;
  publication_preparation_result: DeliveryRuntimeExecutionAttemptOutcomePublicationPreparationResult;
  normalized_outcome_family: NormalizedExecutionAttemptOutcomeShape["normalized_outcome_family"];
  normalized_outcome_status: NormalizedExecutionAttemptOutcomeShape["normalized_outcome_status"];
  lifecycle_state: NormalizedExecutionAttemptOutcomeShape["lifecycle_state"];
  contour_target: OperationalContour | "unknown";
  family_mapping: ExecutionAttemptOutcomePublicationPreparationFamilyMappingShape;
  status_mapping: NormalizedOutcomePublicationPreparationMappingShape;
  authority_context_placeholder: NormalizedExecutionAttemptOutcomeShape["authority_context_placeholder"];
  publication_boundary: ExecutionAttemptOutcomePublicationPreparationBoundaryShape;
  runtime_surface_publication_preparation_envelope: RuntimeExecutionAttemptOutcomePublicationPreparationEnvelopeShape;
  integration_publication_preparation_linkage: ExecutionAttemptOutcomePublicationPreparationLinkageShape<Record<string, unknown>>;
  publication_preparation_trace: ExecutionAttemptOutcomePublicationPreparationTraceShape;
  publication_preparation_audit_linkage: ExecutionAttemptOutcomePublicationPreparationAuditLinkageShape;
  warnings: DeliveryRuntimeExecutionAttemptOutcomePublicationPreparationWarningShape[];
  created_at: IsoDateTimeString;
}

export interface ExecutionAttemptOutcomePublicationPreparationSummaryShape {
  total: number;
  queued: number;
  prepared: number;
  blocked: number;
  deferred: number;
  aborted: number;
  expired: number;
  cancelled: number;
  not_dispatchable: number;
  by_publication_preparation_family: Record<DeliveryRuntimeExecutionAttemptOutcomePublicationPreparationFamily, number>;
  warnings: DeliveryRuntimeExecutionAttemptOutcomePublicationPreparationWarningShape[];
}
