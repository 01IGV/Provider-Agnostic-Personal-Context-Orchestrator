import type { IsoDateTimeString, OperationalContour } from "@orchestrator/core-foundation";
import type { DeliveryDispatchPrecheckShape } from "./delivery-dispatch-intent-to-delivery-dispatch-precheck-types.js";
import type { DeliveryDispatchIntentShape } from "./dispatch-readiness-to-delivery-dispatch-intent-types.js";
import type { ExecutionAttemptOutcomePublicationPreparationShape } from "./delivery-runtime-execution-attempt-outcome-publication-preparation-types.js";
import type { NormalizedExecutionAttemptOutcomeShape } from "./delivery-runtime-execution-attempt-outcome-normalization-types.js";
import type { PublicationDispatchReadinessShape } from "./publication-preparation-to-dispatch-readiness-types.js";

export const END_TO_END_NON_EXECUTING_PROOF_STAGE_NAMES = [
  "request",
  "scope_context_resolution_placeholder",
  "context_selection_placeholder",
  "bounded_bundle_placeholder",
  "model_consumption_placeholder",
  "writeback_candidate_placeholder",
  "governance_decision_placeholder",
  "audit_trace_placeholder",
  "normalized_execution_attempt_outcome",
  "publication_preparation",
  "dispatch_readiness",
  "delivery_dispatch_intent",
  "delivery_dispatch_precheck",
  "deterministic_proof_summary"
] as const;

export type EndToEndNonExecutingProofStageName =
  (typeof END_TO_END_NON_EXECUTING_PROOF_STAGE_NAMES)[number];

export type EndToEndNonExecutingProofStageStatus =
  | "placeholder_only"
  | "existing_contract_builder_composed"
  | "deterministic_summary_emitted";

export type EndToEndNonExecutingProofSourcePackage =
  | "read-path"
  | "pack-loop"
  | "write-path"
  | "handoff"
  | "governance"
  | "audit-eval"
  | "integration-contracts"
  | "runtime-surface"
  | "provider-adapters"
  | "system-assembly";

export interface EndToEndNonExecutingProofStageShape {
  stage_name: EndToEndNonExecutingProofStageName;
  stage_status: EndToEndNonExecutingProofStageStatus;
  source_packages: EndToEndNonExecutingProofSourcePackage[];
  artifact_id: string;
  contour_target: OperationalContour | "unknown";
  actual_contour_execution: false;
  actual_runtime_execution: false;
  actual_dispatch_execution: false;
  actual_publication_delivery: false;
  actual_handler_invocation: false;
  actual_provider_sdk_call: false;
  actual_transport_execution: false;
  actual_concrete_persistence: false;
  direct_canonical_context_access: false;
  direct_canonical_writeback: false;
  notes: string[];
}

export interface EndToEndNonExecutingProofInputShape {
  proof_id: string;
  request_id: string;
  operation_id: string;
  contour_target: OperationalContour | "unknown";
  requested_at: IsoDateTimeString;
  authority_context_placeholder: NormalizedExecutionAttemptOutcomeShape["authority_context_placeholder"];
  normalized_outcome: NormalizedExecutionAttemptOutcomeShape;
  upstream_placeholders: EndToEndNonExecutingProofStageShape[];
  now?: IsoDateTimeString;
}

export interface EndToEndNonExecutingProofRuntimeActionAssertionsShape {
  actual_dispatch_execution: false;
  actual_publication_delivery: false;
  handler_invocation: false;
  delivery_runtime: false;
  transport_execution: false;
  provider_sdk_execution: false;
  concrete_persistence: false;
  direct_canonical_context_access: false;
  direct_canonical_writeback: false;
  runtime_permission: false;
  actual_contour_execution: false;
  real_model_call: false;
  real_storage_write: false;
}

export interface EndToEndNonExecutingProofBoundarySummaryShape {
  normalized_outcome_boundary: "normalized_placeholder_outcome_only";
  publication_preparation_boundary: "publication_ready_placeholder_only";
  dispatch_readiness_boundary: "dispatch_ready_placeholder_only";
  delivery_dispatch_intent_boundary: "delivery_dispatch_intent_placeholder_only";
  delivery_dispatch_precheck_boundary: "delivery_dispatch_precheck_placeholder_only";
  new_placeholder_layer_added: false;
  existing_contract_builders_reused: true;
}

export interface EndToEndNonExecutingProofIdChainShape {
  proof_id: string;
  request_id: string;
  operation_id: string;
  attempt_id: string;
  runtime_handoff_id: string;
  normalized_outcome_id: string;
  publication_preparation_id: string;
  dispatch_readiness_id: string;
  delivery_dispatch_intent_id: string;
  delivery_dispatch_precheck_id: string;
}

export interface EndToEndNonExecutingProofStatusChainShape {
  lifecycle_state: string;
  normalized_outcome_status: string;
  publication_preparation_status: string;
  dispatch_readiness_status: string;
  delivery_dispatch_intent_status: string;
  delivery_dispatch_precheck_status: string;
}

export interface EndToEndNonExecutingProofFamilyChainShape {
  normalized_outcome_family: string;
  publication_preparation_family: string;
  dispatch_readiness_family: string;
  delivery_dispatch_intent_family: string;
  delivery_dispatch_precheck_family: string;
}

export interface EndToEndNonExecutingProofIntegrationLinkageChainShape {
  normalized_outcome_linkage_id: string;
  publication_preparation_linkage_id: string;
  dispatch_readiness_linkage_id: string;
  delivery_dispatch_intent_linkage_id: string;
  delivery_dispatch_precheck_linkage_id: string;
}

export interface EndToEndNonExecutingProofAuditTraceChainShape {
  normalized_outcome_trace_id: string;
  publication_preparation_trace_id: string;
  dispatch_readiness_trace_id: string;
  delivery_dispatch_intent_trace_id: string;
  delivery_dispatch_precheck_trace_id: string;
}

export interface EndToEndNonExecutingProofArtifactShape {
  proof_id: string;
  request_id: string;
  operation_id: string;
  contour_target: OperationalContour | "unknown";
  proof_result: "end_to_end_non_executing_proof_path_composed";
  proof_boundary: "non_executing_contract_composition_only";
  authority_context_placeholder: NormalizedExecutionAttemptOutcomeShape["authority_context_placeholder"];
  upstream_placeholders: EndToEndNonExecutingProofStageShape[];
  normalized_outcome: NormalizedExecutionAttemptOutcomeShape;
  publication_preparation: ExecutionAttemptOutcomePublicationPreparationShape;
  dispatch_readiness: PublicationDispatchReadinessShape;
  delivery_dispatch_intent: DeliveryDispatchIntentShape;
  delivery_dispatch_precheck: DeliveryDispatchPrecheckShape;
  id_chain: EndToEndNonExecutingProofIdChainShape;
  status_chain: EndToEndNonExecutingProofStatusChainShape;
  family_chain: EndToEndNonExecutingProofFamilyChainShape;
  integration_linkage_chain: EndToEndNonExecutingProofIntegrationLinkageChainShape;
  audit_trace_chain: EndToEndNonExecutingProofAuditTraceChainShape;
  runtime_action_assertions: EndToEndNonExecutingProofRuntimeActionAssertionsShape;
  boundary_summary: EndToEndNonExecutingProofBoundarySummaryShape;
  warnings: Array<{ code: string; message: string }>;
  generated_at: IsoDateTimeString;
}

export interface EndToEndNonExecutingProofPathBuilder {
  compose(input: EndToEndNonExecutingProofInputShape): EndToEndNonExecutingProofArtifactShape;
}
