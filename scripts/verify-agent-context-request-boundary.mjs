#!/usr/bin/env node

import {
  createDeterministicFirstAgentContextRequestBoundary
} from "../packages/system-assembly/dist/index.js";

const result = createDeterministicFirstAgentContextRequestBoundary();
const { request, response } = result;

const assertions = {
  request_contract_only: request.contract_only === true,
  bounded_context_requested: request.bounded_context_requested === true,
  bounded_context_delivered: request.bounded_context_delivered === false,
  response_contract_only: response.response_boundary === "contract_only_bounded_context_response",
  auth_iam_adjacent: request.authority.auth_iam_adjacent === true,
  permission_grant_issued: request.authority.permission_grant_issued === false,
  runtime_permission_granted: request.authority.runtime_permission_granted === false,
  mcp_route_permission_granted: request.authority.mcp_route_permission_granted === false,
  api_route_permission_granted: request.authority.api_route_permission_granted === false,
  mcp_server_implemented: request.execution_posture.mcp_server_implemented === false,
  mcp_tool_registered: request.execution_posture.mcp_tool_registered === false,
  mcp_resource_registered: request.execution_posture.mcp_resource_registered === false,
  api_route_registered: request.execution_posture.api_route_registered === false,
  api_controller_registered: request.execution_posture.api_controller_registered === false,
  runtime_handler_bound: request.execution_posture.runtime_handler_bound === false,
  provider_sdk_call_allowed_now: request.execution_posture.provider_sdk_call_allowed_now === false,
  concrete_persistence_write_allowed_now: request.execution_posture.concrete_persistence_write_allowed_now === false,
  real_model_call_allowed_now: request.execution_posture.real_model_call_allowed_now === false,
  real_storage_write_allowed_now: request.execution_posture.real_storage_write_allowed_now === false,
  actual_contour_execution_allowed_now: request.execution_posture.actual_contour_execution_allowed_now === false
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "agent_context_request_boundary_verified"
      : "agent_context_request_boundary_failed",
  request_id: request.agent_context_request_id,
  response_id: response.bounded_context_response_id,
  operation_id: request.operation_id,
  request_kind: request.intent.request_kind,
  response_status: response.response_status,
  authority_boundary_denial_proof_id: request.authority.authority_boundary_denial_proof_id,
  runtime_permission_granted: request.authority.runtime_permission_granted,
  actual_contour_execution_allowed_now: request.execution_posture.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
