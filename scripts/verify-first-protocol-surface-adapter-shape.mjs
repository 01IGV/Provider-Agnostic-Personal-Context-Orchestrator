#!/usr/bin/env node

import {
  createDeterministicFirstProtocolSurfaceAdapterShapeForVerifiedResponse
} from "../packages/system-assembly/dist/index.js";

const { adapter_shape: adapterShape, summary } =
  createDeterministicFirstProtocolSurfaceAdapterShapeForVerifiedResponse();

const assertions = {
  adapter_shape_ready:
    adapterShape.adapter_kind === "mcp_api_adjacent_verified_response_adapter" &&
    adapterShape.adapter_status === "verified_response_adapter_shape_ready" &&
    adapterShape.adapter_boundary === "protocol_adjacent_adapter_shape_only",
  verified_response_refs_carried:
    typeof adapterShape.refs.bounded_context_response_id === "string" &&
    typeof adapterShape.refs.bounded_context_package_id === "string" &&
    adapterShape.refs.verification_result === "agent_consumable_response_contract_verified",
  envelope_refs_carried:
    typeof adapterShape.refs.provenance_envelope_ref === "string" &&
    typeof adapterShape.refs.permission_envelope_ref === "string" &&
    typeof adapterShape.refs.audit_envelope_ref === "string",
  response_embedded_without_runtime:
    adapterShape.response.bounded_context_response_id === adapterShape.refs.bounded_context_response_id &&
    adapterShape.response.bounded_context_package_ref === adapterShape.refs.bounded_context_package_id,
  protocol_surface_denied:
    adapterShape.denial_posture.protocol_adjacent === true &&
    adapterShape.denial_posture.adapter_shape_only === true &&
    adapterShape.denial_posture.mcp_server_implemented === false &&
    adapterShape.denial_posture.mcp_tool_registered === false &&
    adapterShape.denial_posture.mcp_resource_registered === false &&
    adapterShape.denial_posture.api_route_registered === false &&
    adapterShape.denial_posture.api_controller_registered === false &&
    adapterShape.denial_posture.runtime_handler_bound === false &&
    adapterShape.denial_posture.transport_execution_allowed_now === false &&
    adapterShape.denial_posture.provider_sdk_call_allowed_now === false &&
    adapterShape.denial_posture.concrete_persistence_read_allowed_now === false &&
    adapterShape.denial_posture.concrete_persistence_write_allowed_now === false &&
    adapterShape.denial_posture.real_model_call_allowed_now === false &&
    adapterShape.denial_posture.real_storage_write_allowed_now === false &&
    adapterShape.denial_posture.runtime_permission_granted === false &&
    adapterShape.denial_posture.actual_contour_execution_allowed_now === false,
  summary_matches_shape:
    summary.adapter_shape_id === adapterShape.adapter_shape_id &&
    summary.bounded_context_response_id === adapterShape.refs.bounded_context_response_id &&
    summary.bounded_context_package_id === adapterShape.refs.bounded_context_package_id &&
    summary.verification_result === adapterShape.refs.verification_result &&
    summary.protocol_adjacent === true &&
    summary.adapter_shape_only === true &&
    summary.runtime_permission_granted === false &&
    summary.actual_contour_execution_allowed_now === false
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "first_protocol_surface_adapter_shape_verified"
      : "first_protocol_surface_adapter_shape_failed",
  adapter_shape_id: adapterShape.adapter_shape_id,
  bounded_context_response_id: adapterShape.refs.bounded_context_response_id,
  bounded_context_package_id: adapterShape.refs.bounded_context_package_id,
  verification_result_ref: adapterShape.refs.verification_result,
  protocol_adjacent: adapterShape.denial_posture.protocol_adjacent,
  adapter_shape_only: adapterShape.denial_posture.adapter_shape_only,
  mcp_server_implemented: adapterShape.denial_posture.mcp_server_implemented,
  mcp_tool_registered: adapterShape.denial_posture.mcp_tool_registered,
  api_route_registered: adapterShape.denial_posture.api_route_registered,
  runtime_handler_bound: adapterShape.denial_posture.runtime_handler_bound,
  runtime_permission_granted: adapterShape.denial_posture.runtime_permission_granted,
  actual_contour_execution_allowed_now: adapterShape.denial_posture.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
