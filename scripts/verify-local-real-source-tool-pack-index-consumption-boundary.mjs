#!/usr/bin/env node

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeLocalRealSourceToolPackArtifactSet } from "./local-real-source-tool-pack-cli.mjs";
import {
  runLocalRealSourceToolPackIndexConsumption
} from "./local-real-source-tool-pack-index-consumption-cli.mjs";

const tempDir = mkdtempSync(join(tmpdir(), "local-real-source-tool-pack-index-consumption-"));
const manifestOutputPath = join(tempDir, "local-json-agent-tool-manifest.json");
const requestOutputPath = join(tempDir, "agent-context-request.real-source-index-consumption.sample.json");
const responseOutputPath = join(tempDir, "local-real-source-index-consumption.sample.response.json");
const summaryOutputPath = join(tempDir, "local-real-source-index-consumption.sample.summary.json");
const indexOutputPath = join(tempDir, "local-real-source-index-consumption.sample.index.json");
const sampleIndexOutputPath = join(
  tempDir,
  "local-real-source-index-consumption.sample.artifact-set.index.json"
);
const toolPackIndexOutputPath = join(tempDir, "local-real-source-tool-pack.index.json");
const consumptionSummaryOutputPath = join(
  tempDir,
  "local-real-source-tool-pack.index-consumption.summary.json"
);
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

const toolPackWriteResult = writeLocalRealSourceToolPackArtifactSet({
  manifest_output_path: manifestOutputPath,
  request_output_path: requestOutputPath,
  response_output_path: responseOutputPath,
  summary_output_path: summaryOutputPath,
  index_output_path: indexOutputPath,
  sample_index_output_path: sampleIndexOutputPath,
  tool_pack_index_output_path: toolPackIndexOutputPath
});
const indexConsumptionResult = runLocalRealSourceToolPackIndexConsumption({
  tool_pack_index_path: toolPackIndexOutputPath,
  consumption_summary_output_path: consumptionSummaryOutputPath
});

const toolPackIndexArtifact = readJson(toolPackIndexOutputPath);
const indexConsumptionSummaryArtifact = readJson(consumptionSummaryOutputPath);

const assertions = {
  tool_pack_written:
    toolPackWriteResult.verification_result ===
      "local_real_source_tool_pack_artifact_set_written" &&
    toolPackWriteResult.failure_count === 0,
  index_only_consumption_completed:
    indexConsumptionResult.verification_result ===
      "local_real_source_tool_pack_index_consumption_completed" &&
    indexConsumptionResult.output_contract_ref ===
      "local-real-source-tool-pack-index-consumption/v1" &&
    indexConsumptionResult.underlying_consumption_contract_ref ===
      "local-real-source-tool-pack-consumption/v1" &&
    indexConsumptionResult.failure_count === 0,
  started_from_one_index_path:
    indexConsumptionResult.input_mode === "tool_pack_index_only" &&
    indexConsumptionResult.tool_pack_index_path === toolPackIndexOutputPath &&
    indexConsumptionResult.discovered_artifact_paths_from_tool_pack_index === true,
  artifact_paths_confined:
    indexConsumptionResult.artifact_paths_confined_to_tool_pack_directory === true &&
    indexConsumptionResult.manifest_path === manifestOutputPath &&
    indexConsumptionResult.request_path === requestOutputPath &&
    indexConsumptionResult.response_path === responseOutputPath &&
    indexConsumptionResult.summary_path === summaryOutputPath &&
    indexConsumptionResult.index_path === indexOutputPath &&
    indexConsumptionResult.sample_index_path === sampleIndexOutputPath,
  consumption_summary_written_only_to_explicit_path:
    indexConsumptionResult.file_write_performed === true &&
    indexConsumptionResult.writes_only_explicit_consumption_summary_path === true &&
    indexConsumptionSummaryArtifact.consumption_summary_output_path === consumptionSummaryOutputPath,
  selected_refs_preserved:
    indexConsumptionResult.selected_scope_ids.join("|") === "scope:repo-work-context" &&
    indexConsumptionResult.selected_scope_ids.join("|") ===
      toolPackIndexArtifact.selected_scope_ids.join("|") &&
    indexConsumptionResult.selected_source_refs.join("|") ===
      toolPackIndexArtifact.selected_source_refs.join("|"),
  receipt_digests_and_envelopes_preserved:
    indexConsumptionResult.source_materialization_receipt_ref ===
      "local-v0-source-materialization-receipt/v1" &&
    indexConsumptionResult.content_digests.join("|") ===
      toolPackIndexArtifact.content_digests.join("|") &&
    indexConsumptionResult.provenance_envelope_ref === toolPackIndexArtifact.provenance_envelope_ref &&
    indexConsumptionResult.permission_envelope_ref === toolPackIndexArtifact.permission_envelope_ref &&
    indexConsumptionResult.audit_envelope_ref === toolPackIndexArtifact.audit_envelope_ref,
  default_deny_posture_preserved:
    indexConsumptionResult.direct_agent_repo_file_access_allowed_now === false &&
    indexConsumptionResult.arbitrary_source_loading_allowed === false &&
    indexConsumptionResult.arbitrary_file_read_allowed_now === false &&
    indexConsumptionResult.user_selected_path_read_allowed_now === false &&
    indexConsumptionResult.directory_traversal_allowed_now === false &&
    indexConsumptionResult.directory_listing_allowed_now === false &&
    indexConsumptionResult.repo_scanning_allowed_now === false &&
    indexConsumptionResult.runtime_permission_granted === false &&
    indexConsumptionResult.actual_contour_execution_allowed_now === false,
  runtime_surfaces_remain_closed:
    indexConsumptionResult.child_process_spawned === false &&
    indexConsumptionResult.mcp_server_implemented === false &&
    indexConsumptionResult.mcp_tool_registered === false &&
    indexConsumptionResult.mcp_resource_registered === false &&
    indexConsumptionResult.api_route_registered === false &&
    indexConsumptionResult.api_controller_registered === false &&
    indexConsumptionResult.runtime_handler_bound === false &&
    indexConsumptionResult.provider_sdk_call_allowed_now === false &&
    indexConsumptionResult.transport_execution_allowed_now === false &&
    indexConsumptionResult.concrete_persistence_read_allowed_now === false &&
    indexConsumptionResult.concrete_persistence_write_allowed_now === false &&
    indexConsumptionResult.real_model_call_allowed_now === false &&
    indexConsumptionResult.real_storage_write_allowed_now === false
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "local_real_source_tool_pack_index_consumption_boundary_verified"
      : "local_real_source_tool_pack_index_consumption_boundary_failed",
  output_contract_ref: "local-real-source-tool-pack-index-consumption-boundary-proof/v1",
  tool_pack_index_output_path: toolPackIndexOutputPath,
  consumption_summary_output_path: consumptionSummaryOutputPath,
  selected_scope_ids: indexConsumptionResult.selected_scope_ids,
  selected_source_refs: indexConsumptionResult.selected_source_refs,
  input_mode: indexConsumptionResult.input_mode,
  discovered_artifact_paths_from_tool_pack_index:
    indexConsumptionResult.discovered_artifact_paths_from_tool_pack_index,
  artifact_paths_confined_to_tool_pack_directory:
    indexConsumptionResult.artifact_paths_confined_to_tool_pack_directory,
  runtime_permission_granted: indexConsumptionResult.runtime_permission_granted,
  actual_contour_execution_allowed_now: indexConsumptionResult.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
