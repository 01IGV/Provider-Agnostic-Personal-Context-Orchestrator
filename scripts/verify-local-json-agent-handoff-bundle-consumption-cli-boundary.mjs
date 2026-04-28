#!/usr/bin/env node

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeLocalJsonAgentHandoffBundle } from "./local-json-agent-handoff-bundle-cli.mjs";
import {
  runLocalJsonAgentHandoffBundleConsumption
} from "./local-json-agent-handoff-bundle-consumption-cli.mjs";

const tempDir = mkdtempSync(join(tmpdir(), "local-json-agent-handoff-bundle-consumption-"));
const manifestOutputPath = join(tempDir, "local-json-agent-tool-manifest.json");
const schemaOutputPath = join(tempDir, "local-json-agent-request-response-schema.json");
const requestOutputPath = join(tempDir, "agent-context-request.example.json");
const expectedResponseOutputPath = join(tempDir, "response-observation-summary.expected.json");
const examplesSummaryOutputPath = join(tempDir, "schema-aware-local-json-examples.summary.json");
const bundleSummaryOutputPath = join(tempDir, "local-json-agent-handoff-bundle.summary.json");
const actualResponseOutputPath = join(tempDir, "verified-protocol-surface-adapter.actual.json");

const bundleWriteResult = writeLocalJsonAgentHandoffBundle({
  manifest_output_path: manifestOutputPath,
  schema_output_path: schemaOutputPath,
  request_output_path: requestOutputPath,
  response_output_path: expectedResponseOutputPath,
  examples_summary_output_path: examplesSummaryOutputPath,
  bundle_summary_output_path: bundleSummaryOutputPath
});

const consumptionResult = runLocalJsonAgentHandoffBundleConsumption({
  bundle_summary_path: bundleSummaryOutputPath,
  manifest_path: manifestOutputPath,
  schema_path: schemaOutputPath,
  request_path: requestOutputPath,
  expected_response_path: expectedResponseOutputPath,
  examples_summary_path: examplesSummaryOutputPath,
  actual_response_path: actualResponseOutputPath
});

const bundleSummaryArtifact = JSON.parse(readFileSync(bundleSummaryOutputPath, "utf8"));
const actualResponseArtifact = JSON.parse(readFileSync(actualResponseOutputPath, "utf8"));
const actualResponseSummary = actualResponseArtifact.response_observation_summary_json;

const assertions = {
  handoff_bundle_written:
    bundleWriteResult.verification_result === "local_json_agent_handoff_bundle_written" &&
    bundleWriteResult.failure_count === 0,
  consumption_cli_completed:
    consumptionResult.verification_result ===
      "local_json_agent_handoff_bundle_consumption_completed" &&
    consumptionResult.output_contract_ref === "local-json-agent-handoff-bundle-consumption/v1" &&
    consumptionResult.failure_count === 0,
  explicit_bundle_paths_validated:
    consumptionResult.bundle_summary_path === bundleSummaryOutputPath &&
    consumptionResult.manifest_path === manifestOutputPath &&
    consumptionResult.schema_path === schemaOutputPath &&
    consumptionResult.request_path === requestOutputPath &&
    consumptionResult.expected_response_path === expectedResponseOutputPath &&
    consumptionResult.examples_summary_path === examplesSummaryOutputPath &&
    consumptionResult.actual_response_path === actualResponseOutputPath &&
    bundleSummaryArtifact.artifact_paths.request_output_path === requestOutputPath,
  actual_response_written_only_to_explicit_path:
    consumptionResult.file_write_performed === true &&
    consumptionResult.writes_only_explicit_actual_response_path === true &&
    consumptionResult.actual_response_path === actualResponseOutputPath,
  actual_response_summary_matches_expected:
    consumptionResult.actual_summary_matches_expected_summary === true &&
    actualResponseSummary.agent_readable_contract === consumptionResult.agent_readable_contract &&
    actualResponseSummary.agent_response_status === consumptionResult.agent_response_status,
  default_deny_posture_preserved:
    consumptionResult.runtime_permission_granted === false &&
    consumptionResult.actual_contour_execution_allowed_now === false &&
    actualResponseSummary.runtime_permission_granted === false &&
    actualResponseSummary.actual_contour_execution_allowed_now === false,
  runtime_surfaces_remain_closed:
    consumptionResult.child_process_spawned === false &&
    consumptionResult.arbitrary_source_loading_allowed === false &&
    consumptionResult.mcp_server_implemented === false &&
    consumptionResult.mcp_tool_registered === false &&
    consumptionResult.mcp_resource_registered === false &&
    consumptionResult.api_route_registered === false &&
    consumptionResult.api_controller_registered === false &&
    consumptionResult.runtime_handler_bound === false &&
    consumptionResult.provider_sdk_call_allowed_now === false &&
    consumptionResult.transport_execution_allowed_now === false &&
    consumptionResult.concrete_persistence_read_allowed_now === false &&
    consumptionResult.concrete_persistence_write_allowed_now === false &&
    consumptionResult.real_model_call_allowed_now === false &&
    consumptionResult.real_storage_write_allowed_now === false
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "local_json_agent_handoff_bundle_consumption_cli_boundary_verified"
      : "local_json_agent_handoff_bundle_consumption_cli_boundary_failed",
  bundle_contract_ref: consumptionResult.bundle_contract_ref,
  output_contract_ref: consumptionResult.output_contract_ref,
  request_output_path: requestOutputPath,
  actual_response_output_path: actualResponseOutputPath,
  selected_source_refs: consumptionResult.selected_source_refs,
  selected_scope_ids: consumptionResult.selected_scope_ids,
  runtime_permission_granted: consumptionResult.runtime_permission_granted,
  actual_contour_execution_allowed_now: consumptionResult.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
