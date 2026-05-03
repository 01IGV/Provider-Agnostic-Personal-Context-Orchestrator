import type {
  BoundedRealSourceAdapterContractBuilder,
  BoundedRealSourceAdapterContractBuilderInputShape,
  BoundedRealSourceAdapterContractShape,
  BoundedRealSourceAdapterExecutionPostureShape,
  BoundedRealSourceAdapterSelectionPolicyShape,
  BoundedRealSourceAdapterWarningShape
} from "./bounded-real-source-adapter-contract-types.js";

const defaultExecutionPosture = (): BoundedRealSourceAdapterExecutionPostureShape => ({
  contract_only: true,
  declaration_only: true,
  default_deny: true,
  direct_agent_repo_file_access_allowed_now: false,
  live_source_read_allowed_now: false,
  live_source_read_performed: false,
  arbitrary_file_read_allowed_now: false,
  user_selected_path_read_allowed_now: false,
  directory_traversal_allowed_now: false,
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

const defaultSelectionPolicy = (): BoundedRealSourceAdapterSelectionPolicyShape => ({
  allowlisted_scope_selection_required: true,
  source_catalog_required: true,
  arbitrary_file_paths_allowed: false,
  user_selected_paths_allowed: false,
  directory_traversal_allowed: false,
  unknown_scope_grants_access: false
});

const defaultWarnings = (): BoundedRealSourceAdapterWarningShape[] => [
  {
    code: "bounded_real_source_adapter_contract_only",
    message: "Bounded real source adapter is a contract shape only in this pass."
  },
  {
    code: "bounded_real_source_adapter_capability_declaration_only",
    message: "Adapter capabilities are declared for future implementation without binding runtime behavior."
  },
  {
    code: "bounded_real_source_adapter_live_reads_denied",
    message: "Live source reads are explicitly denied until a separately scoped pass opens that boundary."
  },
  {
    code: "bounded_real_source_adapter_direct_agent_file_access_denied",
    message: "AI agents do not receive direct repo file access through this contract."
  },
  {
    code: "bounded_real_source_adapter_receipt_required",
    message: "Future materialization must carry a source materialization receipt with provenance, permission, and audit refs."
  }
];

export const createBoundedRealSourceAdapterContractBuilder =
  (): BoundedRealSourceAdapterContractBuilder => ({
    create(
      input: BoundedRealSourceAdapterContractBuilderInputShape
    ): BoundedRealSourceAdapterContractShape {
      const executionPosture = defaultExecutionPosture();

      return {
        contract_id: input.contract_id,
        contract_version: "bounded-real-source-adapter-contract/v1",
        contract_boundary: "contract_only_bounded_real_source_adapter",
        intended_consumer: "future_real_source_adapter",
        agent_context_request_id: input.agent_context_request_id,
        authority: input.authority,
        source_catalog_ref: "local-v0-source-catalog/v1",
        receipt_contract_ref: "local-v0-source-materialization-receipt/v1",
        capability_declaration: {
          adapter_ref: input.adapter_ref,
          capability_boundary: "declaration_only_bounded_real_source_capability",
          supported_scope_ids: input.supported_scope_ids,
          supported_source_kinds: input.supported_source_kinds,
          source_catalog_ref: "local-v0-source-catalog/v1",
          selection_policy: defaultSelectionPolicy(),
          execution_posture: executionPosture
        },
        materialization_contract: {
          materialization_boundary: "contract_only_future_real_source_materialization_boundary",
          required_receipt_version: "local-v0-source-materialization-receipt/v1",
          source_content_included_now: false,
          selected_source_refs_included_now: false,
          materialized_source_items_included_now: false,
          provenance_envelope_required: true,
          permission_envelope_required: true,
          audit_envelope_required: true
        },
        provenance_envelope_ref: input.provenance_envelope_ref,
        permission_envelope_ref: input.permission_envelope_ref,
        audit_envelope_ref: input.audit_envelope_ref,
        execution_posture: executionPosture,
        warnings: input.warnings ?? defaultWarnings(),
        generated_at: input.generated_at,
        ...(input.correlation_id ? { correlation_id: input.correlation_id } : {})
      };
    }
  });
