#!/usr/bin/env node

import {
  createDeterministicNarrowLocalRealSourceReadBoundaryContracts
} from "../packages/system-assembly/dist/index.js";

const result = createDeterministicNarrowLocalRealSourceReadBoundaryContracts();
const {
  request,
  bounded_real_source_adapter_contract: boundedContract,
  narrow_local_real_source_read_boundary: boundary
} = result;
const posture = boundary.execution_posture ?? {};
const pathPolicy = boundary.path_policy ?? {};
const allowedRefs = boundary.allowed_source_refs ?? [];
const allowedRoots = boundary.allowed_roots ?? [];

const deniedPostureFlags = [
  "live_source_read_allowed_now",
  "live_source_read_performed",
  "direct_agent_repo_file_access_allowed_now",
  "arbitrary_file_read_allowed_now",
  "user_selected_path_read_allowed_now",
  "directory_traversal_allowed_now",
  "directory_listing_allowed_now",
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
const noUnsafePath = (path) =>
  typeof path === "string" &&
  !path.startsWith("/") &&
  !path.includes("..") &&
  !path.includes("*");

const assertions = {
  boundary_version:
    boundary.boundary_version === "narrow-local-real-source-read-boundary/v1",
  boundary_kind_contract_only:
    boundary.boundary_kind === "contract_only_narrow_local_real_source_read_boundary" &&
    boundary.intended_consumer === "future_local_real_source_adapter_v0",
  request_and_authority_carried:
    boundary.agent_context_request_id === request.agent_context_request_id &&
    boundary.authority === request.authority,
  compatible_with_bounded_real_source_adapter_contract:
    boundary.bounded_real_source_adapter_contract_ref ===
      "bounded-real-source-adapter-contract/v1" &&
    boundedContract.contract_version === "bounded-real-source-adapter-contract/v1",
  source_catalog_and_receipt_refs_required:
    boundary.source_catalog_ref === "local-v0-source-catalog/v1" &&
    boundary.receipt_contract_ref === "local-v0-source-materialization-receipt/v1",
  allowlisted_roots_declared:
    allowedRoots.length === 1 &&
    allowedRoots[0].root_ref === "repo-root://docs-implementation" &&
    allowedRoots[0].root_kind === "repo_relative_allowlisted_root" &&
    allowedRoots[0].repo_relative_root === "docs/04-implementation" &&
    allowedRoots[0].recursive_read_allowed_now === false,
  allowlisted_source_refs_declared:
    allowedRefs.length === 2 &&
    allowedRefs.every((ref) => ref.root_ref === "repo-root://docs-implementation") &&
    allowedRefs.every((ref) => ref.scope_id === "scope:repo-work-context") &&
    allowedRefs.every((ref) => ref.content_digest_required_after_read === true) &&
    allowedRefs.every((ref) => ref.max_bytes_per_read === 65536),
  paths_are_narrow_and_repo_relative:
    allowedRoots.every((root) => noUnsafePath(root.repo_relative_root)) &&
    allowedRefs.every((ref) => noUnsafePath(ref.repo_relative_path)) &&
    allowedRefs.every((ref) => ref.repo_relative_path.startsWith("docs/04-implementation/")),
  path_policy_default_deny:
    pathPolicy.repo_relative_paths_only === true &&
    pathPolicy.absolute_paths_allowed === false &&
    pathPolicy.parent_directory_segments_allowed === false &&
    pathPolicy.glob_patterns_allowed === false &&
    pathPolicy.symlink_following_allowed === false &&
    pathPolicy.directory_listing_allowed === false &&
    pathPolicy.recursive_read_allowed === false &&
    pathPolicy.unknown_source_ref_grants_access === false,
  envelopes_carried:
    boundary.provenance_envelope_ref === boundedContract.provenance_envelope_ref &&
    boundary.permission_envelope_ref === boundedContract.permission_envelope_ref &&
    boundary.audit_envelope_ref === boundedContract.audit_envelope_ref,
  no_live_reads_or_direct_agent_file_access:
    posture.contract_only === true &&
    posture.default_deny === true &&
    allDenied(posture),
  warnings_present:
    boundary.warnings?.some(
      (warning) => warning.code === "narrow_local_real_source_read_boundary_live_reads_denied"
    ) === true &&
    boundary.warnings?.some(
      (warning) => warning.code === "narrow_local_real_source_read_boundary_receipt_required"
    ) === true,
  no_source_content_materialized:
    boundary.source_content === undefined &&
    boundary.materialized_source_items === undefined &&
    boundary.selected_source_content === undefined,
  authority_default_deny:
    request.authority.permission_grant_issued === false &&
    request.authority.runtime_permission_granted === false &&
    request.authority.mcp_route_permission_granted === false &&
    request.authority.api_route_permission_granted === false
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "narrow_local_real_source_read_boundary_contracts_verified"
      : "narrow_local_real_source_read_boundary_contracts_failed",
  boundary_id: boundary.boundary_id,
  boundary_version: boundary.boundary_version,
  allowed_root_count: allowedRoots.length,
  allowed_source_ref_count: allowedRefs.length,
  source_catalog_ref: boundary.source_catalog_ref,
  receipt_contract_ref: boundary.receipt_contract_ref,
  live_source_read_allowed_now: posture.live_source_read_allowed_now,
  live_source_read_performed: posture.live_source_read_performed,
  direct_agent_repo_file_access_allowed_now:
    posture.direct_agent_repo_file_access_allowed_now,
  runtime_permission_granted: posture.runtime_permission_granted,
  actual_contour_execution_allowed_now: posture.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
