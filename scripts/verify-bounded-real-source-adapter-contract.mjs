#!/usr/bin/env node

import {
  createDeterministicBoundedRealSourceAdapterContract
} from "../packages/system-assembly/dist/index.js";

const result = createDeterministicBoundedRealSourceAdapterContract();
const {
  request,
  local_adapter_result: localAdapterResult,
  bounded_real_source_adapter_contract: contract
} = result;
const capability = contract.capability_declaration ?? {};
const selectionPolicy = capability.selection_policy ?? {};
const materializationContract = contract.materialization_contract ?? {};
const posture = contract.execution_posture ?? {};
const capabilityPosture = capability.execution_posture ?? {};

const deniedPostureFlags = [
  "direct_agent_repo_file_access_allowed_now",
  "live_source_read_allowed_now",
  "live_source_read_performed",
  "arbitrary_file_read_allowed_now",
  "user_selected_path_read_allowed_now",
  "directory_traversal_allowed_now",
  "repo_scanning_allowed_now",
  "git_command_execution_allowed_now",
  "network_access_allowed_now",
  "provider_sdk_call_allowed_now",
  "concrete_persistence_read_allowed_now",
  "concrete_persistence_write_allowed_now",
  "auth_iam_implementation_allowed_now",
  "token_session_validation_allowed_now",
  "policy_engine_execution_allowed_now",
  "permission_grant_allowed_now",
  "runtime_permission_granted",
  "runtime_handler_bound",
  "mcp_server_allowed_now",
  "mcp_tool_resource_registration_allowed_now",
  "api_route_controller_allowed_now",
  "real_model_call_allowed_now",
  "real_storage_write_allowed_now",
  "actual_contour_execution_allowed_now"
];

const allDenied = (candidate) =>
  deniedPostureFlags.every((flag) => candidate?.[flag] === false);

const assertions = {
  contract_version:
    contract.contract_version === "bounded-real-source-adapter-contract/v1",
  contract_boundary:
    contract.contract_boundary === "contract_only_bounded_real_source_adapter",
  future_consumer_only: contract.intended_consumer === "future_real_source_adapter",
  request_linked:
    contract.agent_context_request_id === request.agent_context_request_id,
  authority_carried: contract.authority === request.authority,
  source_catalog_ref_required:
    contract.source_catalog_ref === "local-v0-source-catalog/v1" &&
    capability.source_catalog_ref === "local-v0-source-catalog/v1",
  source_materialization_receipt_required:
    contract.receipt_contract_ref === "local-v0-source-materialization-receipt/v1" &&
    materializationContract.required_receipt_version ===
      "local-v0-source-materialization-receipt/v1",
  capability_declaration_only:
    capability.capability_boundary === "declaration_only_bounded_real_source_capability" &&
    posture.declaration_only === true &&
    capabilityPosture.declaration_only === true,
  capability_scope_ids_present:
    Array.isArray(capability.supported_scope_ids) &&
    capability.supported_scope_ids.includes("scope:repo-work-context"),
  capability_source_kinds_declared:
    Array.isArray(capability.supported_source_kinds) &&
    capability.supported_source_kinds.includes("repo_work_context_source_candidate") &&
    capability.supported_source_kinds.includes("repo_file_source_candidate") &&
    capability.supported_source_kinds.includes("local_artifact_source_candidate"),
  allowlisted_selection_policy:
    selectionPolicy.allowlisted_scope_selection_required === true &&
    selectionPolicy.source_catalog_required === true &&
    selectionPolicy.arbitrary_file_paths_allowed === false &&
    selectionPolicy.user_selected_paths_allowed === false &&
    selectionPolicy.directory_traversal_allowed === false &&
    selectionPolicy.unknown_scope_grants_access === false,
  materialization_boundary_contract_only:
    materializationContract.materialization_boundary ===
      "contract_only_future_real_source_materialization_boundary" &&
    materializationContract.source_content_included_now === false &&
    materializationContract.selected_source_refs_included_now === false &&
    materializationContract.materialized_source_items_included_now === false,
  envelopes_required:
    materializationContract.provenance_envelope_required === true &&
    materializationContract.permission_envelope_required === true &&
    materializationContract.audit_envelope_required === true,
  envelopes_carried:
    contract.provenance_envelope_ref === localAdapterResult.provenance_envelope_ref &&
    contract.permission_envelope_ref === localAdapterResult.permission_envelope_ref &&
    contract.audit_envelope_ref === localAdapterResult.audit_envelope_ref,
  contract_posture_default_deny:
    posture.contract_only === true && posture.default_deny === true && allDenied(posture),
  capability_posture_default_deny:
    capabilityPosture.contract_only === true &&
    capabilityPosture.default_deny === true &&
    allDenied(capabilityPosture),
  authority_default_deny:
    request.authority.permission_grant_issued === false &&
    request.authority.runtime_permission_granted === false &&
    request.authority.mcp_route_permission_granted === false &&
    request.authority.api_route_permission_granted === false,
  no_source_content_on_contract:
    contract.source_items === undefined &&
    contract.source_content === undefined &&
    contract.selected_source_refs === undefined,
  warnings_present:
    contract.warnings?.some(
      (warning) => warning.code === "bounded_real_source_adapter_live_reads_denied"
    ) === true &&
    contract.warnings?.some(
      (warning) => warning.code === "bounded_real_source_adapter_receipt_required"
    ) === true
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "bounded_real_source_adapter_contract_verified"
      : "bounded_real_source_adapter_contract_failed",
  contract_id: contract.contract_id,
  contract_version: contract.contract_version,
  agent_context_request_id: contract.agent_context_request_id,
  source_catalog_ref: contract.source_catalog_ref,
  receipt_contract_ref: contract.receipt_contract_ref,
  supported_scope_count: capability.supported_scope_ids?.length ?? 0,
  supported_source_kinds: capability.supported_source_kinds ?? [],
  direct_agent_repo_file_access_allowed_now:
    posture.direct_agent_repo_file_access_allowed_now,
  live_source_read_allowed_now: posture.live_source_read_allowed_now,
  live_source_read_performed: posture.live_source_read_performed,
  materialization_boundary: materializationContract.materialization_boundary,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
