#!/usr/bin/env node

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runLocalJsonFixtureRunnerCli } from "./local-json-fixture-runner-cli.mjs";
import { writeSchemaAwareLocalJsonFixtureExampleArtifacts } from "./schema-aware-local-json-fixture-examples-cli.mjs";

const tempDir = mkdtempSync(join(tmpdir(), "local-json-example-artifact-round-trip-proof-"));
const requestExamplePath = join(tempDir, "agent-context-request.example.json");
const expectedSummaryPath = join(tempDir, "response-observation-summary.expected.json");
const examplesSummaryPath = join(tempDir, "schema-aware-local-json-examples.summary.json");
const actualRunnerResponsePath = join(tempDir, "verified-protocol-surface-adapter.actual.json");

const writeResult = writeSchemaAwareLocalJsonFixtureExampleArtifacts({
  request_output_path: requestExamplePath,
  response_output_path: expectedSummaryPath,
  summary_output_path: examplesSummaryPath
});

const runnerResult = runLocalJsonFixtureRunnerCli({
  input_path: requestExamplePath,
  output_path: actualRunnerResponsePath
});

const requestExample = JSON.parse(readFileSync(requestExamplePath, "utf8"));
const expectedSummary = JSON.parse(readFileSync(expectedSummaryPath, "utf8"));
const actualRunnerResponse = JSON.parse(readFileSync(actualRunnerResponsePath, "utf8"));
const actualSummary = actualRunnerResponse.response_observation_summary_json;

const sameArray = (left, right) =>
  Array.isArray(left) &&
  Array.isArray(right) &&
  left.length === right.length &&
  left.every((item, index) => item === right[index]);

const assertions = {
  artifacts_materialized:
    writeResult.verification_result ===
      "schema_aware_local_json_fixture_example_artifacts_written" &&
    writeResult.failure_count === 0 &&
    writeResult.request_example_written === true &&
    writeResult.response_observation_summary_example_written === true &&
    writeResult.summary_example_written === true,
  request_artifact_round_trips_through_existing_runner:
    runnerResult.verification_result === "local_json_cli_file_io_boundary_completed" &&
    runnerResult.failure_count === 0 &&
    runnerResult.input_path === requestExamplePath &&
    runnerResult.output_path === actualRunnerResponsePath &&
    requestExample.operation_id === "agent_context_request_boundary",
  actual_summary_matches_expected_artifact:
    actualSummary.agent_readable_contract === expectedSummary.agent_readable_contract &&
    actualSummary.agent_response_status === expectedSummary.agent_response_status &&
    actualSummary.response_status === expectedSummary.response_status &&
    actualSummary.selected_source_item_count === expectedSummary.selected_source_item_count &&
    actualSummary.package_item_count === expectedSummary.package_item_count &&
    sameArray(actualSummary.selected_source_refs, expectedSummary.selected_source_refs) &&
    sameArray(actualSummary.selected_scope_ids, expectedSummary.selected_scope_ids) &&
    sameArray(actualSummary.safe_agent_use_hints, expectedSummary.safe_agent_use_hints) &&
    sameArray(actualSummary.denied_agent_action_hints, expectedSummary.denied_agent_action_hints),
  default_deny_posture_preserved:
    writeResult.runtime_permission_granted === false &&
    writeResult.actual_contour_execution_allowed_now === false &&
    runnerResult.runtime_permission_granted === false &&
    runnerResult.actual_contour_execution_allowed_now === false &&
    actualSummary.runtime_permission_granted === false &&
    actualSummary.actual_contour_execution_allowed_now === false,
  runtime_surfaces_remain_closed:
    runnerResult.child_process_spawned === false &&
    runnerResult.mcp_server_implemented === false &&
    runnerResult.mcp_tool_registered === false &&
    runnerResult.mcp_resource_registered === false &&
    runnerResult.api_route_registered === false &&
    runnerResult.api_controller_registered === false &&
    runnerResult.runtime_handler_bound === false &&
    runnerResult.provider_sdk_call_allowed_now === false &&
    runnerResult.transport_execution_allowed_now === false &&
    runnerResult.concrete_persistence_read_allowed_now === false &&
    runnerResult.concrete_persistence_write_allowed_now === false &&
    runnerResult.real_model_call_allowed_now === false &&
    runnerResult.real_storage_write_allowed_now === false
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "local_json_example_artifact_round_trip_proof_verified"
      : "local_json_example_artifact_round_trip_proof_failed",
  request_example_path: requestExamplePath,
  expected_summary_path: expectedSummaryPath,
  actual_runner_response_path: actualRunnerResponsePath,
  selected_source_refs: actualSummary.selected_source_refs,
  selected_scope_ids: actualSummary.selected_scope_ids,
  runtime_permission_granted: actualSummary.runtime_permission_granted,
  actual_contour_execution_allowed_now: actualSummary.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
