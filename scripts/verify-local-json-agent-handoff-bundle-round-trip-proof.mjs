#!/usr/bin/env node

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeLocalJsonAgentHandoffBundle } from "./local-json-agent-handoff-bundle-cli.mjs";
import { runLocalJsonFixtureRunnerCli } from "./local-json-fixture-runner-cli.mjs";

const tempDir = mkdtempSync(join(tmpdir(), "local-json-agent-handoff-bundle-round-trip-proof-"));
const manifestOutputPath = join(tempDir, "local-json-agent-tool-manifest.json");
const schemaOutputPath = join(tempDir, "local-json-agent-request-response-schema.json");
const requestOutputPath = join(tempDir, "agent-context-request.example.json");
const expectedResponseOutputPath = join(tempDir, "response-observation-summary.expected.json");
const examplesSummaryOutputPath = join(tempDir, "schema-aware-local-json-examples.summary.json");
const bundleSummaryOutputPath = join(tempDir, "local-json-agent-handoff-bundle.summary.json");
const actualRunnerResponsePath = join(tempDir, "verified-protocol-surface-adapter.actual.json");

const bundleWriteResult = writeLocalJsonAgentHandoffBundle({
  manifest_output_path: manifestOutputPath,
  schema_output_path: schemaOutputPath,
  request_output_path: requestOutputPath,
  response_output_path: expectedResponseOutputPath,
  examples_summary_output_path: examplesSummaryOutputPath,
  bundle_summary_output_path: bundleSummaryOutputPath
});

const runnerResult = runLocalJsonFixtureRunnerCli({
  input_path: requestOutputPath,
  output_path: actualRunnerResponsePath
});

const manifestArtifact = JSON.parse(readFileSync(manifestOutputPath, "utf8"));
const schemaArtifact = JSON.parse(readFileSync(schemaOutputPath, "utf8"));
const requestArtifact = JSON.parse(readFileSync(requestOutputPath, "utf8"));
const expectedResponseSummary = JSON.parse(readFileSync(expectedResponseOutputPath, "utf8"));
const examplesSummaryArtifact = JSON.parse(readFileSync(examplesSummaryOutputPath, "utf8"));
const bundleSummaryArtifact = JSON.parse(readFileSync(bundleSummaryOutputPath, "utf8"));
const actualRunnerResponse = JSON.parse(readFileSync(actualRunnerResponsePath, "utf8"));
const actualResponseSummary = actualRunnerResponse.response_observation_summary_json;
const manifestCommandRefs = manifestArtifact.commands.map((command) => command.command_ref);

const sameArray = (left, right) =>
  Array.isArray(left) &&
  Array.isArray(right) &&
  left.length === right.length &&
  left.every((item, index) => item === right[index]);

const assertions = {
  handoff_bundle_materialized:
    bundleWriteResult.verification_result === "local_json_agent_handoff_bundle_written" &&
    bundleWriteResult.bundle_contract_ref === "local-json-agent-handoff-bundle/v1" &&
    bundleWriteResult.failure_count === 0 &&
    bundleSummaryArtifact.artifact_paths.request_output_path === requestOutputPath,
  bundle_manifest_advertises_round_trip_proof:
    manifestArtifact.manifest_id === "local-json-agent-tool-manifest" &&
    manifestCommandRefs.includes("proof:local-json-agent-handoff-bundle-round-trip:verify"),
  bundle_schema_matches_request_and_response_contracts:
    schemaArtifact.contract_version === "local-json-agent-request-response-contract-schema/v1" &&
    requestArtifact.operation_version === "agent-context-request-boundary/v1" &&
    expectedResponseSummary.agent_readable_contract ===
      "agent-readable-local-json-response-observation/v1",
  bundled_request_round_trips_through_existing_runner:
    runnerResult.verification_result === "local_json_cli_file_io_boundary_completed" &&
    runnerResult.failure_count === 0 &&
    runnerResult.input_path === requestOutputPath &&
    runnerResult.output_path === actualRunnerResponsePath,
  actual_summary_matches_bundled_expected_summary:
    actualResponseSummary.agent_readable_contract === expectedResponseSummary.agent_readable_contract &&
    actualResponseSummary.agent_response_status === expectedResponseSummary.agent_response_status &&
    actualResponseSummary.response_status === expectedResponseSummary.response_status &&
    actualResponseSummary.selected_source_item_count ===
      expectedResponseSummary.selected_source_item_count &&
    actualResponseSummary.package_item_count === expectedResponseSummary.package_item_count &&
    sameArray(actualResponseSummary.selected_source_refs, expectedResponseSummary.selected_source_refs) &&
    sameArray(actualResponseSummary.selected_scope_ids, expectedResponseSummary.selected_scope_ids) &&
    sameArray(actualResponseSummary.safe_agent_use_hints, expectedResponseSummary.safe_agent_use_hints) &&
    sameArray(actualResponseSummary.denied_agent_action_hints, expectedResponseSummary.denied_agent_action_hints),
  examples_summary_links_bundle_artifacts:
    examplesSummaryArtifact.example_request_json.operation_id === requestArtifact.operation_id &&
    examplesSummaryArtifact.expected_response_observation_summary_json.agent_readable_contract ===
      expectedResponseSummary.agent_readable_contract,
  bundle_refs_remain_consistent:
    bundleSummaryArtifact.artifact_contract_refs.manifest ===
      "local-json-agent-tool-manifest-artifact/v1" &&
    bundleSummaryArtifact.artifact_contract_refs.schema === schemaArtifact.contract_version &&
    bundleSummaryArtifact.artifact_contract_refs.response_observation_summary ===
      expectedResponseSummary.agent_readable_contract,
  default_deny_posture_preserved:
    bundleWriteResult.runtime_permission_granted === false &&
    bundleWriteResult.actual_contour_execution_allowed_now === false &&
    runnerResult.runtime_permission_granted === false &&
    runnerResult.actual_contour_execution_allowed_now === false &&
    actualResponseSummary.runtime_permission_granted === false &&
    actualResponseSummary.actual_contour_execution_allowed_now === false,
  runtime_surfaces_remain_closed:
    runnerResult.child_process_spawned === false &&
    bundleSummaryArtifact.child_process_spawned === false &&
    bundleSummaryArtifact.arbitrary_source_loading_allowed === false &&
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
      ? "local_json_agent_handoff_bundle_round_trip_proof_verified"
      : "local_json_agent_handoff_bundle_round_trip_proof_failed",
  bundle_contract_ref: bundleWriteResult.bundle_contract_ref,
  request_output_path: requestOutputPath,
  expected_response_output_path: expectedResponseOutputPath,
  actual_runner_response_path: actualRunnerResponsePath,
  selected_source_refs: actualResponseSummary.selected_source_refs,
  selected_scope_ids: actualResponseSummary.selected_scope_ids,
  runtime_permission_granted: actualResponseSummary.runtime_permission_granted,
  actual_contour_execution_allowed_now: actualResponseSummary.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
