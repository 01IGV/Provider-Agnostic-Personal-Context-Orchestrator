import type {
  CorrelationId,
  IsoDateTimeString,
  ScopeId
} from "@orchestrator/core-foundation";
import type { RequestVisibilityLevel } from "./vocabularies.js";
import type {
  AgentContextAuthorityEnvelopeShape,
  AgentContextRequestBoundaryShape,
  BoundedContextResponseEnvelopeShape
} from "./agent-context-request-boundary-types.js";
import type {
  LocalDeterministicContextMaterializationBoundary,
  LocalDeterministicContextSourceAdapterStatus,
  LocalDeterministicContextSourceKind,
  LocalDeterministicContextSourceWarningCode
} from "./local-deterministic-context-source-adapter-vocabularies.js";

export interface LocalDeterministicContextSourceWarningShape {
  code: LocalDeterministicContextSourceWarningCode;
  message: string;
}

export interface LocalDeterministicContextSourceExecutionPostureShape {
  local_only: true;
  deterministic: true;
  contract_only: true;
  network_access_allowed_now: false;
  provider_sdk_call_allowed_now: false;
  transport_execution_allowed_now: false;
  concrete_persistence_read_allowed_now: false;
  concrete_persistence_write_allowed_now: false;
  real_model_call_allowed_now: false;
  real_storage_write_allowed_now: false;
  runtime_handler_bound: false;
  actual_contour_execution_allowed_now: false;
}

export interface LocalDeterministicContextSourceItemShape {
  source_item_id: string;
  source_ref: string;
  source_kind: LocalDeterministicContextSourceKind;
  scope_id: ScopeId;
  visibility: RequestVisibilityLevel;
  deterministic_order: number;
  provenance_ref: string;
  permission_ref: string;
  audit_ref: string;
  content_digest: string;
  content: Record<string, unknown>;
}

export interface BoundedContextPackageExecutionPostureShape {
  contract_only: true;
  deterministic: true;
  local_only: true;
  canonical_persistence_read_performed: false;
  provider_response_included: false;
  model_output_included: false;
  storage_content_included: false;
  contour_execution_result_included: false;
  runtime_permission_granted: false;
  actual_contour_execution_allowed_now: false;
}

export interface BoundedContextPackageItemShape {
  package_item_id: string;
  source_item_id: string;
  source_ref: string;
  source_kind: LocalDeterministicContextSourceKind;
  deterministic_order: number;
  content_digest: string;
  provenance_ref: string;
  permission_ref: string;
  audit_ref: string;
}

export interface BoundedContextPackageEnvelopeShape {
  bounded_context_package_id: string;
  package_version: "bounded-context-package-envelope/v1";
  agent_context_request_id: string;
  adapter_result_id: string;
  package_boundary: "contract_only_bounded_context_package";
  authority: AgentContextAuthorityEnvelopeShape;
  execution_posture: BoundedContextPackageExecutionPostureShape;
  package_items: BoundedContextPackageItemShape[];
  source_item_count: number;
  provenance_envelope_ref: string;
  permission_envelope_ref: string;
  audit_envelope_ref: string;
  generated_at: IsoDateTimeString;
  correlation_id?: CorrelationId;
}

export interface LocalDeterministicContextSourceAdapterResultShape {
  adapter_result_id: string;
  adapter_status: LocalDeterministicContextSourceAdapterStatus;
  materialization_boundary: LocalDeterministicContextMaterializationBoundary;
  authority: AgentContextAuthorityEnvelopeShape;
  execution_posture: LocalDeterministicContextSourceExecutionPostureShape;
  source_items: LocalDeterministicContextSourceItemShape[];
  provenance_envelope_ref: string;
  permission_envelope_ref: string;
  audit_envelope_ref: string;
  generated_at: IsoDateTimeString;
  correlation_id?: CorrelationId;
  warnings: LocalDeterministicContextSourceWarningShape[];
}

export interface LocalDeterministicContextSourceAdapterBuilderInputShape {
  adapter_result_id: string;
  authority: AgentContextAuthorityEnvelopeShape;
  source_items: LocalDeterministicContextSourceItemShape[];
  provenance_envelope_ref: string;
  permission_envelope_ref: string;
  audit_envelope_ref: string;
  adapter_status?: LocalDeterministicContextSourceAdapterStatus;
  materialization_boundary?: LocalDeterministicContextMaterializationBoundary;
  generated_at: IsoDateTimeString;
  correlation_id?: CorrelationId;
  warnings?: LocalDeterministicContextSourceWarningShape[];
}

export interface LocalDeterministicBoundedContextMaterializationInputShape {
  request: AgentContextRequestBoundaryShape;
  adapter_result: LocalDeterministicContextSourceAdapterResultShape;
  served_at: IsoDateTimeString;
  package_envelope?: BoundedContextPackageEnvelopeShape;
  bounded_context_package_ref?: string;
  context_bundle_ref?: string;
}

export interface LocalDeterministicContextSourceAdapterBuilder {
  createAdapterResult(
    input: LocalDeterministicContextSourceAdapterBuilderInputShape
  ): LocalDeterministicContextSourceAdapterResultShape;
  materializeResponse(
    input: LocalDeterministicBoundedContextMaterializationInputShape
  ): BoundedContextResponseEnvelopeShape;
  createBoundedContextPackageEnvelope(
    request: AgentContextRequestBoundaryShape,
    adapter_result: LocalDeterministicContextSourceAdapterResultShape
  ): BoundedContextPackageEnvelopeShape;
}
