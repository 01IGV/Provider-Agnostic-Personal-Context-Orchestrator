#!/usr/bin/env node

import {
  createDeterministicLocalJsonRequestResponseRunnerShape
} from "../packages/system-assembly/dist/index.js";

const {
  runner_request: runnerRequest,
  runner_response: runnerResponse,
  runner_summary: runnerSummary,
  adapter_shape: adapterShape,
  adapter_summary: adapterSummary
} = createDeterministicLocalJsonRequestResponseRunnerShape();

const jsonRoundTrip = JSON.parse(JSON.stringify({
  request: runnerRequest,
  response: runnerResponse,
  summary: runnerSummary
}));

const assertions = {
  runner_request_shape_ready:
    runnerRequest.runner_kind === "local_json_request_response_runner_shape" &&
    runnerRequest.runner_status === "local_json_runner_shape_ready" &&
    runnerRequest.runner_boundary === "local_deterministic_json_runner_shape_only",
  runner_request_carries_agent_context_request_json:
    runnerRequest.input_kind === "agent_context_request_json_fixture" &&
    runnerRequest.request_json.operation_id === "agent_context_request_boundary" &&
    runnerRequest.request_json.contract_only === true,
  runner_response_shape_ready:
    runnerResponse.runner_status === "local_json_runner_shape_ready" &&
    runnerResponse.output_kind === "verified_protocol_surface_adapter_json_fixture" &&
    runnerResponse.json_serializable === true,
  runner_response_refs_match_adapter:
    runnerResponse.refs.agent_context_request_id === runnerRequest.request_json.agent_context_request_id &&
    runnerResponse.refs.protocol_adapter_shape_id === adapterShape.adapter_shape_id &&
    runnerResponse.refs.bounded_context_response_id === adapterShape.refs.bounded_context_response_id &&
    runnerResponse.refs.bounded_context_package_id === adapterShape.refs.bounded_context_package_id &&
    runnerResponse.refs.verification_result === "agent_consumable_response_contract_verified",
  response_json_matches_adapter_shape:
    runnerResponse.response_json.adapter_shape_id === adapterShape.adapter_shape_id &&
    runnerResponse.response_json.refs.bounded_context_response_id === adapterSummary.bounded_context_response_id,
  response_summary_json_matches_adapter_summary:
    runnerResponse.response_summary_json.adapter_shape_id === adapterSummary.adapter_shape_id &&
    runnerResponse.response_summary_json.verification_result === adapterSummary.verification_result,
  runner_posture_local_deterministic_fixture_only:
    runnerRequest.execution_posture.local_json_only === true &&
    runnerRequest.execution_posture.deterministic === true &&
    runnerRequest.execution_posture.fixture_driven === true &&
    runnerRequest.execution_posture.runner_shape_only === true,
  runner_posture_denies_runtime:
    runnerRequest.execution_posture.mcp_server_implemented === false &&
    runnerRequest.execution_posture.mcp_tool_registered === false &&
    runnerRequest.execution_posture.mcp_resource_registered === false &&
    runnerRequest.execution_posture.api_route_registered === false &&
    runnerRequest.execution_posture.api_controller_registered === false &&
    runnerRequest.execution_posture.runtime_handler_bound === false &&
    runnerRequest.execution_posture.network_access_allowed_now === false &&
    runnerRequest.execution_posture.provider_sdk_call_allowed_now === false &&
    runnerRequest.execution_posture.transport_execution_allowed_now === false &&
    runnerRequest.execution_posture.concrete_persistence_read_allowed_now === false &&
    runnerRequest.execution_posture.concrete_persistence_write_allowed_now === false &&
    runnerRequest.execution_posture.real_model_call_allowed_now === false &&
    runnerRequest.execution_posture.real_storage_write_allowed_now === false &&
    runnerRequest.execution_posture.runtime_permission_granted === false &&
    runnerRequest.execution_posture.actual_contour_execution_allowed_now === false,
  runner_summary_matches_response:
    runnerSummary.runner_request_id === runnerResponse.runner_request_id &&
    runnerSummary.runner_response_id === runnerResponse.runner_response_id &&
    runnerSummary.protocol_adapter_shape_id === runnerResponse.refs.protocol_adapter_shape_id &&
    runnerSummary.local_json_only === true &&
    runnerSummary.fixture_driven === true &&
    runnerSummary.runtime_permission_granted === false &&
    runnerSummary.actual_contour_execution_allowed_now === false,
  json_round_trip_preserves_machine_readable_ids:
    jsonRoundTrip.request.runner_request_id === runnerRequest.runner_request_id &&
    jsonRoundTrip.response.runner_response_id === runnerResponse.runner_response_id &&
    jsonRoundTrip.summary.protocol_adapter_shape_id === runnerSummary.protocol_adapter_shape_id
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "local_json_request_response_runner_shape_verified"
      : "local_json_request_response_runner_shape_failed",
  runner_request_id: runnerRequest.runner_request_id,
  runner_response_id: runnerResponse.runner_response_id,
  agent_context_request_id: runnerResponse.refs.agent_context_request_id,
  bounded_context_response_id: runnerResponse.refs.bounded_context_response_id,
  bounded_context_package_id: runnerResponse.refs.bounded_context_package_id,
  protocol_adapter_shape_id: runnerResponse.refs.protocol_adapter_shape_id,
  local_json_only: runnerRequest.execution_posture.local_json_only,
  deterministic: runnerRequest.execution_posture.deterministic,
  fixture_driven: runnerRequest.execution_posture.fixture_driven,
  runner_shape_only: runnerRequest.execution_posture.runner_shape_only,
  runtime_permission_granted: runnerRequest.execution_posture.runtime_permission_granted,
  actual_contour_execution_allowed_now:
    runnerRequest.execution_posture.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
