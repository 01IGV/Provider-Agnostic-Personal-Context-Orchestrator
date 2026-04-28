#!/usr/bin/env node

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeSchemaAwareLocalJsonFixtureExampleArtifacts } from "./schema-aware-local-json-fixture-examples-cli.mjs";
import { runLocalJsonAgentRequestRunner } from "./local-json-agent-request-runner-cli.mjs";

const tempDir = mkdtempSync(join(tmpdir(), "local-json-agent-request-runner-"));
const requestPath = join(tempDir, "agent-context-request.json");
const expectedResponseSummaryPath = join(tempDir, "response-observation-summary.expected.json");
const examplesSummaryPath = join(tempDir, "schema-aware-local-json-examples.summary.json");
const responsePath = join(tempDir, "verified-protocol-surface-adapter.response.json");
const runSummaryPath = join(tempDir, "local-json-agent-request-run.summary.json");

const exampleWriteResult = writeSchemaAwareLocalJsonFixtureExampleArtifacts({
  request_output_path: requestPath,
  response_output_path: expectedResponseSummaryPath,
  summary_output_path: examplesSummaryPath
});

const runResult = runLocalJsonAgentRequestRunner({
  request_path: requestPath,
  response_path: responsePath,
  summary_path: runSummaryPath
});

const requestJson = JSON.parse(readFileSync(requestPath, "utf8"));
const responseJson = JSON.parse(readFileSync(responsePath, "utf8"));
const runSummaryJson = JSON.parse(readFileSync(runSummaryPath, "utf8"));
const responseObservationSummary = responseJson.response_observation_summary_json;

const assertions = {
  request_example_written:
    exampleWriteResult.verification_result ===
      "schema_aware_local_json_fixture_example_artifacts_written" &&
    exampleWriteResult.failure_count === 0,
  request_run_completed:
    runResult.verification_result === "local_json_agent_request_run_completed" &&
    runResult.output_contract_ref === "local-json-agent-request-run-summary/v1" &&
    runResult.failure_count === 0,
  explicit_paths_used:
    runResult.request_path === requestPath &&
    runResult.response_path === responsePath &&
    runResult.summary_path === runSummaryPath &&
    runResult.response_file_write_performed === true &&
    runResult.summary_file_write_performed === true &&
    runResult.writes_only_explicit_response_and_summary_paths === true,
  request_response_refs_preserved:
    runResult.agent_context_request_id === requestJson.agent_context_request_id &&
    runResult.runner_response_id === responseJson.runner_response_id &&
    runResult.bounded_context_response_id === responseJson.refs.bounded_context_response_id &&
    runResult.bounded_context_package_id === responseJson.refs.bounded_context_package_id,
  run_summary_artifact_matches_returned_summary:
    runSummaryJson.verification_result === runResult.verification_result &&
    runSummaryJson.output_contract_ref === runResult.output_contract_ref &&
    runSummaryJson.agent_context_request_id === runResult.agent_context_request_id &&
    runSummaryJson.runner_response_id === runResult.runner_response_id,
  response_summary_is_agent_readable:
    runResult.agent_readable_contract ===
      "agent-readable-local-json-response-observation/v1" &&
    runResult.agent_response_status === responseObservationSummary.agent_response_status &&
    Array.isArray(runResult.selected_source_refs) &&
    runResult.selected_source_refs.length === responseObservationSummary.selected_source_refs.length &&
    Array.isArray(runResult.selected_scope_ids) &&
    runResult.selected_scope_ids.length === responseObservationSummary.selected_scope_ids.length,
  default_deny_posture_preserved:
    runResult.runtime_permission_granted === false &&
    runResult.actual_contour_execution_allowed_now === false &&
    responseObservationSummary.runtime_permission_granted === false &&
    responseObservationSummary.actual_contour_execution_allowed_now === false,
  runtime_surfaces_remain_closed:
    runResult.child_process_spawned === false &&
    runResult.arbitrary_source_loading_allowed === false &&
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
      ? "local_json_agent_request_runner_verified"
      : "local_json_agent_request_runner_failed",
  request_path: requestPath,
  response_path: responsePath,
  summary_path: runSummaryPath,
  output_contract_ref: runResult.output_contract_ref,
  agent_context_request_id: runResult.agent_context_request_id,
  runner_response_id: runResult.runner_response_id,
  selected_source_refs: runResult.selected_source_refs,
  selected_scope_ids: runResult.selected_scope_ids,
  runtime_permission_granted: runResult.runtime_permission_granted,
  actual_contour_execution_allowed_now: runResult.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
