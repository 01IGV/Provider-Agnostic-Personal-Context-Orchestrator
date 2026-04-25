import type { OperationalContour } from "@orchestrator/core-foundation";
import type {
  EndToEndNonExecutingProofAuditTraceChainShape,
  EndToEndNonExecutingProofBoundarySummaryShape,
  EndToEndNonExecutingProofFamilyChainShape,
  EndToEndNonExecutingProofIntegrationLinkageChainShape,
  EndToEndNonExecutingProofRuntimeActionAssertionsShape,
  EndToEndNonExecutingProofSourcePackage,
  EndToEndNonExecutingProofStageName,
  EndToEndNonExecutingProofStageStatus,
  EndToEndNonExecutingProofStatusChainShape
} from "./end-to-end-non-executing-proof-path-types.js";

export const STABLE_PROOF_ARTIFACT_CONTRACT_VERSION = "stable-proof-artifact-contract/v1" as const;

export const STABLE_PROOF_ARTIFACT_GENERATED_AT = "2026-04-24T00:00:00.000Z" as const;

export const STABLE_PROOF_ARTIFACT_RUNTIME_ACTION_ASSERTION_KEYS = [
  "actual_dispatch_execution",
  "actual_publication_delivery",
  "handler_invocation",
  "delivery_runtime",
  "transport_execution",
  "provider_sdk_execution",
  "concrete_persistence",
  "direct_canonical_context_access",
  "direct_canonical_writeback",
  "runtime_permission",
  "actual_contour_execution",
  "real_model_call",
  "real_storage_write"
] as const;

export type StableProofArtifactContractVersion = typeof STABLE_PROOF_ARTIFACT_CONTRACT_VERSION;

export type StableProofArtifactGeneratedAt = typeof STABLE_PROOF_ARTIFACT_GENERATED_AT;

export type StableProofArtifactRuntimeActionAssertionKey =
  (typeof STABLE_PROOF_ARTIFACT_RUNTIME_ACTION_ASSERTION_KEYS)[number];

export interface StableProofArtifactStageShape {
  stage_name: EndToEndNonExecutingProofStageName;
  stage_status: EndToEndNonExecutingProofStageStatus;
  artifact_id: string;
  contour_target: OperationalContour | "unknown";
  source_packages: EndToEndNonExecutingProofSourcePackage[];
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
}

export interface StableProofArtifactDeliveryAdjacentChainShape {
  normalized_outcome_id: string;
  publication_preparation_id: string;
  dispatch_readiness_id: string;
  delivery_dispatch_intent_id: string;
  delivery_dispatch_precheck_id: string;
}

export interface StableProofArtifactAuthorityContextPlaceholderShape {
  authority_context_id?: string;
  subject_identity_ref?: string;
  delegated_authority_ref?: string;
  provenance_chain_ref?: string;
  control_plane_boundary: "gateway_control_plane_authority";
  runtime_boundary: "delivery_runtime_no_direct_context_authority";
}

export type StableProofArtifactRuntimeActionAssertionsShape =
  EndToEndNonExecutingProofRuntimeActionAssertionsShape;

export type StableProofArtifactNonExecutingStatementShape =
  EndToEndNonExecutingProofRuntimeActionAssertionsShape;

export interface StableProofArtifactRuntimeActionAssertionFailureShape {
  key: StableProofArtifactRuntimeActionAssertionKey;
  value: unknown;
}

export interface StableProofArtifactSummaryShape {
  contract_version: StableProofArtifactContractVersion;
  proof_result: "end_to_end_non_executing_proof_path_composed";
  proof_boundary: "non_executing_contract_composition_only";
  proof_id: string;
  request_id: string;
  operation_id: string;
  contour_target: OperationalContour | "unknown";
  stage_chain: StableProofArtifactStageShape[];
  delivery_adjacent_chain: StableProofArtifactDeliveryAdjacentChainShape;
  status_chain: EndToEndNonExecutingProofStatusChainShape;
  family_chain: EndToEndNonExecutingProofFamilyChainShape;
  integration_linkage_chain: EndToEndNonExecutingProofIntegrationLinkageChainShape;
  audit_trace_chain: EndToEndNonExecutingProofAuditTraceChainShape;
  authority_context_placeholder: StableProofArtifactAuthorityContextPlaceholderShape;
  runtime_action_assertions: StableProofArtifactRuntimeActionAssertionsShape;
  boundary_summary: EndToEndNonExecutingProofBoundarySummaryShape;
  non_executing_statement: StableProofArtifactNonExecutingStatementShape;
  generated_at: StableProofArtifactGeneratedAt;
}
