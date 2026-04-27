#!/usr/bin/env node

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  runLocalJsonSingleCommand
} from "./local-json-single-command-runner.mjs";

const tempDir = mkdtempSync(join(tmpdir(), "minimal-local-source-fixture-selection-"));
const requestPath = join(tempDir, "agent-context-request.input.json");
const responsePath = join(tempDir, "verified-protocol-surface-adapter.output.json");

const runResult = runLocalJsonSingleCommand({
  request_path: requestPath,
  response_path: responsePath,
  variation: {
    task_signal: "bounded local source fixture selection smoke",
    read_mode_hint: "quick_answer",
    depth_hint: "shallow",
    requested_scope_hints: ["scope:active-boundary-chain"]
  }
});

const authoredRequest = JSON.parse(readFileSync(requestPath, "utf8"));
const runnerOutput = JSON.parse(readFileSync(responsePath, "utf8"));
const responsePayload = runnerOutput.response_json.response.response_payload;
const sourceItems = responsePayload.source_items ?? [];
const packageEnvelope = responsePayload.bounded_context_package ?? {};
const packageItems = packageEnvelope.package_items ?? [];
const localSourcePosture = responsePayload.local_source_execution_posture ?? {};

const assertions = {
  selection_run_completed:
    runResult.verification_result === "local_json_single_command_run_completed" &&
    runResult.failure_count === 0,
  request_scope_hint_authored:
    authoredRequest.intent.requested_scope_hints.length === 1 &&
    authoredRequest.intent.requested_scope_hints[0] === "scope:active-boundary-chain",
  selected_one_matching_source_item:
    runResult.selected_source_item_count === 1 &&
    responsePayload.source_item_count === 1 &&
    sourceItems.length === 1 &&
    sourceItems[0].scope_id === "scope:active-boundary-chain" &&
    sourceItems[0].source_ref === "local://deterministic/context/active-boundary-chain",
  bounded_package_matches_selected_source:
    packageEnvelope.source_item_count === 1 &&
    packageItems.length === 1 &&
    packageItems[0].source_item_id === sourceItems[0].source_item_id &&
    packageItems[0].source_ref === sourceItems[0].source_ref &&
    packageItems[0].content === undefined,
  request_drives_response_fixture:
    runnerOutput.refs.agent_context_request_id === authoredRequest.agent_context_request_id &&
    runnerOutput.response_json.response.agent_context_request_id === authoredRequest.agent_context_request_id &&
    runnerOutput.response_json.response.response_payload.source_items[0].scope_id ===
      authoredRequest.intent.requested_scope_hints[0],
  authority_and_execution_remain_denied:
    authoredRequest.authority.runtime_permission_granted === false &&
    authoredRequest.authority.permission_grant_issued === false &&
    authoredRequest.execution_posture.actual_contour_execution_allowed_now === false &&
    localSourcePosture.network_access_allowed_now === false &&
    localSourcePosture.provider_sdk_call_allowed_now === false &&
    localSourcePosture.transport_execution_allowed_now === false &&
    localSourcePosture.concrete_persistence_read_allowed_now === false &&
    localSourcePosture.concrete_persistence_write_allowed_now === false &&
    localSourcePosture.real_model_call_allowed_now === false &&
    localSourcePosture.real_storage_write_allowed_now === false &&
    localSourcePosture.actual_contour_execution_allowed_now === false &&
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
      ? "minimal_local_source_fixture_selection_verified"
      : "minimal_local_source_fixture_selection_failed",
  request_path: requestPath,
  response_path: responsePath,
  requested_scope_hints: authoredRequest.intent.requested_scope_hints,
  selected_source_item_count: sourceItems.length,
  selected_source_refs: sourceItems.map((item) => item.source_ref),
  bounded_context_package_id: packageEnvelope.bounded_context_package_id,
  runtime_permission_granted: runResult.runtime_permission_granted,
  actual_contour_execution_allowed_now: runResult.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
