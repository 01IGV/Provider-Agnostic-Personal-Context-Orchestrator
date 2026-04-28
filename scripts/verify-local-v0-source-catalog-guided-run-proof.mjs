#!/usr/bin/env node

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  writeLocalJsonAgentLocalV0ToolPackArtifactSet
} from "./local-json-agent-local-v0-tool-pack-cli.mjs";
import {
  runLocalJsonAgentLocalV0SingleCommand
} from "./local-json-agent-local-v0-single-command-runner.mjs";

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

const tempDir = mkdtempSync(join(tmpdir(), "local-v0-source-catalog-guided-run-"));
const manifestOutputPath = join(tempDir, "local-json-agent-tool-manifest.json");
const schemaOutputPath = join(tempDir, "local-json-agent-request-response-schema.json");
const sourceCatalogOutputPath = join(tempDir, "local-v0-source-catalog.json");
const sampleRequestOutputPath = join(tempDir, "agent-context-request.sample.json");
const sampleResponseOutputPath = join(tempDir, "verified-protocol-surface-adapter.sample.response.json");
const sampleSummaryOutputPath = join(tempDir, "local-json-agent-request-run.sample.summary.json");
const sampleIndexOutputPath = join(tempDir, "local-json-agent-request-runner.sample.index.json");
const toolPackIndexOutputPath = join(tempDir, "local-json-agent-local-v0-tool-pack.index.json");
const guidedRequestOutputPath = join(tempDir, "agent-context-request.source-catalog-guided.json");
const guidedResponseOutputPath = join(
  tempDir,
  "verified-protocol-surface-adapter.source-catalog-guided.response.json"
);
const guidedSummaryOutputPath = join(
  tempDir,
  "local-v0-source-catalog-guided-run.summary.json"
);

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

const toolPackIndexArtifact = readJson(toolPackIndexOutputPath);
const discoveredPaths = toolPackIndexArtifact.artifact_paths;
const sourceCatalogArtifact = readJson(discoveredPaths.source_catalog_output_path);
const selectedCatalogEntry = sourceCatalogArtifact.entries.find(
  (entry) => entry.scope_id === "scope:active-boundary-chain"
);
const selectedScopeId = selectedCatalogEntry?.scope_id;

const guidedRunResult = runLocalJsonAgentLocalV0SingleCommand({
  request_path: guidedRequestOutputPath,
  response_path: guidedResponseOutputPath,
  summary_path: guidedSummaryOutputPath,
  variation: {
    task_signal: "source catalog guided local v0 bounded planning request",
    read_mode_hint: "planning",
    depth_hint: "standard",
    requested_scope_hints: selectedScopeId ? [selectedScopeId] : []
  }
});

const guidedRequestArtifact = readJson(guidedRequestOutputPath);
const guidedResponseArtifact = readJson(guidedResponseOutputPath);
const guidedSummaryArtifact = readJson(guidedSummaryOutputPath);
const guidedObservationSummary = guidedResponseArtifact.response_observation_summary_json;

const assertions = {
  tool_pack_materialized:
    toolPackWriteResult.verification_result ===
      "local_json_agent_local_v0_tool_pack_artifact_set_written" &&
    toolPackWriteResult.failure_count === 0 &&
    toolPackIndexArtifact.output_contract_ref ===
      "local-json-agent-local-v0-tool-pack-artifact-set/v1",
  source_catalog_discovered_from_tool_pack:
    discoveredPaths.source_catalog_output_path === sourceCatalogOutputPath &&
    toolPackIndexArtifact.source_catalog_ref === "local-v0-source-catalog/v1" &&
    sourceCatalogArtifact.catalog_version === toolPackIndexArtifact.source_catalog_ref &&
    sourceCatalogArtifact.intended_consumer === "ai_agent" &&
    sourceCatalogArtifact.selection_policy.arbitrary_file_paths_allowed === false &&
    sourceCatalogArtifact.selection_policy.unknown_scope_grants_access === false,
  catalog_scope_selected:
    selectedCatalogEntry !== undefined &&
    selectedScopeId === "scope:active-boundary-chain" &&
    selectedCatalogEntry.source_ref === "local://deterministic/context/active-boundary-chain" &&
    selectedCatalogEntry.source_item_template.source_ref === selectedCatalogEntry.source_ref,
  guided_run_completed:
    guidedRunResult.verification_result ===
      "local_json_agent_local_v0_single_command_run_completed" &&
    guidedRunResult.output_contract_ref === "local-json-agent-local-v0-single-command-run/v1" &&
    guidedRunResult.failure_count === 0,
  request_used_catalog_scope:
    guidedRequestArtifact.intent.task_signal ===
      "source catalog guided local v0 bounded planning request" &&
    guidedRequestArtifact.intent.read_mode_hint === "planning" &&
    guidedRequestArtifact.intent.depth_hint === "standard" &&
    guidedRequestArtifact.intent.requested_scope_hints.join("|") === selectedScopeId &&
    guidedRunResult.request_scope_hints.join("|") === selectedScopeId,
  response_matches_catalog_selection:
    guidedRunResult.selected_scope_ids.join("|") === selectedScopeId &&
    guidedSummaryArtifact.selected_scope_ids.join("|") === selectedScopeId &&
    guidedObservationSummary.selected_scope_ids.join("|") === selectedScopeId &&
    guidedRunResult.selected_source_refs.join("|") === selectedCatalogEntry?.source_ref &&
    guidedSummaryArtifact.selected_source_refs.join("|") === selectedCatalogEntry?.source_ref &&
    guidedObservationSummary.selected_source_refs.join("|") === selectedCatalogEntry?.source_ref,
  explicit_paths_only:
    guidedRunResult.request_path === guidedRequestOutputPath &&
    guidedRunResult.response_path === guidedResponseOutputPath &&
    guidedRunResult.summary_path === guidedSummaryOutputPath &&
    guidedRunResult.request_fixture_written === true &&
    guidedRunResult.request_fixture_read === true &&
    guidedRunResult.response_file_write_performed === true &&
    guidedRunResult.summary_file_write_performed === true &&
    guidedRunResult.writes_only_explicit_request_response_summary_paths === true,
  default_deny_posture_preserved:
    sourceCatalogArtifact.execution_posture.runtime_permission_granted === false &&
    sourceCatalogArtifact.execution_posture.actual_contour_execution_allowed_now === false &&
    guidedRunResult.runtime_permission_granted === false &&
    guidedRunResult.actual_contour_execution_allowed_now === false &&
    guidedSummaryArtifact.runtime_permission_granted === false &&
    guidedSummaryArtifact.actual_contour_execution_allowed_now === false &&
    guidedObservationSummary.runtime_permission_granted === false &&
    guidedObservationSummary.actual_contour_execution_allowed_now === false,
  runtime_surfaces_remain_closed:
    guidedRunResult.child_process_spawned === false &&
    guidedRunResult.arbitrary_source_loading_allowed === false &&
    guidedRunResult.mcp_server_implemented === false &&
    guidedRunResult.mcp_tool_registered === false &&
    guidedRunResult.mcp_resource_registered === false &&
    guidedRunResult.api_route_registered === false &&
    guidedRunResult.api_controller_registered === false &&
    guidedRunResult.runtime_handler_bound === false &&
    guidedRunResult.provider_sdk_call_allowed_now === false &&
    guidedRunResult.transport_execution_allowed_now === false &&
    guidedRunResult.concrete_persistence_read_allowed_now === false &&
    guidedRunResult.concrete_persistence_write_allowed_now === false &&
    guidedRunResult.real_model_call_allowed_now === false &&
    guidedRunResult.real_storage_write_allowed_now === false
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "local_v0_source_catalog_guided_run_proof_verified"
      : "local_v0_source_catalog_guided_run_proof_failed",
  output_contract_ref: "local-v0-source-catalog-guided-run-proof/v1",
  tool_pack_index_output_path: toolPackIndexOutputPath,
  source_catalog_output_path: sourceCatalogOutputPath,
  guided_request_output_path: guidedRequestOutputPath,
  guided_response_output_path: guidedResponseOutputPath,
  guided_summary_output_path: guidedSummaryOutputPath,
  source_catalog_ref: toolPackIndexArtifact.source_catalog_ref,
  selected_scope_id: selectedScopeId,
  selected_source_ref: selectedCatalogEntry?.source_ref,
  guided_run_selected_scope_ids: guidedRunResult.selected_scope_ids,
  guided_run_selected_source_refs: guidedRunResult.selected_source_refs,
  writes_only_explicit_proof_artifact_paths: true,
  arbitrary_source_loading_allowed: false,
  runtime_permission_granted: guidedRunResult.runtime_permission_granted,
  actual_contour_execution_allowed_now: guidedRunResult.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
