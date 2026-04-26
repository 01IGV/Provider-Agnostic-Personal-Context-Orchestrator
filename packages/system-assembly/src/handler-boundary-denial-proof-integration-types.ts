import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type {
  RuntimeAdjacentHandlerBoundaryContourTarget,
  RuntimeAdjacentHandlerBoundaryShape,
  RuntimeAdjacentHandlerBoundaryStatus
} from "@orchestrator/runtime-surface";

export type HandlerBoundaryDenialProofContractVersion = "handler-boundary-denial-proof/v1";

export type HandlerBoundaryDenialProofResult = "handler_boundary_denial_default_deny_proven";

export type HandlerBoundaryDenialProofBoundary = "machine_checkable_handler_boundary_denial_proof_only";

export type HandlerBoundaryDenialProofFailureCode =
  | "handler_boundary_not_runtime_adjacent"
  | "handler_boundary_not_runtime_handler_boundary"
  | "handler_execution_not_false"
  | "runtime_permission_not_false"
  | "actual_contour_execution_not_false"
  | "denial_flags_not_all_false"
  | "handler_invocation_allowed"
  | "handler_execution_allowed"
  | "runtime_dispatch_allowed"
  | "provider_sdk_call_allowed"
  | "transport_execution_allowed"
  | "concrete_persistence_write_allowed"
  | "direct_canonical_context_access_allowed"
  | "direct_canonical_writeback_allowed"
  | "actual_contour_execution_allowed"
  | "real_model_call_allowed"
  | "real_storage_write_allowed"
  | "source_invocation_denial_not_verified"
  | "source_invocation_not_executable_adjacent"
  | "source_invocation_executable_now_not_false"
  | "source_invocation_runtime_permission_not_false"
  | "source_invocation_denial_flags_not_false"
  | "handler_boundary_intent_execution_allowed"
  | "handler_boundary_readiness_invocation_allowed"
  | "handler_boundary_readiness_execution_allowed"
  | "handler_boundary_readiness_dispatch_allowed"
  | "handler_boundary_readiness_runtime_permission_not_false";

export interface HandlerBoundaryDenialProofFailureShape {
  code: HandlerBoundaryDenialProofFailureCode;
  path: string;
  expected: true | false;
  actual: unknown;
  message: string;
}

export interface HandlerBoundaryDenialProofAuthorityContextPlaceholderShape {
  authority_context_id?: string;
  subject_identity_ref?: string;
  delegated_authority_ref?: string;
  provenance_chain_ref?: string;
  control_plane_boundary: "gateway_control_plane_authority";
  runtime_boundary: "delivery_runtime_no_direct_context_authority";
}

export interface HandlerBoundaryDenialProofDenialAssertionsShape {
  handler_invocation_allowed_now: false;
  handler_execution_allowed_now: false;
  runtime_dispatch_allowed_now: false;
  provider_sdk_call_allowed_now: false;
  transport_execution_allowed_now: false;
  concrete_persistence_write_allowed_now: false;
  direct_canonical_context_access_allowed_now: false;
  direct_canonical_writeback_allowed_now: false;
  actual_contour_execution_allowed_now: false;
  runtime_permission_granted: false;
  real_model_call_allowed_now: false;
  real_storage_write_allowed_now: false;
}

export interface HandlerBoundaryDenialProofReadinessAssertionsShape {
  handler_boundary_readiness_id: string;
  readiness_status: "candidate_for_future_handler_runtime" | "not_ready_for_future_handler_runtime";
  handler_invocation_allowed_now: false;
  handler_execution_allowed_now: false;
  runtime_dispatch_allowed_now: false;
  runtime_permission_granted: false;
}

export interface HandlerBoundaryDenialProofIntentAssertionsShape {
  handler_boundary_intent_id: string;
  intent_status: "handler_boundary_intent_recorded";
  runtime_adjacent: true;
  runtime_handler_boundary: true;
  handler_execution_allowed_now: false;
  runtime_permission_granted: false;
}

export interface HandlerBoundaryDenialProofSourceInvocationAssertionsShape {
  source_invocation_denial_contract_version: "invocation-denial-proof/v1";
  source_invocation_denial_verified: true;
  source_invocation_executable_adjacent: true;
  source_invocation_executable_now: false;
  source_invocation_runtime_permission_granted: false;
  source_invocation_denial_flags_all_false: true;
}

export interface HandlerBoundaryDenialProofSourceShape {
  source_handler_boundary_id: string;
  source_invocation_denial_proof_id: string;
  source_invocation_seam_id: string;
  source_contour_target: RuntimeAdjacentHandlerBoundaryContourTarget;
  source_handler_boundary_status: RuntimeAdjacentHandlerBoundaryStatus;
}

export interface HandlerBoundaryDenialProofSummaryShape extends HandlerBoundaryDenialProofSourceShape {
  contract_version: HandlerBoundaryDenialProofContractVersion;
  proof_id: string;
  proof_result: HandlerBoundaryDenialProofResult;
  proof_boundary: HandlerBoundaryDenialProofBoundary;
  runtime_adjacent: true;
  runtime_handler_boundary: true;
  handler_execution_allowed_now: false;
  runtime_permission_granted: false;
  actual_contour_execution_allowed_now: false;
  denial_flags_all_false: true;
  source_invocation_assertions: HandlerBoundaryDenialProofSourceInvocationAssertionsShape;
  denial_assertions: HandlerBoundaryDenialProofDenialAssertionsShape;
  readiness_assertions: HandlerBoundaryDenialProofReadinessAssertionsShape;
  intent_assertions: HandlerBoundaryDenialProofIntentAssertionsShape;
  authority_context_placeholder: HandlerBoundaryDenialProofAuthorityContextPlaceholderShape;
  failure_count: 0;
  failures: [];
  generated_at: IsoDateTimeString;
}

export interface HandlerBoundaryDenialProofInputShape {
  handler_boundary: RuntimeAdjacentHandlerBoundaryShape;
  source_invocation_executable_adjacent?: true;
  source_invocation_executable_now?: false;
  source_invocation_runtime_permission_granted?: false;
  source_invocation_denial_flags_all_false?: true;
  now?: IsoDateTimeString;
}

export interface HandlerBoundaryDenialProofBuilder {
  create(input: HandlerBoundaryDenialProofInputShape): HandlerBoundaryDenialProofSummaryShape;
  findFailures(input: HandlerBoundaryDenialProofSummaryShape): HandlerBoundaryDenialProofFailureShape[];
  assertDefaultDeny(input: HandlerBoundaryDenialProofSummaryShape): true;
}

export type HandlerBoundaryDenialProofVerificationResult =
  | "handler_boundary_denial_default_deny_verified"
  | "handler_boundary_denial_default_deny_failed";

export interface HandlerBoundaryDenialProofVerificationSummaryShape {
  verification_result: HandlerBoundaryDenialProofVerificationResult;
  contract_version: HandlerBoundaryDenialProofContractVersion;
  proof_id: string;
  source_handler_boundary_id: string;
  source_invocation_denial_proof_id: string;
  source_contour_target: RuntimeAdjacentHandlerBoundaryContourTarget;
  runtime_adjacent: true;
  runtime_handler_boundary: true;
  handler_execution_allowed_now: false;
  runtime_permission_granted: false;
  actual_contour_execution_allowed_now: false;
  denial_flags_all_false: true;
  failure_count: number;
}
