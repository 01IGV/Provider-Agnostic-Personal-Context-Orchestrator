import type { AuditId, IsoDateTimeString, OperationalContour } from "@orchestrator/core-foundation";
import type {
  PublicationDispatchReadinessAuditLinkageShape,
  PublicationDispatchReadinessTraceShape
} from "@orchestrator/audit-eval";
import type { PublicationDispatchReadinessLinkageShape } from "@orchestrator/integration-contracts";
import type { RuntimePublicationDispatchReadinessEnvelopeShape } from "@orchestrator/runtime-surface";
import type { ExecutionAttemptOutcomePublicationPreparationShape } from "./delivery-runtime-execution-attempt-outcome-publication-preparation-types.js";
import type {
  PublicationDispatchReadinessFamily,
  PublicationDispatchReadinessResult,
  PublicationDispatchReadinessStatus,
  PublicationDispatchReadinessWarningCode
} from "./publication-preparation-to-dispatch-readiness-vocabularies.js";

export interface PublicationDispatchReadinessWarningShape {
  code: PublicationDispatchReadinessWarningCode;
  message: string;
}

export interface PublicationDispatchReadinessInputShape {
  publication_preparation: ExecutionAttemptOutcomePublicationPreparationShape;
  linked_audit_id?: AuditId;
  now?: IsoDateTimeString;
}

export interface PublicationDispatchReadinessFamilyMappingShape {
  publication_preparation_family: ExecutionAttemptOutcomePublicationPreparationShape["publication_preparation_family"];
  contour_target: OperationalContour | "unknown";
  dispatch_readiness_family: PublicationDispatchReadinessFamily;
}

export interface PublicationPreparationDispatchReadinessMappingShape {
  publication_preparation_status: ExecutionAttemptOutcomePublicationPreparationShape["publication_preparation_status"];
  normalized_outcome_status: ExecutionAttemptOutcomePublicationPreparationShape["normalized_outcome_status"];
  lifecycle_state: ExecutionAttemptOutcomePublicationPreparationShape["lifecycle_state"];
  dispatch_readiness_status: PublicationDispatchReadinessStatus;
  dispatch_readiness_result: PublicationDispatchReadinessResult;
  mapping_boundary: "publication_ready_placeholder_to_dispatch_readiness_placeholder";
}

export interface PublicationDispatchReadinessBoundaryShape {
  dispatch_readiness_id: string;
  publication_preparation_id: string;
  normalized_outcome_id: string;
  attempt_id: string;
  boundary_status: "dispatch_readiness_contract_only_future_dispatch_boundary";
  allowed_now: {
    publication_preparation_to_dispatch_readiness_mapping: true;
    runtime_surface_dispatch_readiness_envelope_emission: true;
    integration_dispatch_readiness_linkage_emission: true;
    audit_eval_dispatch_readiness_linkage_emission: true;
  };
  disallowed_now: {
    actual_dispatch_execution: true;
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

export interface PublicationDispatchReadinessShape {
  dispatch_readiness_id: string;
  publication_preparation_id: string;
  normalized_outcome_id: string;
  attempt_id: string;
  request_id: string;
  operation_id: string;
  precheck_id: string;
  dispatch_intent_id: string;
  runtime_handoff_id: string;
  dispatch_readiness_family: PublicationDispatchReadinessFamily;
  dispatch_readiness_status: PublicationDispatchReadinessStatus;
  dispatch_readiness_result: PublicationDispatchReadinessResult;
  publication_preparation_family: ExecutionAttemptOutcomePublicationPreparationShape["publication_preparation_family"];
  publication_preparation_status: ExecutionAttemptOutcomePublicationPreparationShape["publication_preparation_status"];
  normalized_outcome_family: ExecutionAttemptOutcomePublicationPreparationShape["normalized_outcome_family"];
  normalized_outcome_status: ExecutionAttemptOutcomePublicationPreparationShape["normalized_outcome_status"];
  lifecycle_state: ExecutionAttemptOutcomePublicationPreparationShape["lifecycle_state"];
  contour_target: OperationalContour | "unknown";
  family_mapping: PublicationDispatchReadinessFamilyMappingShape;
  status_mapping: PublicationPreparationDispatchReadinessMappingShape;
  authority_context_placeholder: ExecutionAttemptOutcomePublicationPreparationShape["authority_context_placeholder"];
  dispatch_readiness_boundary: PublicationDispatchReadinessBoundaryShape;
  runtime_surface_dispatch_readiness_envelope: RuntimePublicationDispatchReadinessEnvelopeShape;
  integration_dispatch_readiness_linkage: PublicationDispatchReadinessLinkageShape<Record<string, unknown>>;
  dispatch_readiness_trace: PublicationDispatchReadinessTraceShape;
  dispatch_readiness_audit_linkage: PublicationDispatchReadinessAuditLinkageShape;
  warnings: PublicationDispatchReadinessWarningShape[];
  created_at: IsoDateTimeString;
}

export interface PublicationDispatchReadinessSummaryShape {
  total: number;
  queued: number;
  prepared: number;
  blocked: number;
  deferred: number;
  aborted: number;
  expired: number;
  cancelled: number;
  not_dispatchable: number;
  by_dispatch_readiness_family: Record<PublicationDispatchReadinessFamily, number>;
  warnings: PublicationDispatchReadinessWarningShape[];
}
