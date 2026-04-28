#!/usr/bin/env node

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  runLocalJsonSingleCommand
} from "./local-json-single-command-runner.mjs";

const tempDir = mkdtempSync(join(tmpdir(), "local-json-response-observation-summary-"));
const requestPath = join(tempDir, "agent-context-request.input.json");
const responsePath = join(tempDir, "verified-protocol-surface-adapter.output.json");

const runResult = runLocalJsonSingleCommand({
  request_path: requestPath,
  response_path: responsePath,
  variation: {
    task_signal: "bounded local response observation summary smoke",
    read_mode_hint: "quick_answer",
    depth_hint: "shallow",
    requested_scope_hints: ["scope:project-orientation"]
  }
});

const runnerOutput = JSON.parse(readFileSync(responsePath, "utf8"));
const observationSummary = runnerOutput.response_observation_summary_json;
const responsePayload = runnerOutput.response_json.response.response_payload;
const sourceItems = responsePayload.source_items ?? [];
const packageItems = responsePayload.bounded_context_package?.package_items ?? [];

const assertions = {
  observation_run_completed:
    runResult.verification_result === "local_json_single_command_run_completed" &&
    runResult.failure_count === 0,
  observation_summary_present:
    observationSummary.observation_result === "local_json_response_observation_summary_ready" &&
    runResult.response_observation_summary_result === observationSummary.observation_result,
  observation_summary_refs_match_runner_response:
    observationSummary.runner_response_id === runnerOutput.runner_response_id &&
    observationSummary.agent_context_request_id === runnerOutput.refs.agent_context_request_id &&
    observationSummary.bounded_context_response_id === runnerOutput.refs.bounded_context_response_id &&
    observationSummary.bounded_context_package_id === runnerOutput.refs.bounded_context_package_id &&
    observationSummary.protocol_adapter_shape_id === runnerOutput.refs.protocol_adapter_shape_id,
  observation_summary_counts_match_payload:
    observationSummary.selected_source_item_count === sourceItems.length &&
    observationSummary.package_item_count === packageItems.length &&
    observationSummary.selected_source_item_count === 1,
  observation_summary_selected_refs_match_payload:
    observationSummary.selected_source_refs.length === 1 &&
    observationSummary.selected_source_refs[0] === "local://deterministic/context/project-orientation" &&
    observationSummary.selected_source_refs[0] === sourceItems[0].source_ref &&
    observationSummary.selected_scope_ids.length === 1 &&
    observationSummary.selected_scope_ids[0] === "scope:project-orientation" &&
    observationSummary.selected_scope_ids[0] === sourceItems[0].scope_id,
  observation_summary_posture_denied:
    observationSummary.local_json_only === true &&
    observationSummary.deterministic === true &&
    observationSummary.fixture_driven === true &&
    observationSummary.runtime_permission_granted === false &&
    observationSummary.actual_contour_execution_allowed_now === false &&
    runResult.runtime_permission_granted === false &&
    runResult.actual_contour_execution_allowed_now === false,
  runtime_surfaces_remain_closed:
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
    runResult.real_storage_write_allowed_now === false
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "local_json_response_observation_summary_verified"
      : "local_json_response_observation_summary_failed",
  request_path: requestPath,
  response_path: responsePath,
  observation_result: observationSummary.observation_result,
  selected_source_item_count: observationSummary.selected_source_item_count,
  selected_source_refs: observationSummary.selected_source_refs,
  selected_scope_ids: observationSummary.selected_scope_ids,
  runtime_permission_granted: observationSummary.runtime_permission_granted,
  actual_contour_execution_allowed_now: observationSummary.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
