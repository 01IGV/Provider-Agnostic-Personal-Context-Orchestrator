import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type {
  FirstExecutableAdjacentContourInvocationTarget,
  FirstExecutableAdjacentInvocationBoundaryStatus
} from "./first-executable-adjacent-contour-invocation-seam-vocabularies.js";
import type {
  FirstExecutableAdjacentInvocationAuthorityContextPlaceholderShape,
  FirstExecutableAdjacentInvocationBoundaryShape
} from "./first-executable-adjacent-contour-invocation-seam-types.js";

export type InvocationDenialProofContractVersion = "invocation-denial-proof/v1";

export type InvocationDenialProofResult = "invocation_denial_default_deny_proven";

export type InvocationDenialProofBoundary = "machine_checkable_invocation_denial_proof_only";

export type InvocationDenialProofFailureCode =
  | "invocation_not_executable_adjacent"
  | "invocation_executable_now_not_false"
  | "runtime_permission_not_false"
  | "denial_flags_not_all_false"
  | "actual_contour_execution_allowed"
  | "runtime_handler_invocation_allowed"
  | "provider_sdk_call_allowed"
  | "concrete_persistence_write_allowed"
  | "direct_canonical_context_access_allowed"
  | "direct_canonical_writeback_allowed"
  | "dispatch_execution_allowed"
  | "publication_delivery_allowed"
  | "delivery_runtime_allowed"
  | "transport_execution_allowed"
  | "real_model_call_allowed"
  | "real_storage_write_allowed"
  | "execution_layer_handoff_allowed"
  | "actual_execution_allowed"
  | "source_runtime_action_assertions_not_false";

export interface InvocationDenialProofFailureShape {
  code: InvocationDenialProofFailureCode;
  path: string;
  expected: true | false;
  actual: unknown;
  message: string;
}

export interface InvocationDenialProofAuthorityContextPlaceholderShape {
  authority_context_id?: string;
  subject_identity_ref?: string;
  delegated_authority_ref?: string;
  provenance_chain_ref?: string;
  control_plane_boundary: "gateway_control_plane_authority";
  runtime_boundary: "delivery_runtime_no_direct_context_authority";
}

export interface InvocationDenialProofReadinessAssertionShape {
  invocation_readiness_id: string;
  readiness_status: "candidate_for_future_execution_layer" | "not_ready_for_future_execution_layer";
  execution_layer_handoff_allowed_now: false;
  actual_execution_allowed_now: false;
}

export interface InvocationDenialProofDenialAssertionsShape {
  actual_contour_execution_allowed_now: false;
  runtime_handler_invocation_allowed_now: false;
  provider_sdk_call_allowed_now: false;
  concrete_persistence_write_allowed_now: false;
  direct_canonical_context_access_allowed_now: false;
  direct_canonical_writeback_allowed_now: false;
  dispatch_execution_allowed_now: false;
  publication_delivery_allowed_now: false;
  delivery_runtime_allowed_now: false;
  transport_execution_allowed_now: false;
  real_model_call_allowed_now: false;
  real_storage_write_allowed_now: false;
}

export interface InvocationDenialProofSourceShape {
  source_invocation_seam_id: string;
  source_invocation_intent_id: string;
  source_invocation_readiness_id: string;
  source_proof_artifact_ref: string;
  source_proof_reference_id: string;
  source_contour_target: FirstExecutableAdjacentContourInvocationTarget;
  source_seam_status: FirstExecutableAdjacentInvocationBoundaryStatus;
  source_runtime_action_assertions_all_false: true;
}

export interface InvocationDenialProofSummaryShape extends InvocationDenialProofSourceShape {
  contract_version: InvocationDenialProofContractVersion;
  proof_id: string;
  proof_result: InvocationDenialProofResult;
  proof_boundary: InvocationDenialProofBoundary;
  executable_adjacent: true;
  executable_now: false;
  runtime_permission_granted: false;
  denial_flags_all_false: true;
  denial_assertions: InvocationDenialProofDenialAssertionsShape;
  readiness_assertions: InvocationDenialProofReadinessAssertionShape;
  authority_context_placeholder: InvocationDenialProofAuthorityContextPlaceholderShape;
  failure_count: 0;
  failures: [];
  generated_at: IsoDateTimeString;
}

export interface InvocationDenialProofInputShape {
  invocation_seam: FirstExecutableAdjacentInvocationBoundaryShape;
  now?: IsoDateTimeString;
}

export interface InvocationDenialProofBuilder {
  create(input: InvocationDenialProofInputShape): InvocationDenialProofSummaryShape;
  findFailures(input: InvocationDenialProofSummaryShape): InvocationDenialProofFailureShape[];
  assertDefaultDeny(input: InvocationDenialProofSummaryShape): true;
}

export type InvocationDenialProofVerificationResult =
  | "invocation_denial_default_deny_verified"
  | "invocation_denial_default_deny_failed";

export interface InvocationDenialProofVerificationSummaryShape {
  verification_result: InvocationDenialProofVerificationResult;
  contract_version: InvocationDenialProofContractVersion;
  proof_id: string;
  source_invocation_seam_id: string;
  source_contour_target: FirstExecutableAdjacentContourInvocationTarget;
  executable_adjacent: true;
  executable_now: false;
  runtime_permission_granted: false;
  denial_flags_all_false: true;
  failure_count: number;
}
