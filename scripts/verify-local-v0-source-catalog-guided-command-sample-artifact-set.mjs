#!/usr/bin/env node

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  writeLocalV0SourceCatalogGuidedCommandSampleArtifactSet
} from "./local-v0-source-catalog-guided-command-sample-cli.mjs";

const tempDir = mkdtempSync(join(tmpdir(), "local-v0-source-catalog-guided-sample-"));
const manifestOutputPath = join(tempDir, "local-json-agent-tool-manifest.json");
const schemaOutputPath = join(tempDir, "local-json-agent-request-response-schema.json");
const sourceCatalogOutputPath = join(tempDir, "local-v0-source-catalog.json");
const toolPackSampleRequestOutputPath = join(tempDir, "agent-context-request.sample.json");
const toolPackSampleResponseOutputPath = join(
  tempDir,
  "verified-protocol-surface-adapter.sample.response.json"
);
const toolPackSampleSummaryOutputPath = join(
  tempDir,
  "local-json-agent-request-run.sample.summary.json"
);
const toolPackSampleIndexOutputPath = join(
  tempDir,
  "local-json-agent-request-runner.sample.index.json"
);
const toolPackIndexOutputPath = join(tempDir, "local-json-agent-local-v0-tool-pack.index.json");
const guidedRequestOutputPath = join(tempDir, "agent-context-request.guided-command.sample.json");
const guidedResponseOutputPath = join(
  tempDir,
  "verified-protocol-surface-adapter.guided-command.sample.response.json"
);
const guidedSummaryOutputPath = join(
  tempDir,
  "local-v0-source-catalog-guided-command.sample.summary.json"
);
const guidedIndexOutputPath = join(
  tempDir,
  "local-v0-source-catalog-guided-command.sample.index.json"
);

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

const sampleWriteResult = writeLocalV0SourceCatalogGuidedCommandSampleArtifactSet({
  manifest_output_path: manifestOutputPath,
  schema_output_path: schemaOutputPath,
  source_catalog_output_path: sourceCatalogOutputPath,
  tool_pack_sample_request_output_path: toolPackSampleRequestOutputPath,
  tool_pack_sample_response_output_path: toolPackSampleResponseOutputPath,
  tool_pack_sample_summary_output_path: toolPackSampleSummaryOutputPath,
  tool_pack_sample_index_output_path: toolPackSampleIndexOutputPath,
  tool_pack_index_output_path: toolPackIndexOutputPath,
  guided_request_output_path: guidedRequestOutputPath,
  guided_response_output_path: guidedResponseOutputPath,
  guided_summary_output_path: guidedSummaryOutputPath,
  guided_index_output_path: guidedIndexOutputPath
});

const sourceCatalogArtifact = readJson(sourceCatalogOutputPath);
const guidedRequestArtifact = readJson(guidedRequestOutputPath);
const guidedResponseArtifact = readJson(guidedResponseOutputPath);
const guidedSummaryArtifact = readJson(guidedSummaryOutputPath);
const guidedIndexArtifact = readJson(guidedIndexOutputPath);
const guidedObservationSummary = guidedResponseArtifact.response_observation_summary_json;
const selectedCatalogEntry = sourceCatalogArtifact.entries.find(
  (entry) => entry.scope_id === guidedIndexArtifact.selected_scope_id
);

const assertions = {
  sample_artifact_set_written:
    sampleWriteResult.verification_result ===
      "local_v0_source_catalog_guided_command_sample_artifact_set_written" &&
    sampleWriteResult.output_contract_ref ===
      "local-v0-source-catalog-guided-command-sample-artifact-set/v1" &&
    sampleWriteResult.failure_count === 0,
  explicit_paths_used:
    guidedIndexArtifact.artifact_paths.manifest_output_path === manifestOutputPath &&
    guidedIndexArtifact.artifact_paths.schema_output_path === schemaOutputPath &&
    guidedIndexArtifact.artifact_paths.source_catalog_output_path === sourceCatalogOutputPath &&
    guidedIndexArtifact.artifact_paths.tool_pack_index_output_path === toolPackIndexOutputPath &&
    guidedIndexArtifact.artifact_paths.guided_request_output_path === guidedRequestOutputPath &&
    guidedIndexArtifact.artifact_paths.guided_response_output_path === guidedResponseOutputPath &&
    guidedIndexArtifact.artifact_paths.guided_summary_output_path === guidedSummaryOutputPath &&
    guidedIndexArtifact.artifact_paths.guided_index_output_path === guidedIndexOutputPath &&
    guidedIndexArtifact.writes_only_explicit_sample_artifact_paths === true,
  contracts_match_artifacts:
    guidedIndexArtifact.artifact_contract_refs.source_catalog ===
      sourceCatalogArtifact.catalog_version &&
    guidedIndexArtifact.artifact_contract_refs.guided_response_summary ===
      guidedObservationSummary.agent_readable_contract &&
    guidedIndexArtifact.artifact_contract_refs.guided_run_summary ===
      guidedSummaryArtifact.output_contract_ref,
  guided_request_matches_catalog:
    selectedCatalogEntry !== undefined &&
    guidedRequestArtifact.intent.requested_scope_hints.join("|") ===
      selectedCatalogEntry.scope_id &&
    guidedIndexArtifact.selected_scope_id === selectedCatalogEntry.scope_id &&
    guidedIndexArtifact.selected_source_ref === selectedCatalogEntry.source_ref,
  guided_response_matches_catalog:
    guidedIndexArtifact.guided_run_selected_scope_ids.join("|") ===
      selectedCatalogEntry?.scope_id &&
    guidedIndexArtifact.guided_run_selected_source_refs.join("|") ===
      selectedCatalogEntry?.source_ref &&
    guidedSummaryArtifact.selected_scope_ids.join("|") === selectedCatalogEntry?.scope_id &&
    guidedSummaryArtifact.selected_source_refs.join("|") === selectedCatalogEntry?.source_ref &&
    guidedObservationSummary.selected_scope_ids.join("|") === selectedCatalogEntry?.scope_id &&
    guidedObservationSummary.selected_source_refs.join("|") === selectedCatalogEntry?.source_ref,
  default_deny_posture_preserved:
    guidedIndexArtifact.runtime_permission_granted === false &&
    guidedIndexArtifact.actual_contour_execution_allowed_now === false &&
    guidedSummaryArtifact.runtime_permission_granted === false &&
    guidedSummaryArtifact.actual_contour_execution_allowed_now === false &&
    guidedObservationSummary.runtime_permission_granted === false &&
    guidedObservationSummary.actual_contour_execution_allowed_now === false,
  runtime_surfaces_remain_closed:
    guidedIndexArtifact.child_process_spawned === false &&
    guidedIndexArtifact.arbitrary_source_loading_allowed === false &&
    guidedIndexArtifact.mcp_server_implemented === false &&
    guidedIndexArtifact.mcp_tool_registered === false &&
    guidedIndexArtifact.mcp_resource_registered === false &&
    guidedIndexArtifact.api_route_registered === false &&
    guidedIndexArtifact.api_controller_registered === false &&
    guidedIndexArtifact.runtime_handler_bound === false &&
    guidedIndexArtifact.provider_sdk_call_allowed_now === false &&
    guidedIndexArtifact.transport_execution_allowed_now === false &&
    guidedIndexArtifact.concrete_persistence_read_allowed_now === false &&
    guidedIndexArtifact.concrete_persistence_write_allowed_now === false &&
    guidedIndexArtifact.real_model_call_allowed_now === false &&
    guidedIndexArtifact.real_storage_write_allowed_now === false
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "local_v0_source_catalog_guided_command_sample_artifact_set_verified"
      : "local_v0_source_catalog_guided_command_sample_artifact_set_failed",
  output_contract_ref: sampleWriteResult.output_contract_ref,
  tool_pack_index_output_path: toolPackIndexOutputPath,
  source_catalog_output_path: sourceCatalogOutputPath,
  guided_request_output_path: guidedRequestOutputPath,
  guided_response_output_path: guidedResponseOutputPath,
  guided_summary_output_path: guidedSummaryOutputPath,
  guided_index_output_path: guidedIndexOutputPath,
  selected_scope_id: guidedIndexArtifact.selected_scope_id,
  selected_source_ref: guidedIndexArtifact.selected_source_ref,
  runtime_permission_granted: guidedIndexArtifact.runtime_permission_granted,
  actual_contour_execution_allowed_now: guidedIndexArtifact.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
