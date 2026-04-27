#!/usr/bin/env node

import {
  createDeterministicMinimalLocalJsonFixtureRunnerCliBoundary
} from "../packages/system-assembly/dist/index.js";

const {
  cli_boundary: cliBoundary,
  cli_boundary_summary: summary,
  fixture_runner_proof: proof
} = createDeterministicMinimalLocalJsonFixtureRunnerCliBoundary();

const assertions = {
  cli_boundary_shape_ready:
    cliBoundary.boundary_kind === "minimal_local_json_fixture_runner_cli_boundary" &&
    cliBoundary.boundary_status === "local_json_fixture_cli_boundary_ready" &&
    cliBoundary.boundary_mode === "contract_only_cli_file_boundary",
  fixture_path_refs_present:
    cliBoundary.input_fixture.media_type === "application/json" &&
    cliBoundary.output_fixture.media_type === "application/json" &&
    cliBoundary.input_fixture.local_only === true &&
    cliBoundary.output_fixture.local_only === true &&
    typeof cliBoundary.input_fixture.path_ref === "string" &&
    cliBoundary.input_fixture.path_ref.length > 0 &&
    typeof cliBoundary.output_fixture.path_ref === "string" &&
    cliBoundary.output_fixture.path_ref.length > 0,
  refs_match_proof:
    cliBoundary.refs.runner_request_id === proof.runner_request_id &&
    cliBoundary.refs.runner_response_id === proof.runner_response_id &&
    cliBoundary.refs.bounded_context_response_id === proof.ref_assertions.bounded_context_response_id &&
    cliBoundary.refs.bounded_context_package_id === proof.ref_assertions.bounded_context_package_id &&
    cliBoundary.refs.protocol_adapter_shape_id === proof.ref_assertions.protocol_adapter_shape_id &&
    cliBoundary.refs.local_json_fixture_runner_proof_id === proof.proof_id,
  runner_payload_matches_refs:
    cliBoundary.runner_response.runner_request_id === cliBoundary.refs.runner_request_id &&
    cliBoundary.runner_response.runner_response_id === cliBoundary.refs.runner_response_id &&
    cliBoundary.runner_summary.runner_request_id === cliBoundary.refs.runner_request_id &&
    cliBoundary.runner_summary.runner_response_id === cliBoundary.refs.runner_response_id,
  envelope_refs_carried:
    cliBoundary.refs.provenance_envelope_ref === proof.ref_assertions.provenance_envelope_ref &&
    cliBoundary.refs.permission_envelope_ref === proof.ref_assertions.permission_envelope_ref &&
    cliBoundary.refs.audit_envelope_ref === proof.ref_assertions.audit_envelope_ref,
  local_boundary_posture:
    cliBoundary.execution_posture.cli_boundary === true &&
    cliBoundary.execution_posture.file_boundary === true &&
    cliBoundary.execution_posture.contract_only === true &&
    cliBoundary.execution_posture.deterministic === true &&
    cliBoundary.execution_posture.local_only === true,
  no_actual_file_or_process_execution:
    cliBoundary.execution_posture.file_read_performed === false &&
    cliBoundary.execution_posture.file_write_performed === false &&
    cliBoundary.execution_posture.cli_process_spawned === false &&
    cliBoundary.execution_posture.process_execution_performed === false,
  runtime_surfaces_denied:
    cliBoundary.execution_posture.mcp_server_implemented === false &&
    cliBoundary.execution_posture.mcp_tool_registered === false &&
    cliBoundary.execution_posture.mcp_resource_registered === false &&
    cliBoundary.execution_posture.api_route_registered === false &&
    cliBoundary.execution_posture.api_controller_registered === false &&
    cliBoundary.execution_posture.runtime_handler_bound === false &&
    cliBoundary.execution_posture.provider_sdk_call_allowed_now === false &&
    cliBoundary.execution_posture.transport_execution_allowed_now === false &&
    cliBoundary.execution_posture.concrete_persistence_read_allowed_now === false &&
    cliBoundary.execution_posture.concrete_persistence_write_allowed_now === false &&
    cliBoundary.execution_posture.real_model_call_allowed_now === false &&
    cliBoundary.execution_posture.real_storage_write_allowed_now === false &&
    cliBoundary.execution_posture.runtime_permission_granted === false &&
    cliBoundary.execution_posture.actual_contour_execution_allowed_now === false,
  summary_matches_boundary:
    summary.cli_boundary_id === cliBoundary.cli_boundary_id &&
    summary.runner_response_id === cliBoundary.refs.runner_response_id &&
    summary.local_json_fixture_runner_proof_id === cliBoundary.refs.local_json_fixture_runner_proof_id &&
    summary.file_read_performed === false &&
    summary.file_write_performed === false &&
    summary.cli_process_spawned === false &&
    summary.process_execution_performed === false &&
    summary.runtime_permission_granted === false &&
    summary.actual_contour_execution_allowed_now === false
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "minimal_local_json_fixture_runner_cli_boundary_verified"
      : "minimal_local_json_fixture_runner_cli_boundary_failed",
  cli_boundary_id: cliBoundary.cli_boundary_id,
  runner_response_id: cliBoundary.refs.runner_response_id,
  bounded_context_response_id: cliBoundary.refs.bounded_context_response_id,
  bounded_context_package_id: cliBoundary.refs.bounded_context_package_id,
  protocol_adapter_shape_id: cliBoundary.refs.protocol_adapter_shape_id,
  local_json_fixture_runner_proof_id: cliBoundary.refs.local_json_fixture_runner_proof_id,
  input_fixture_path_ref: cliBoundary.input_fixture.path_ref,
  output_fixture_path_ref: cliBoundary.output_fixture.path_ref,
  file_read_performed: cliBoundary.execution_posture.file_read_performed,
  file_write_performed: cliBoundary.execution_posture.file_write_performed,
  cli_process_spawned: cliBoundary.execution_posture.cli_process_spawned,
  process_execution_performed: cliBoundary.execution_posture.process_execution_performed,
  runtime_permission_granted: cliBoundary.execution_posture.runtime_permission_granted,
  actual_contour_execution_allowed_now: cliBoundary.execution_posture.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
