import type {
  CorrelationId,
  IsoDateTimeString,
  ScopeId
} from "@orchestrator/core-foundation";
import type { AgentContextAuthorityEnvelopeShape } from "./agent-context-request-boundary-types.js";
import type {
  NarrowLocalRealSourceReadBoundaryKind,
  NarrowLocalRealSourceReadRefKind,
  NarrowLocalRealSourceReadRootKind,
  NarrowLocalRealSourceReadWarningCode
} from "./narrow-local-real-source-read-boundary-vocabularies.js";

export interface NarrowLocalRealSourceReadWarningShape {
  code: NarrowLocalRealSourceReadWarningCode;
  message: string;
}

export interface NarrowLocalRealSourceReadRootDeclarationShape {
  root_ref: string;
  root_kind: NarrowLocalRealSourceReadRootKind;
  repo_relative_root: string;
  allowed_scope_ids: ScopeId[];
  recursive_read_allowed_now: false;
}

export interface NarrowLocalRealSourceReadRefDeclarationShape {
  source_ref: string;
  ref_kind: NarrowLocalRealSourceReadRefKind;
  repo_relative_path: string;
  scope_id: ScopeId;
  root_ref: string;
  max_bytes_per_read: number;
  content_digest_required_after_read: true;
}

export interface NarrowLocalRealSourceReadPathPolicyShape {
  repo_relative_paths_only: true;
  absolute_paths_allowed: false;
  parent_directory_segments_allowed: false;
  glob_patterns_allowed: false;
  symlink_following_allowed: false;
  directory_listing_allowed: false;
  recursive_read_allowed: false;
  unknown_source_ref_grants_access: false;
}

export interface NarrowLocalRealSourceReadExecutionPostureShape {
  contract_only: true;
  default_deny: true;
  live_source_read_allowed_now: false;
  live_source_read_performed: false;
  direct_agent_repo_file_access_allowed_now: false;
  arbitrary_file_read_allowed_now: false;
  user_selected_path_read_allowed_now: false;
  directory_traversal_allowed_now: false;
  directory_listing_allowed_now: false;
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

export interface NarrowLocalRealSourceReadBoundaryShape {
  boundary_id: string;
  boundary_version: "narrow-local-real-source-read-boundary/v1";
  boundary_kind: NarrowLocalRealSourceReadBoundaryKind;
  intended_consumer: "future_local_real_source_adapter_v0";
  agent_context_request_id: string;
  authority: AgentContextAuthorityEnvelopeShape;
  bounded_real_source_adapter_contract_ref: "bounded-real-source-adapter-contract/v1";
  source_catalog_ref: "local-v0-source-catalog/v1";
  receipt_contract_ref: "local-v0-source-materialization-receipt/v1";
  allowed_roots: NarrowLocalRealSourceReadRootDeclarationShape[];
  allowed_source_refs: NarrowLocalRealSourceReadRefDeclarationShape[];
  path_policy: NarrowLocalRealSourceReadPathPolicyShape;
  provenance_envelope_ref: string;
  permission_envelope_ref: string;
  audit_envelope_ref: string;
  execution_posture: NarrowLocalRealSourceReadExecutionPostureShape;
  warnings: NarrowLocalRealSourceReadWarningShape[];
  generated_at: IsoDateTimeString;
  correlation_id?: CorrelationId;
}

export interface NarrowLocalRealSourceReadBoundaryBuilderInputShape {
  boundary_id: string;
  agent_context_request_id: string;
  authority: AgentContextAuthorityEnvelopeShape;
  allowed_roots: NarrowLocalRealSourceReadRootDeclarationShape[];
  allowed_source_refs: NarrowLocalRealSourceReadRefDeclarationShape[];
  provenance_envelope_ref: string;
  permission_envelope_ref: string;
  audit_envelope_ref: string;
  generated_at: IsoDateTimeString;
  correlation_id?: CorrelationId;
  warnings?: NarrowLocalRealSourceReadWarningShape[];
}

export interface NarrowLocalRealSourceReadBoundaryBuilder {
  create(
    input: NarrowLocalRealSourceReadBoundaryBuilderInputShape
  ): NarrowLocalRealSourceReadBoundaryShape;
}
