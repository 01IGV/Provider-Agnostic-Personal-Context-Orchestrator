#!/usr/bin/env node

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeSchemaAwareLocalJsonFixtureExampleArtifacts } from "./schema-aware-local-json-fixture-examples-cli.mjs";

const tempDir = mkdtempSync(join(tmpdir(), "local-json-example-artifact-materialization-"));
const requestOutputPath = join(tempDir, "agent-context-request.example.json");
const responseOutputPath = join(tempDir, "response-observation-summary.example.json");
const summaryOutputPath = join(tempDir, "schema-aware-local-json-examples.summary.json");

const writeResult = writeSchemaAwareLocalJsonFixtureExampleArtifacts({
  request_output_path: requestOutputPath,
  response_output_path: responseOutputPath,
  summary_output_path: summaryOutputPath
});

const requestExample = JSON.parse(readFileSync(requestOutputPath, "utf8"));
const responseObservationSummary = JSON.parse(readFileSync(responseOutputPath, "utf8"));
const summaryExample = JSON.parse(readFileSync(summaryOutputPath, "utf8"));

const assertions = {
  artifacts_written:
    writeResult.verification_result === "schema_aware_local_json_fixture_example_artifacts_written" &&
    writeResult.failure_count === 0 &&
    writeResult.request_example_written === true &&
    writeResult.response_observation_summary_example_written === true &&
    writeResult.summary_example_written === true,
  request_artifact_is_schema_aware:
    requestExample.operation_id === "agent_context_request_boundary" &&
    requestExample.operation_version === "agent-context-request-boundary/v1" &&
    requestExample.intent.task_signal === "schema-aware minimal local JSON fixture example" &&
    requestExample.intent.requested_scope_hints[0] === "scope:active-boundary-chain",
  response_artifact_is_agent_readable:
    responseObservationSummary.agent_readable_contract ===
      "agent-readable-local-json-response-observation/v1" &&
    responseObservationSummary.agent_response_status === "bounded_context_ready_for_agent_use" &&
    responseObservationSummary.selected_source_refs[0] ===
      "local://deterministic/context/active-boundary-chain" &&
    responseObservationSummary.selected_scope_ids[0] === "scope:active-boundary-chain",
  summary_artifact_links_request_and_response_examples:
    summaryExample.schema_contract_version ===
      "local-json-agent-request-response-contract-schema/v1" &&
    summaryExample.command_ref === "tool:local-json:run" &&
    summaryExample.example_request_json.operation_id === requestExample.operation_id &&
    summaryExample.expected_response_observation_summary_json.agent_readable_contract ===
      responseObservationSummary.agent_readable_contract,
  default_deny_posture_preserved:
    writeResult.runtime_permission_granted === false &&
    writeResult.actual_contour_execution_allowed_now === false &&
    responseObservationSummary.runtime_permission_granted === false &&
    responseObservationSummary.actual_contour_execution_allowed_now === false,
  runtime_surfaces_remain_closed:
    writeResult.child_process_spawned === false &&
    writeResult.mcp_server_implemented === false &&
    writeResult.mcp_tool_registered === false &&
    writeResult.mcp_resource_registered === false &&
    writeResult.api_route_registered === false &&
    writeResult.api_controller_registered === false &&
    writeResult.runtime_handler_bound === false &&
    writeResult.provider_sdk_call_allowed_now === false &&
    writeResult.concrete_persistence_read_allowed_now === false &&
    writeResult.concrete_persistence_write_allowed_now === false &&
    writeResult.real_model_call_allowed_now === false &&
    writeResult.real_storage_write_allowed_now === false
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "local_json_example_artifact_materialization_verified"
      : "local_json_example_artifact_materialization_failed",
  request_output_path: requestOutputPath,
  response_output_path: responseOutputPath,
  summary_output_path: summaryOutputPath,
  schema_contract_version: summaryExample.schema_contract_version,
  selected_source_refs: responseObservationSummary.selected_source_refs,
  runtime_permission_granted: writeResult.runtime_permission_granted,
  actual_contour_execution_allowed_now: writeResult.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
