#!/usr/bin/env node

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeLocalRealSourceToolPackArtifactSet } from "./local-real-source-tool-pack-cli.mjs";
import {
  runLocalRealSourceToolPackConsumption
} from "./local-real-source-tool-pack-consumption-cli.mjs";

const tempDir = mkdtempSync(join(tmpdir(), "local-real-source-tool-pack-consumption-"));
const manifestOutputPath = join(tempDir, "local-json-agent-tool-manifest.json");
const requestOutputPath = join(tempDir, "agent-context-request.real-source-consumption.sample.json");
const responseOutputPath = join(tempDir, "local-real-source-consumption.sample.response.json");
const summaryOutputPath = join(tempDir, "local-real-source-consumption.sample.summary.json");
const indexOutputPath = join(tempDir, "local-real-source-consumption.sample.index.json");
const sampleIndexOutputPath = join(
  tempDir,
  "local-real-source-consumption.sample.artifact-set.index.json"
);
const toolPackIndexOutputPath = join(tempDir, "local-real-source-tool-pack.index.json");
const consumptionSummaryOutputPath = join(
  tempDir,
  "local-real-source-tool-pack.consumption.summary.json"
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
const consumptionResult = runLocalRealSourceToolPackConsumption({
  tool_pack_index_path: toolPackIndexOutputPath,
  manifest_path: manifestOutputPath,
  request_path: requestOutputPath,
  response_path: responseOutputPath,
  summary_path: summaryOutputPath,
  index_path: indexOutputPath,
  sample_index_path: sampleIndexOutputPath,
  consumption_summary_output_path: consumptionSummaryOutputPath
});

const toolPackIndexArtifact = readJson(toolPackIndexOutputPath);
const consumptionSummaryArtifact = readJson(consumptionSummaryOutputPath);

const assertions = {
  tool_pack_written:
    toolPackWriteResult.verification_result ===
      "local_real_source_tool_pack_artifact_set_written" &&
    toolPackWriteResult.failure_count === 0,
  consumption_completed:
    consumptionResult.verification_result ===
      "local_real_source_tool_pack_consumption_completed" &&
    consumptionResult.output_contract_ref === "local-real-source-tool-pack-consumption/v1" &&
    consumptionResult.failure_count === 0,
  explicit_paths_validated:
    consumptionResult.tool_pack_index_path === toolPackIndexOutputPath &&
    consumptionResult.manifest_path === manifestOutputPath &&
    consumptionResult.request_path === requestOutputPath &&
    consumptionResult.response_path === responseOutputPath &&
    consumptionResult.summary_path === summaryOutputPath &&
    consumptionResult.index_path === indexOutputPath &&
    consumptionResult.sample_index_path === sampleIndexOutputPath &&
    consumptionResult.consumption_summary_output_path === consumptionSummaryOutputPath,
  consumption_summary_written_only_to_explicit_path:
    consumptionResult.file_write_performed === true &&
    consumptionResult.writes_only_explicit_consumption_summary_path === true &&
    consumptionSummaryArtifact.consumption_summary_output_path === consumptionSummaryOutputPath,
  selected_refs_preserved:
    consumptionResult.selected_scope_ids.join("|") === "scope:repo-work-context" &&
    consumptionResult.selected_scope_ids.join("|") ===
      toolPackIndexArtifact.selected_scope_ids.join("|") &&
    consumptionResult.selected_source_refs.join("|") ===
      toolPackIndexArtifact.selected_source_refs.join("|"),
  receipt_digests_and_envelopes_preserved:
    consumptionResult.source_materialization_receipt_ref ===
      "local-v0-source-materialization-receipt/v1" &&
    consumptionResult.content_digests.join("|") === toolPackIndexArtifact.content_digests.join("|") &&
    consumptionResult.provenance_envelope_ref === toolPackIndexArtifact.provenance_envelope_ref &&
    consumptionResult.permission_envelope_ref === toolPackIndexArtifact.permission_envelope_ref &&
    consumptionResult.audit_envelope_ref === toolPackIndexArtifact.audit_envelope_ref,
  default_deny_posture_preserved:
    consumptionResult.direct_agent_repo_file_access_allowed_now === false &&
    consumptionResult.arbitrary_source_loading_allowed === false &&
    consumptionResult.arbitrary_file_read_allowed_now === false &&
    consumptionResult.user_selected_path_read_allowed_now === false &&
    consumptionResult.directory_traversal_allowed_now === false &&
    consumptionResult.directory_listing_allowed_now === false &&
    consumptionResult.repo_scanning_allowed_now === false &&
    consumptionResult.runtime_permission_granted === false &&
    consumptionResult.actual_contour_execution_allowed_now === false,
  runtime_surfaces_remain_closed:
    consumptionResult.child_process_spawned === false &&
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
      ? "local_real_source_tool_pack_consumption_cli_boundary_verified"
      : "local_real_source_tool_pack_consumption_cli_boundary_failed",
  output_contract_ref: consumptionResult.output_contract_ref,
  tool_pack_index_output_path: toolPackIndexOutputPath,
  consumption_summary_output_path: consumptionSummaryOutputPath,
  selected_scope_ids: consumptionResult.selected_scope_ids,
  selected_source_refs: consumptionResult.selected_source_refs,
  source_materialization_receipt_ref: consumptionResult.source_materialization_receipt_ref,
  runtime_permission_granted: consumptionResult.runtime_permission_granted,
  actual_contour_execution_allowed_now: consumptionResult.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
