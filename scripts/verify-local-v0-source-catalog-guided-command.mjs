#!/usr/bin/env node

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  writeLocalJsonAgentLocalV0ToolPackArtifactSet
} from "./local-json-agent-local-v0-tool-pack-cli.mjs";
import {
  runLocalV0SourceCatalogGuidedCommand
} from "./local-v0-source-catalog-guided-command.mjs";

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

const tempDir = mkdtempSync(join(tmpdir(), "local-v0-source-catalog-guided-command-"));
const manifestOutputPath = join(tempDir, "local-json-agent-tool-manifest.json");
const schemaOutputPath = join(tempDir, "local-json-agent-request-response-schema.json");
const sourceCatalogOutputPath = join(tempDir, "local-v0-source-catalog.json");
const sampleRequestOutputPath = join(tempDir, "agent-context-request.sample.json");
const sampleResponseOutputPath = join(tempDir, "verified-protocol-surface-adapter.sample.response.json");
const sampleSummaryOutputPath = join(tempDir, "local-json-agent-request-run.sample.summary.json");
const sampleIndexOutputPath = join(tempDir, "local-json-agent-request-runner.sample.index.json");
const toolPackIndexOutputPath = join(tempDir, "local-json-agent-local-v0-tool-pack.index.json");
const guidedRequestOutputPath = join(tempDir, "agent-context-request.guided-command.json");
const guidedResponseOutputPath = join(
  tempDir,
  "verified-protocol-surface-adapter.guided-command.response.json"
);
const guidedSummaryOutputPath = join(tempDir, "local-v0-source-catalog-guided-command.summary.json");

const toolPackWriteResult = writeLocalJsonAgentLocalV0ToolPackArtifactSet({
  manifest_output_path: manifestOutputPath,
  schema_output_path: schemaOutputPath,
  source_catalog_output_path: sourceCatalogOutputPath,
  sample_request_output_path: sampleRequestOutputPath,
  sample_response_output_path: sampleResponseOutputPath,
  sample_summary_output_path: sampleSummaryOutputPath,
  sample_index_output_path: sampleIndexOutputPath,
  tool_pack_index_output_path: toolPackIndexOutputPath
});

const sourceCatalogArtifact = readJson(sourceCatalogOutputPath);
const selectedCatalogEntry = sourceCatalogArtifact.entries.find(
  (entry) => entry.scope_id === "scope:active-boundary-chain"
);
const commandResult = runLocalV0SourceCatalogGuidedCommand({
  tool_pack_index_path: toolPackIndexOutputPath,
  request_path: guidedRequestOutputPath,
  response_path: guidedResponseOutputPath,
  summary_path: guidedSummaryOutputPath,
  scope_hint: selectedCatalogEntry?.scope_id,
  task_signal: "source catalog guided command bounded planning request",
  read_mode_hint: "planning",
  depth_hint: "standard"
});

const guidedRequestArtifact = readJson(guidedRequestOutputPath);
const guidedResponseArtifact = readJson(guidedResponseOutputPath);
const guidedSummaryArtifact = readJson(guidedSummaryOutputPath);
const guidedObservationSummary = guidedResponseArtifact.response_observation_summary_json;

const assertions = {
  tool_pack_materialized:
    toolPackWriteResult.verification_result ===
      "local_json_agent_local_v0_tool_pack_artifact_set_written" &&
    toolPackWriteResult.failure_count === 0,
  command_completed:
    commandResult.verification_result ===
      "local_v0_source_catalog_guided_command_completed" &&
    commandResult.output_contract_ref === "local-v0-source-catalog-guided-command/v1" &&
    commandResult.failure_count === 0,
  command_read_explicit_tool_pack_and_catalog:
    commandResult.tool_pack_index_path === toolPackIndexOutputPath &&
    commandResult.source_catalog_output_path === sourceCatalogOutputPath &&
    commandResult.reads_only_explicit_tool_pack_index_and_referenced_catalog === true,
  command_used_catalog_scope:
    selectedCatalogEntry !== undefined &&
    commandResult.selected_scope_id === selectedCatalogEntry.scope_id &&
    commandResult.selected_source_ref === selectedCatalogEntry.source_ref &&
    guidedRequestArtifact.intent.requested_scope_hints.join("|") ===
      selectedCatalogEntry.scope_id,
  response_matches_catalog_selection:
    commandResult.guided_run_selected_scope_ids.join("|") === selectedCatalogEntry?.scope_id &&
    commandResult.guided_run_selected_source_refs.join("|") === selectedCatalogEntry?.source_ref &&
    guidedSummaryArtifact.selected_scope_ids.join("|") === selectedCatalogEntry?.scope_id &&
    guidedSummaryArtifact.selected_source_refs.join("|") === selectedCatalogEntry?.source_ref &&
    guidedObservationSummary.selected_scope_ids.join("|") === selectedCatalogEntry?.scope_id &&
    guidedObservationSummary.selected_source_refs.join("|") === selectedCatalogEntry?.source_ref,
  explicit_paths_only:
    commandResult.request_path === guidedRequestOutputPath &&
    commandResult.response_path === guidedResponseOutputPath &&
    commandResult.summary_path === guidedSummaryOutputPath &&
    commandResult.request_fixture_written === true &&
    commandResult.request_fixture_read === true &&
    commandResult.response_file_write_performed === true &&
    commandResult.summary_file_write_performed === true &&
    commandResult.writes_only_explicit_request_response_summary_paths === true,
  default_deny_posture_preserved:
    commandResult.runtime_permission_granted === false &&
    commandResult.actual_contour_execution_allowed_now === false &&
    guidedSummaryArtifact.runtime_permission_granted === false &&
    guidedSummaryArtifact.actual_contour_execution_allowed_now === false &&
    guidedObservationSummary.runtime_permission_granted === false &&
    guidedObservationSummary.actual_contour_execution_allowed_now === false,
  runtime_surfaces_remain_closed:
    commandResult.child_process_spawned === false &&
    commandResult.arbitrary_source_loading_allowed === false &&
    commandResult.mcp_server_implemented === false &&
    commandResult.mcp_tool_registered === false &&
    commandResult.mcp_resource_registered === false &&
    commandResult.api_route_registered === false &&
    commandResult.api_controller_registered === false &&
    commandResult.runtime_handler_bound === false &&
    commandResult.provider_sdk_call_allowed_now === false &&
    commandResult.transport_execution_allowed_now === false &&
    commandResult.concrete_persistence_read_allowed_now === false &&
    commandResult.concrete_persistence_write_allowed_now === false &&
    commandResult.real_model_call_allowed_now === false &&
    commandResult.real_storage_write_allowed_now === false
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "local_v0_source_catalog_guided_command_verified"
      : "local_v0_source_catalog_guided_command_failed",
  output_contract_ref: commandResult.output_contract_ref,
  tool_pack_index_output_path: toolPackIndexOutputPath,
  source_catalog_output_path: sourceCatalogOutputPath,
  guided_request_output_path: guidedRequestOutputPath,
  guided_response_output_path: guidedResponseOutputPath,
  guided_summary_output_path: guidedSummaryOutputPath,
  selected_scope_id: commandResult.selected_scope_id,
  selected_source_ref: commandResult.selected_source_ref,
  runtime_permission_granted: commandResult.runtime_permission_granted,
  actual_contour_execution_allowed_now: commandResult.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
