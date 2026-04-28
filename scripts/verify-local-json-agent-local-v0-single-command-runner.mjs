#!/usr/bin/env node

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  runLocalJsonAgentLocalV0SingleCommand
} from "./local-json-agent-local-v0-single-command-runner.mjs";

const tempDir = mkdtempSync(join(tmpdir(), "local-json-agent-local-v0-single-command-"));
const requestPath = join(tempDir, "agent-context-request.local-v0.json");
const responsePath = join(tempDir, "verified-protocol-surface-adapter.local-v0.response.json");
const summaryPath = join(tempDir, "local-json-agent-local-v0-run.summary.json");

const result = runLocalJsonAgentLocalV0SingleCommand({
  request_path: requestPath,
  response_path: responsePath,
  summary_path: summaryPath,
  variation: {
    task_signal: "local v0 single command bounded planning request",
    read_mode_hint: "planning",
    depth_hint: "standard",
    requested_scope_hints: ["scope:active-boundary-chain"]
  }
});

const requestJson = JSON.parse(readFileSync(requestPath, "utf8"));
const responseJson = JSON.parse(readFileSync(responsePath, "utf8"));
const summaryJson = JSON.parse(readFileSync(summaryPath, "utf8"));
const responseObservationSummary = responseJson.response_observation_summary_json;

const assertions = {
  single_command_completed:
    result.verification_result ===
      "local_json_agent_local_v0_single_command_run_completed" &&
    result.output_contract_ref === "local-json-agent-local-v0-single-command-run/v1" &&
    result.failure_count === 0,
  explicit_paths_used:
    result.request_path === requestPath &&
    result.response_path === responsePath &&
    result.summary_path === summaryPath &&
    result.request_fixture_written === true &&
    result.request_fixture_read === true &&
    result.response_file_write_performed === true &&
    result.summary_file_write_performed === true &&
    result.writes_only_explicit_request_response_summary_paths === true,
  request_variation_is_allowlisted:
    result.request_variation_applied === true &&
    requestJson.intent.task_signal === "local v0 single command bounded planning request" &&
    requestJson.intent.read_mode_hint === "planning" &&
    requestJson.intent.depth_hint === "standard" &&
    requestJson.intent.requested_scope_hints.join("|") === "scope:active-boundary-chain" &&
    result.request_task_signal === requestJson.intent.task_signal &&
    result.request_read_mode_hint === requestJson.intent.read_mode_hint &&
    result.request_depth_hint === requestJson.intent.depth_hint &&
    result.request_scope_hints.join("|") === requestJson.intent.requested_scope_hints.join("|"),
  summary_matches_response:
    summaryJson.verification_result === "local_json_agent_request_run_completed" &&
    summaryJson.output_contract_ref === "local-json-agent-request-run-summary/v1" &&
    summaryJson.agent_context_request_id === requestJson.agent_context_request_id &&
    summaryJson.runner_response_id === responseJson.runner_response_id &&
    summaryJson.bounded_context_response_id ===
      responseJson.refs.bounded_context_response_id &&
    summaryJson.bounded_context_package_id === responseJson.refs.bounded_context_package_id,
  result_matches_summary:
    result.agent_context_request_id === summaryJson.agent_context_request_id &&
    result.runner_response_id === summaryJson.runner_response_id &&
    result.bounded_context_response_id === summaryJson.bounded_context_response_id &&
    result.bounded_context_package_id === summaryJson.bounded_context_package_id,
  response_is_agent_readable:
    result.agent_readable_contract ===
      "agent-readable-local-json-response-observation/v1" &&
    result.agent_response_status === responseObservationSummary.agent_response_status &&
    Array.isArray(result.selected_source_refs) &&
    result.selected_source_refs.join("|") ===
      responseObservationSummary.selected_source_refs.join("|") &&
    Array.isArray(result.selected_scope_ids) &&
    result.selected_scope_ids.join("|") ===
      responseObservationSummary.selected_scope_ids.join("|"),
  default_deny_posture_preserved:
    result.runtime_permission_granted === false &&
    result.actual_contour_execution_allowed_now === false &&
    summaryJson.runtime_permission_granted === false &&
    summaryJson.actual_contour_execution_allowed_now === false &&
    responseObservationSummary.runtime_permission_granted === false &&
    responseObservationSummary.actual_contour_execution_allowed_now === false,
  runtime_surfaces_remain_closed:
    result.child_process_spawned === false &&
    result.arbitrary_source_loading_allowed === false &&
    result.mcp_server_implemented === false &&
    result.mcp_tool_registered === false &&
    result.mcp_resource_registered === false &&
    result.api_route_registered === false &&
    result.api_controller_registered === false &&
    result.runtime_handler_bound === false &&
    result.provider_sdk_call_allowed_now === false &&
    result.transport_execution_allowed_now === false &&
    result.concrete_persistence_read_allowed_now === false &&
    result.concrete_persistence_write_allowed_now === false &&
    result.real_model_call_allowed_now === false &&
    result.real_storage_write_allowed_now === false
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "local_json_agent_local_v0_single_command_runner_verified"
      : "local_json_agent_local_v0_single_command_runner_failed",
  output_contract_ref: result.output_contract_ref,
  request_path: requestPath,
  response_path: responsePath,
  summary_path: summaryPath,
  agent_context_request_id: result.agent_context_request_id,
  runner_response_id: result.runner_response_id,
  selected_source_refs: result.selected_source_refs,
  selected_scope_ids: result.selected_scope_ids,
  request_variation_applied: result.request_variation_applied,
  runtime_permission_granted: result.runtime_permission_granted,
  actual_contour_execution_allowed_now: result.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
