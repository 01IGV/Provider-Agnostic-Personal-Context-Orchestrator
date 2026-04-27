#!/usr/bin/env node

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createDeterministicLocalJsonRequestResponseRunnerShape
} from "../packages/system-assembly/dist/index.js";
import {
  runLocalJsonSingleCommand
} from "./local-json-single-command-runner.mjs";

const tempDir = mkdtempSync(join(tmpdir(), "constrained-local-json-request-variation-"));
const requestPath = join(tempDir, "agent-context-request.input.json");
const responsePath = join(tempDir, "verified-protocol-surface-adapter.output.json");
const expectedRunnerShape = createDeterministicLocalJsonRequestResponseRunnerShape();

const variation = {
  task_signal: "bounded local planning request variation",
  read_mode_hint: "quick_answer",
  depth_hint: "shallow",
  requested_scope_hints: ["scope:bounded-local-request-variation"]
};

const runResult = runLocalJsonSingleCommand({
  request_path: requestPath,
  response_path: responsePath,
  variation
});
const authoredRequest = JSON.parse(readFileSync(requestPath, "utf8"));
const runnerOutput = JSON.parse(readFileSync(responsePath, "utf8"));
const expectedRequest = expectedRunnerShape.runner_request.request_json;

const assertions = {
  variation_result_completed:
    runResult.verification_result === "local_json_single_command_run_completed" &&
    runResult.request_variation_applied === true &&
    runResult.failure_count === 0,
  only_intent_allowlist_changed:
    authoredRequest.agent_context_request_id === expectedRequest.agent_context_request_id &&
    authoredRequest.operation_id === expectedRequest.operation_id &&
    authoredRequest.operation_version === expectedRequest.operation_version &&
    authoredRequest.contract_only === expectedRequest.contract_only &&
    authoredRequest.intent.request_kind === expectedRequest.intent.request_kind &&
    authoredRequest.intent.task_signal === variation.task_signal &&
    authoredRequest.intent.read_mode_hint === variation.read_mode_hint &&
    authoredRequest.intent.depth_hint === variation.depth_hint &&
    authoredRequest.intent.requested_scope_hints.length === 1 &&
    authoredRequest.intent.requested_scope_hints[0] === variation.requested_scope_hints[0],
  authority_boundary_preserved:
    JSON.stringify(authoredRequest.authority) === JSON.stringify(expectedRequest.authority) &&
    authoredRequest.authority.runtime_permission_granted === false &&
    authoredRequest.authority.permission_grant_issued === false &&
    authoredRequest.authority.mcp_route_permission_granted === false &&
    authoredRequest.authority.api_route_permission_granted === false,
  execution_posture_preserved:
    JSON.stringify(authoredRequest.execution_posture) === JSON.stringify(expectedRequest.execution_posture) &&
    authoredRequest.execution_posture.mcp_server_implemented === false &&
    authoredRequest.execution_posture.mcp_tool_registered === false &&
    authoredRequest.execution_posture.mcp_resource_registered === false &&
    authoredRequest.execution_posture.api_route_registered === false &&
    authoredRequest.execution_posture.api_controller_registered === false &&
    authoredRequest.execution_posture.runtime_handler_bound === false &&
    authoredRequest.execution_posture.provider_sdk_call_allowed_now === false &&
    authoredRequest.execution_posture.transport_execution_allowed_now === false &&
    authoredRequest.execution_posture.concrete_persistence_write_allowed_now === false &&
    authoredRequest.execution_posture.real_model_call_allowed_now === false &&
    authoredRequest.execution_posture.real_storage_write_allowed_now === false &&
    authoredRequest.execution_posture.actual_contour_execution_allowed_now === false,
  varied_request_runs_through_local_cli:
    runResult.request_fixture_written === true &&
    runResult.request_fixture_read === true &&
    runResult.response_fixture_written === true &&
    runnerOutput.runner_response_id === expectedRunnerShape.runner_response.runner_response_id &&
    runnerOutput.refs.bounded_context_response_id === expectedRunnerShape.runner_response.refs.bounded_context_response_id,
  runtime_surfaces_remain_denied:
    runResult.child_process_spawned === false &&
    runResult.mcp_server_implemented === false &&
    runResult.mcp_tool_registered === false &&
    runResult.mcp_resource_registered === false &&
    runResult.api_route_registered === false &&
    runResult.api_controller_registered === false &&
    runResult.runtime_handler_bound === false &&
    runResult.provider_sdk_call_allowed_now === false &&
    runResult.transport_execution_allowed_now === false &&
    runResult.concrete_persistence_read_allowed_now === false &&
    runResult.concrete_persistence_write_allowed_now === false &&
    runResult.real_model_call_allowed_now === false &&
    runResult.real_storage_write_allowed_now === false &&
    runResult.runtime_permission_granted === false &&
    runResult.actual_contour_execution_allowed_now === false
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "constrained_local_json_request_variation_verified"
      : "constrained_local_json_request_variation_failed",
  request_path: requestPath,
  response_path: responsePath,
  agent_context_request_id: authoredRequest.agent_context_request_id,
  task_signal: authoredRequest.intent.task_signal,
  read_mode_hint: authoredRequest.intent.read_mode_hint,
  depth_hint: authoredRequest.intent.depth_hint,
  requested_scope_hints: authoredRequest.intent.requested_scope_hints,
  runtime_permission_granted: runResult.runtime_permission_granted,
  actual_contour_execution_allowed_now: runResult.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
