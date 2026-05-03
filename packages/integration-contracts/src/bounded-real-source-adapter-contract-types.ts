import type {
  CorrelationId,
  IsoDateTimeString,
  ScopeId
} from "@orchestrator/core-foundation";
import type { AgentContextAuthorityEnvelopeShape } from "./agent-context-request-boundary-types.js";
import type {
  BoundedRealSourceAdapterCapabilityBoundary,
  BoundedRealSourceAdapterContractBoundary,
  BoundedRealSourceAdapterMaterializationBoundary,
  BoundedRealSourceAdapterSourceKind,
  BoundedRealSourceAdapterWarningCode
} from "./bounded-real-source-adapter-contract-vocabularies.js";

export interface BoundedRealSourceAdapterWarningShape {
  code: BoundedRealSourceAdapterWarningCode;
  message: string;
}

export interface BoundedRealSourceAdapterSelectionPolicyShape {
  allowlisted_scope_selection_required: true;
  source_catalog_required: true;
  arbitrary_file_paths_allowed: false;
  user_selected_paths_allowed: false;
  directory_traversal_allowed: false;
  unknown_scope_grants_access: false;
}

export interface BoundedRealSourceAdapterExecutionPostureShape {
  contract_only: true;
  declaration_only: true;
  default_deny: true;
  direct_agent_repo_file_access_allowed_now: false;
  live_source_read_allowed_now: false;
  live_source_read_performed: false;
  arbitrary_file_read_allowed_now: false;
  user_selected_path_read_allowed_now: false;
  directory_traversal_allowed_now: false;
  repo_scanning_allowed_now: false;
  git_command_execution_allowed_now: false;
  network_access_allowed_now: false;
  provider_sdk_call_allowed_now: false;
  concrete_persistence_read_allowed_now: false;
  concrete_persistence_write_allowed_now: false;
  auth_iam_implementation_allowed_now: false;
  token_session_validation_allowed_now: false;
  policy_engine_execution_allowed_now: false;
  permission_grant_allowed_now: false;
  runtime_permission_granted: false;
  runtime_handler_bound: false;
  mcp_server_allowed_now: false;
  mcp_tool_resource_registration_allowed_now: false;
  api_route_controller_allowed_now: false;
  real_model_call_allowed_now: false;
  real_storage_write_allowed_now: false;
  actual_contour_execution_allowed_now: false;
}

export interface BoundedRealSourceAdapterCapabilityDeclarationShape {
  adapter_ref: string;
  capability_boundary: BoundedRealSourceAdapterCapabilityBoundary;
  supported_scope_ids: ScopeId[];
  supported_source_kinds: BoundedRealSourceAdapterSourceKind[];
  source_catalog_ref: "local-v0-source-catalog/v1";
  selection_policy: BoundedRealSourceAdapterSelectionPolicyShape;
  execution_posture: BoundedRealSourceAdapterExecutionPostureShape;
}

export interface BoundedRealSourceAdapterMaterializationContractShape {
  materialization_boundary: BoundedRealSourceAdapterMaterializationBoundary;
  required_receipt_version: "local-v0-source-materialization-receipt/v1";
  source_content_included_now: false;
  selected_source_refs_included_now: false;
  materialized_source_items_included_now: false;
  provenance_envelope_required: true;
  permission_envelope_required: true;
  audit_envelope_required: true;
}

export interface BoundedRealSourceAdapterContractShape {
  contract_id: string;
  contract_version: "bounded-real-source-adapter-contract/v1";
  contract_boundary: BoundedRealSourceAdapterContractBoundary;
  intended_consumer: "future_real_source_adapter";
  agent_context_request_id: string;
  authority: AgentContextAuthorityEnvelopeShape;
  source_catalog_ref: "local-v0-source-catalog/v1";
  receipt_contract_ref: "local-v0-source-materialization-receipt/v1";
  capability_declaration: BoundedRealSourceAdapterCapabilityDeclarationShape;
  materialization_contract: BoundedRealSourceAdapterMaterializationContractShape;
  provenance_envelope_ref: string;
  permission_envelope_ref: string;
  audit_envelope_ref: string;
  execution_posture: BoundedRealSourceAdapterExecutionPostureShape;
  warnings: BoundedRealSourceAdapterWarningShape[];
  generated_at: IsoDateTimeString;
  correlation_id?: CorrelationId;
}

export interface BoundedRealSourceAdapterContractBuilderInputShape {
  contract_id: string;
  agent_context_request_id: string;
  authority: AgentContextAuthorityEnvelopeShape;
  adapter_ref: string;
  supported_scope_ids: ScopeId[];
  supported_source_kinds: BoundedRealSourceAdapterSourceKind[];
  provenance_envelope_ref: string;
  permission_envelope_ref: string;
  audit_envelope_ref: string;
  generated_at: IsoDateTimeString;
  correlation_id?: CorrelationId;
  warnings?: BoundedRealSourceAdapterWarningShape[];
}

export interface BoundedRealSourceAdapterContractBuilder {
  create(
    input: BoundedRealSourceAdapterContractBuilderInputShape
  ): BoundedRealSourceAdapterContractShape;
}
