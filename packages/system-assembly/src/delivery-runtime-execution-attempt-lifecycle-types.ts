import type { AuditId, IsoDateTimeString, OperationalContour } from "@orchestrator/core-foundation";
import type {
  ExecutionAttemptLifecycleOutcomeAuditLinkageShape,
  ExecutionAttemptLifecycleTraceShape,
  ExecutionAttemptTransitionTraceShape
} from "@orchestrator/audit-eval";
import type { ExecutionAttemptLifecycleLinkageShape } from "@orchestrator/integration-contracts";
import type { RuntimeExecutionAttemptLifecycleEnvelopeShape } from "@orchestrator/runtime-surface";
import type { DeliveryRuntimeHandoffShape, DeliveryRuntimeHandoffWarningShape } from "./delivery-runtime-handoff-types.js";
import type {
  DeliveryRuntimeExecutionAttemptFamily,
  DeliveryRuntimeExecutionAttemptResultFamily,
  DeliveryRuntimeExecutionAttemptState,
  DeliveryRuntimeExecutionAttemptTransitionExpectation,
  DeliveryRuntimeExecutionAttemptWarningCode
} from "./delivery-runtime-execution-attempt-lifecycle-vocabularies.js";

export interface DeliveryRuntimeExecutionAttemptWarningShape {
  code: DeliveryRuntimeExecutionAttemptWarningCode;
  message: string;
}

export interface ExecutionAttemptAuthorityContextPlaceholderShape {
  authority_context_id?: string;
  subject_identity_ref?: string;
  delegated_authority_ref?: string;
  provenance_chain_ref?: string;
  control_plane_boundary: "gateway_control_plane_authority";
  runtime_boundary: "delivery_runtime_no_direct_context_authority";
  notes: string[];
}

export interface ExecutionAttemptLifecycleInputShape {
  runtime_handoff: DeliveryRuntimeHandoffShape;
  requested_initial_state?: DeliveryRuntimeExecutionAttemptState;
  authority_context_placeholder?: Partial<ExecutionAttemptAuthorityContextPlaceholderShape>;
  linked_audit_id?: AuditId;
  now?: IsoDateTimeString;
}

export interface ExecutionAttemptStateContractShape {
  state: DeliveryRuntimeExecutionAttemptState;
  reason: string;
  terminal: boolean;
  payload: Record<string, unknown>;
}

export interface ExecutionAttemptTransitionContractShape {
  transition_id: string;
  attempt_id: string;
  from_state: DeliveryRuntimeExecutionAttemptState;
  to_state: DeliveryRuntimeExecutionAttemptState;
  transition_expectation: DeliveryRuntimeExecutionAttemptTransitionExpectation;
  valid_transition: boolean;
  transition_reason: string;
  warnings: DeliveryRuntimeExecutionAttemptWarningShape[];
  transitioned_at: IsoDateTimeString;
}

export interface ExecutionAttemptReadinessExpectationShape {
  readiness: "ready_for_future_runtime" | "not_ready_for_future_runtime" | "requires_future_review";
  handler_invocation_allowed_now: false;
  transport_delivery_allowed_now: false;
  provider_sdk_call_allowed_now: false;
  canonical_context_access_allowed_now: false;
  canonical_writeback_allowed_now: false;
  reason: string;
}

export interface ExecutionAttemptFutureRuntimeBoundaryShape {
  future_handler_runtime_linkage_id: string;
  runtime_handoff_id: string;
  attempt_id: string;
  boundary_status: "contract_only_future_runtime_boundary";
  allowed_now: {
    lifecycle_contract_mapping: true;
    transition_contract_mapping: true;
    runtime_surface_envelope_emission: true;
    integration_linkage_emission: true;
    audit_eval_linkage_emission: true;
  };
  disallowed_now: {
    handler_invocation: true;
    transport_delivery: true;
    provider_sdk_execution: true;
    concrete_persistence_write: true;
    canonical_context_direct_access: true;
    canonical_context_direct_writeback: true;
  };
}

export interface ExecutionAttemptLifecycleShape {
  attempt_id: string;
  request_id: string;
  operation_id: string;
  precheck_id: string;
  dispatch_intent_id: string;
  runtime_handoff_id: string;
  attempt_family: DeliveryRuntimeExecutionAttemptFamily;
  contour_target: OperationalContour | "unknown";
  lifecycle_state: DeliveryRuntimeExecutionAttemptState;
  result_family: DeliveryRuntimeExecutionAttemptResultFamily;
  runtime_handoff_status: DeliveryRuntimeHandoffShape["handoff_status"];
  runtime_target_family: DeliveryRuntimeHandoffShape["runtime_target_expectation"]["target_family"];
  authority_context_placeholder: ExecutionAttemptAuthorityContextPlaceholderShape;
  readiness_expectation: ExecutionAttemptReadinessExpectationShape;
  state_contract: ExecutionAttemptStateContractShape;
  transition_contracts: ExecutionAttemptTransitionContractShape[];
  future_runtime_boundary: ExecutionAttemptFutureRuntimeBoundaryShape;
  runtime_surface_lifecycle_envelope: RuntimeExecutionAttemptLifecycleEnvelopeShape;
  integration_lifecycle_linkage: ExecutionAttemptLifecycleLinkageShape<Record<string, unknown>>;
  lifecycle_trace: ExecutionAttemptLifecycleTraceShape;
  outcome_audit_linkage: ExecutionAttemptLifecycleOutcomeAuditLinkageShape;
  transition_traces: ExecutionAttemptTransitionTraceShape[];
  inherited_runtime_handoff_warnings: DeliveryRuntimeHandoffWarningShape[];
  warnings: DeliveryRuntimeExecutionAttemptWarningShape[];
  created_at: IsoDateTimeString;
}

export interface ExecutionAttemptLifecycleSummaryShape {
  total: number;
  queued: number;
  prepared: number;
  blocked: number;
  deferred: number;
  aborted: number;
  expired: number;
  cancelled: number;
  not_dispatchable: number;
  by_attempt_family: Record<DeliveryRuntimeExecutionAttemptFamily, number>;
  warnings: DeliveryRuntimeExecutionAttemptWarningShape[];
}
