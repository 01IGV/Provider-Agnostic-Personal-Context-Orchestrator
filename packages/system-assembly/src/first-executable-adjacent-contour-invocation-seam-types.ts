import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type { EndToEndNonExecutingProofArtifactShape } from "./end-to-end-non-executing-proof-path-types.js";
import type {
  FirstExecutableAdjacentContourInvocationTarget,
  FirstExecutableAdjacentInvocationBoundaryStatus,
  FirstExecutableAdjacentInvocationDenialReason,
  FirstExecutableAdjacentInvocationWarningCode
} from "./first-executable-adjacent-contour-invocation-seam-vocabularies.js";

export interface FirstExecutableAdjacentInvocationWarningShape {
  code: FirstExecutableAdjacentInvocationWarningCode;
  message: string;
}

export interface FirstExecutableAdjacentInvocationSourceProofReferenceShape {
  source_proof_reference_id: string;
  proof_id: string;
  request_id: string;
  operation_id: string;
  source_contour_target: FirstExecutableAdjacentContourInvocationTarget;
  source_proof_result: EndToEndNonExecutingProofArtifactShape["proof_result"];
  source_proof_boundary: EndToEndNonExecutingProofArtifactShape["proof_boundary"];
  source_normalized_outcome_id: string;
  source_delivery_dispatch_precheck_id: string;
  source_runtime_action_assertions_all_false: true;
}

export interface FirstExecutableAdjacentInvocationAuthorityContextPlaceholderShape {
  authority_context_id?: string;
  subject_identity_ref?: string;
  delegated_authority_ref?: string;
  provenance_chain_ref?: string;
  control_plane_boundary: "gateway_control_plane_authority";
  runtime_boundary: "delivery_runtime_no_direct_context_authority";
  notes: string[];
}

export interface FirstExecutableAdjacentInvocationDenialFlagsShape {
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

export interface FirstExecutableAdjacentInvocationIntentShape {
  invocation_intent_id: string;
  request_id: string;
  operation_id: string;
  contour_target: FirstExecutableAdjacentContourInvocationTarget;
  intent_status: "future_contour_invocation_intent_recorded";
  intent_boundary: "executable_adjacent_contract_only";
  source_proof_reference_id: string;
  guardrail_notes: string[];
}

export interface FirstExecutableAdjacentInvocationReadinessShape {
  invocation_readiness_id: string;
  request_id: string;
  operation_id: string;
  contour_target: FirstExecutableAdjacentContourInvocationTarget;
  readiness_status: "candidate_for_future_execution_layer" | "not_ready_for_future_execution_layer";
  boundary_status: FirstExecutableAdjacentInvocationBoundaryStatus;
  denial_reasons: FirstExecutableAdjacentInvocationDenialReason[];
  execution_layer_handoff_allowed_now: false;
  actual_execution_allowed_now: false;
  readiness_notes: string[];
}

export interface FirstExecutableAdjacentInvocationBoundaryShape {
  boundary_id: string;
  request_id: string;
  operation_id: string;
  contour_target: FirstExecutableAdjacentContourInvocationTarget;
  boundary_status: FirstExecutableAdjacentInvocationBoundaryStatus;
  source_proof_reference: FirstExecutableAdjacentInvocationSourceProofReferenceShape;
  authority_context_placeholder: FirstExecutableAdjacentInvocationAuthorityContextPlaceholderShape;
  invocation_intent: FirstExecutableAdjacentInvocationIntentShape;
  invocation_readiness: FirstExecutableAdjacentInvocationReadinessShape;
  denial_flags: FirstExecutableAdjacentInvocationDenialFlagsShape;
  denial_reasons: FirstExecutableAdjacentInvocationDenialReason[];
  warnings: FirstExecutableAdjacentInvocationWarningShape[];
  guardrail_notes: string[];
  created_at: IsoDateTimeString;
}

export interface FirstExecutableAdjacentInvocationSeamInputShape {
  proof_artifact: EndToEndNonExecutingProofArtifactShape;
  requested_boundary_status?: FirstExecutableAdjacentInvocationBoundaryStatus;
  now?: IsoDateTimeString;
}

export interface FirstExecutableAdjacentInvocationSeamSummaryShape {
  seam_id: string;
  request_id: string;
  operation_id: string;
  contour_target: FirstExecutableAdjacentContourInvocationTarget;
  boundary_status: FirstExecutableAdjacentInvocationBoundaryStatus;
  executable_adjacent: true;
  executable_now: false;
  source_proof_id: string;
  denial_flags_all_false: true;
  runtime_permission_granted: false;
  guardrail_notes: string[];
}

export interface FirstExecutableAdjacentContourInvocationSeamBuilder {
  create(input: FirstExecutableAdjacentInvocationSeamInputShape): FirstExecutableAdjacentInvocationBoundaryShape;
  summarize(input: FirstExecutableAdjacentInvocationBoundaryShape): FirstExecutableAdjacentInvocationSeamSummaryShape;
}
