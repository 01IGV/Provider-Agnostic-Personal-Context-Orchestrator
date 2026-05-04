#!/usr/bin/env node

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  runLocalRealSourceToolPackSingleCommandConsumptionV0
} from "./local-real-source-tool-pack-single-command-consumption-v0-cli.mjs";

const tempDir = mkdtempSync(join(tmpdir(), "local-real-source-tool-pack-single-command-"));
const manifestOutputPath = join(tempDir, "local-json-agent-tool-manifest.json");
const requestOutputPath = join(tempDir, "agent-context-request.real-source-tool-pack-run.sample.json");
const responseOutputPath = join(tempDir, "local-real-source-tool-pack-run.sample.response.json");
const summaryOutputPath = join(tempDir, "local-real-source-tool-pack-run.sample.summary.json");
const indexOutputPath = join(tempDir, "local-real-source-tool-pack-run.sample.index.json");
const sampleIndexOutputPath = join(
  tempDir,
  "local-real-source-tool-pack-run.sample.artifact-set.index.json"
);
const toolPackIndexOutputPath = join(tempDir, "local-real-source-tool-pack.index.json");
const consumptionSummaryOutputPath = join(
  tempDir,
  "local-real-source-tool-pack.single-command-consumption.summary.json"
);
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

const result = runLocalRealSourceToolPackSingleCommandConsumptionV0({
  manifest_output_path: manifestOutputPath,
  request_output_path: requestOutputPath,
  response_output_path: responseOutputPath,
  summary_output_path: summaryOutputPath,
  index_output_path: indexOutputPath,
  sample_index_output_path: sampleIndexOutputPath,
  tool_pack_index_output_path: toolPackIndexOutputPath,
  consumption_summary_output_path: consumptionSummaryOutputPath
});

const manifestArtifact = readJson(manifestOutputPath);
const requestArtifact = readJson(requestOutputPath);
const responseArtifact = readJson(responseOutputPath);
const summaryArtifact = readJson(summaryOutputPath);
const toolPackIndexArtifact = readJson(toolPackIndexOutputPath);
const consumptionSummaryArtifact = readJson(consumptionSummaryOutputPath);
const commandRefs = manifestArtifact.commands.map((command) => command.command_ref);

const assertions = {
  single_command_completed:
    result.verification_result ===
      "local_real_source_tool_pack_single_command_consumption_v0_completed" &&
    result.output_contract_ref ===
      "local-real-source-tool-pack-single-command-consumption-v0/v1" &&
    result.failure_count === 0,
  artifacts_written_and_consumed:
    result.tool_pack_written === true &&
    result.index_consumption_completed === true &&
    result.tool_pack_contract_ref === "local-real-source-tool-pack-artifact-set/v1" &&
    result.index_consumption_contract_ref ===
      "local-real-source-tool-pack-index-consumption/v1" &&
    result.underlying_consumption_contract_ref === "local-real-source-tool-pack-consumption/v1",
  explicit_paths_used:
    result.manifest_output_path === manifestOutputPath &&
    result.request_output_path === requestOutputPath &&
    result.response_output_path === responseOutputPath &&
    result.summary_output_path === summaryOutputPath &&
    result.index_output_path === indexOutputPath &&
    result.sample_index_output_path === sampleIndexOutputPath &&
    result.tool_pack_index_output_path === toolPackIndexOutputPath &&
    result.consumption_summary_output_path === consumptionSummaryOutputPath &&
    result.output_paths_confined_to_tool_pack_directory === true,
  manifest_advertises_single_command:
    commandRefs.includes("tool:local-real-source-tool-pack:run-consume-v0") &&
    manifestArtifact.recommended_sequence.includes(
      "tool:local-real-source-tool-pack:run-consume-v0"
    ),
  index_consumer_semantics_preserved:
    consumptionSummaryArtifact.verification_result ===
      "local_real_source_tool_pack_index_consumption_completed" &&
    consumptionSummaryArtifact.input_mode === "tool_pack_index_only" &&
    consumptionSummaryArtifact.discovered_artifact_paths_from_tool_pack_index === true &&
    consumptionSummaryArtifact.artifact_paths_confined_to_tool_pack_directory === true,
  selected_refs_preserved:
    result.selected_scope_ids.join("|") === "scope:repo-work-context" &&
    result.selected_scope_ids.join("|") === toolPackIndexArtifact.selected_scope_ids.join("|") &&
    result.selected_source_refs.join("|") === toolPackIndexArtifact.selected_source_refs.join("|") &&
    result.selected_source_refs.join("|") === summaryArtifact.selected_source_refs.join("|"),
  request_response_and_envelopes_preserved:
    requestArtifact.intent.requested_scope_hints.join("|") === "scope:repo-work-context" &&
    responseArtifact.output_contract_ref === "local-real-source-adapter-v0-response/v1" &&
    result.content_digests.join("|") === toolPackIndexArtifact.content_digests.join("|") &&
    result.source_materialization_receipt_ref ===
      "local-v0-source-materialization-receipt/v1" &&
    result.provenance_envelope_ref === toolPackIndexArtifact.provenance_envelope_ref &&
    result.permission_envelope_ref === toolPackIndexArtifact.permission_envelope_ref &&
    result.audit_envelope_ref === toolPackIndexArtifact.audit_envelope_ref,
  default_deny_posture_preserved:
    result.direct_agent_repo_file_access_allowed_now === false &&
    result.arbitrary_source_loading_allowed === false &&
    result.arbitrary_file_read_allowed_now === false &&
    result.user_selected_path_read_allowed_now === false &&
    result.directory_traversal_allowed_now === false &&
    result.directory_listing_allowed_now === false &&
    result.repo_scanning_allowed_now === false &&
    result.runtime_permission_granted === false &&
    result.actual_contour_execution_allowed_now === false,
  runtime_surfaces_remain_closed:
    result.child_process_spawned === false &&
    result.mcp_server_implemented === false &&
    result.mcp_tool_registered === false &&
    result.mcp_resource_registered === false &&
    result.api_route_registered === false &&
    result.api_controller_registered === false &&
    result.runtime_handler_bound === false &&
    result.provider_sdk_call_allowed_now === false &&
    result.transport_execution_allowed_now === false &&
    result.concrete_persistence_read_allowed_now === false &&
    result.concrete_persistence_write_allowed_now === false &&
    result.real_model_call_allowed_now === false &&
    result.real_storage_write_allowed_now === false
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "local_real_source_tool_pack_single_command_consumption_v0_verified"
      : "local_real_source_tool_pack_single_command_consumption_v0_failed",
  output_contract_ref: result.output_contract_ref,
  tool_pack_index_output_path: toolPackIndexOutputPath,
  consumption_summary_output_path: consumptionSummaryOutputPath,
  selected_scope_ids: result.selected_scope_ids,
  selected_source_refs: result.selected_source_refs,
  runtime_permission_granted: result.runtime_permission_granted,
  actual_contour_execution_allowed_now: result.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
