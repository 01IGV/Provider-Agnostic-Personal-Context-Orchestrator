import type {
  NarrowLocalRealSourceReadBoundaryBuilder,
  NarrowLocalRealSourceReadBoundaryBuilderInputShape,
  NarrowLocalRealSourceReadBoundaryShape,
  NarrowLocalRealSourceReadExecutionPostureShape,
  NarrowLocalRealSourceReadPathPolicyShape,
  NarrowLocalRealSourceReadWarningShape
} from "./narrow-local-real-source-read-boundary-types.js";

const defaultExecutionPosture = (): NarrowLocalRealSourceReadExecutionPostureShape => ({
  contract_only: true,
  default_deny: true,
  live_source_read_allowed_now: false,
  live_source_read_performed: false,
  direct_agent_repo_file_access_allowed_now: false,
  arbitrary_file_read_allowed_now: false,
  user_selected_path_read_allowed_now: false,
  directory_traversal_allowed_now: false,
  directory_listing_allowed_now: false,
  repo_scanning_allowed_now: false,
  git_command_execution_allowed_now: false,
  network_access_allowed_now: false,
  provider_sdk_call_allowed_now: false,
  concrete_persistence_read_allowed_now: false,
  concrete_persistence_write_allowed_now: false,
  auth_iam_implementation_allowed_now: false,
  token_session_validation_allowed_now: false,
  policy_engine_execution_allowed_now: false,
  permission_grant_allowed_now: false,
  runtime_permission_granted: false,
  runtime_handler_bound: false,
  mcp_server_allowed_now: false,
  mcp_tool_resource_registration_allowed_now: false,
  api_route_controller_allowed_now: false,
  real_model_call_allowed_now: false,
  real_storage_write_allowed_now: false,
  actual_contour_execution_allowed_now: false
});

const defaultPathPolicy = (): NarrowLocalRealSourceReadPathPolicyShape => ({
  repo_relative_paths_only: true,
  absolute_paths_allowed: false,
  parent_directory_segments_allowed: false,
  glob_patterns_allowed: false,
  symlink_following_allowed: false,
  directory_listing_allowed: false,
  recursive_read_allowed: false,
  unknown_source_ref_grants_access: false
});

const defaultWarnings = (): NarrowLocalRealSourceReadWarningShape[] => [
  {
    code: "narrow_local_real_source_read_boundary_contract_only",
    message: "Narrow local real-source read boundary is a contract shape only in this pass."
  },
  {
    code: "narrow_local_real_source_read_boundary_live_reads_denied",
    message: "No live source reads are performed by this boundary contract."
  },
  {
    code: "narrow_local_real_source_read_boundary_direct_agent_file_access_denied",
    message: "AI agents do not receive direct repo file access through this read boundary."
  },
  {
    code: "narrow_local_real_source_read_boundary_receipt_required",
    message: "Future reads must produce source materialization receipts with provenance, permission, and audit refs."
  }
];

export const createNarrowLocalRealSourceReadBoundaryBuilder =
  (): NarrowLocalRealSourceReadBoundaryBuilder => ({
    create(
      input: NarrowLocalRealSourceReadBoundaryBuilderInputShape
    ): NarrowLocalRealSourceReadBoundaryShape {
      return {
        boundary_id: input.boundary_id,
        boundary_version: "narrow-local-real-source-read-boundary/v1",
        boundary_kind: "contract_only_narrow_local_real_source_read_boundary",
        intended_consumer: "future_local_real_source_adapter_v0",
        agent_context_request_id: input.agent_context_request_id,
        authority: input.authority,
        bounded_real_source_adapter_contract_ref:
          "bounded-real-source-adapter-contract/v1",
        source_catalog_ref: "local-v0-source-catalog/v1",
        receipt_contract_ref: "local-v0-source-materialization-receipt/v1",
        allowed_roots: input.allowed_roots,
        allowed_source_refs: input.allowed_source_refs,
        path_policy: defaultPathPolicy(),
        provenance_envelope_ref: input.provenance_envelope_ref,
        permission_envelope_ref: input.permission_envelope_ref,
        audit_envelope_ref: input.audit_envelope_ref,
        execution_posture: defaultExecutionPosture(),
        warnings: input.warnings ?? defaultWarnings(),
        generated_at: input.generated_at,
        ...(input.correlation_id ? { correlation_id: input.correlation_id } : {})
      };
    }
  });
