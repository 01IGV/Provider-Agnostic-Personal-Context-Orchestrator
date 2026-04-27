#!/usr/bin/env node

import {
  createDeterministicLocalJsonFixtureRunnerProof,
  createDeterministicLocalJsonFixtureRunnerProofVerificationSummary,
  createDeterministicLocalJsonRequestResponseRunnerShape
} from "../packages/system-assembly/dist/index.js";

const runnerShape = createDeterministicLocalJsonRequestResponseRunnerShape();
const proof = createDeterministicLocalJsonFixtureRunnerProof({ runner_shape: runnerShape });
const verification = createDeterministicLocalJsonFixtureRunnerProofVerificationSummary();

const roundTrip = JSON.parse(JSON.stringify({
  request: runnerShape.runner_request,
  response: runnerShape.runner_response,
  summary: runnerShape.runner_summary,
  proof
}));

const assertions = {
  proof_shape_ready:
    proof.contract_version === "local-json-fixture-runner-proof/v1" &&
    proof.proof_result === "local_json_fixture_runner_default_deny_proven" &&
    proof.proof_boundary === "machine_checkable_local_json_fixture_runner_proof_only",
  round_trip_preserves_runner_ids:
    roundTrip.request.runner_request_id === runnerShape.runner_request.runner_request_id &&
    roundTrip.response.runner_response_id === runnerShape.runner_response.runner_response_id &&
    roundTrip.summary.protocol_adapter_shape_id === runnerShape.runner_summary.protocol_adapter_shape_id &&
    roundTrip.proof.proof_id === proof.proof_id,
  runner_refs_match_source_shape:
    proof.runner_request_id === runnerShape.runner_request.runner_request_id &&
    proof.runner_response_id === runnerShape.runner_response.runner_response_id &&
    proof.ref_assertions.agent_context_request_id === runnerShape.runner_request.request_json.agent_context_request_id &&
    proof.ref_assertions.bounded_context_response_id === runnerShape.runner_response.refs.bounded_context_response_id &&
    proof.ref_assertions.bounded_context_package_id === runnerShape.runner_response.refs.bounded_context_package_id &&
    proof.ref_assertions.protocol_adapter_shape_id === runnerShape.runner_response.refs.protocol_adapter_shape_id &&
    proof.ref_assertions.verification_result === "agent_consumable_response_contract_verified",
  envelope_refs_carried:
    typeof proof.ref_assertions.provenance_envelope_ref === "string" &&
    proof.ref_assertions.provenance_envelope_ref.length > 0 &&
    typeof proof.ref_assertions.permission_envelope_ref === "string" &&
    proof.ref_assertions.permission_envelope_ref.length > 0 &&
    typeof proof.ref_assertions.audit_envelope_ref === "string" &&
    proof.ref_assertions.audit_envelope_ref.length > 0,
  local_json_fixture_posture:
    proof.denial_assertions.local_json_only === true &&
    proof.denial_assertions.deterministic === true &&
    proof.denial_assertions.fixture_driven === true &&
    proof.denial_assertions.runner_shape_only === true,
  runtime_surfaces_denied:
    proof.denial_assertions.mcp_server_implemented === false &&
    proof.denial_assertions.mcp_tool_registered === false &&
    proof.denial_assertions.mcp_resource_registered === false &&
    proof.denial_assertions.api_route_registered === false &&
    proof.denial_assertions.api_controller_registered === false &&
    proof.denial_assertions.runtime_handler_bound === false &&
    proof.denial_assertions.network_access_allowed_now === false &&
    proof.denial_assertions.provider_sdk_call_allowed_now === false &&
    proof.denial_assertions.transport_execution_allowed_now === false &&
    proof.denial_assertions.concrete_persistence_read_allowed_now === false &&
    proof.denial_assertions.concrete_persistence_write_allowed_now === false &&
    proof.denial_assertions.real_model_call_allowed_now === false &&
    proof.denial_assertions.real_storage_write_allowed_now === false &&
    proof.denial_assertions.runtime_permission_granted === false &&
    proof.denial_assertions.actual_contour_execution_allowed_now === false,
  local_execution_denied:
    proof.denial_assertions.file_io_performed === false &&
    proof.denial_assertions.cli_execution_performed === false &&
    proof.denial_assertions.process_execution_performed === false,
  verification_summary_matches_proof:
    verification.verification_result === "local_json_fixture_runner_proof_verified" &&
    verification.proof_id === proof.proof_id &&
    verification.runner_request_id === proof.runner_request_id &&
    verification.runner_response_id === proof.runner_response_id &&
    verification.failure_count === proof.failure_count,
  proof_has_no_failures:
    proof.failure_count === 0 &&
    proof.failures.length === 0 &&
    verification.failure_count === 0 &&
    verification.failures.length === 0
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const output = {
  ...verification,
  failure_count: failed.length + verification.failure_count,
  failures: [...failed, ...verification.failures]
};

console.log(JSON.stringify(output, null, 2));

if (failed.length > 0 || verification.failure_count > 0) {
  process.exit(1);
}
