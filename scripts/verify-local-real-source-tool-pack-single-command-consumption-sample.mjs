#!/usr/bin/env node

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  writeLocalRealSourceToolPackSingleCommandConsumptionSample
} from "./local-real-source-tool-pack-single-command-consumption-sample-cli.mjs";

const tempDir = mkdtempSync(join(tmpdir(), "local-real-source-tool-pack-run-consume-sample-"));
const manifestOutputPath = join(tempDir, "local-json-agent-tool-manifest.json");
const requestOutputPath = join(tempDir, "agent-context-request.real-source-run-consume.sample.json");
const responseOutputPath = join(tempDir, "local-real-source-run-consume.sample.response.json");
const summaryOutputPath = join(tempDir, "local-real-source-run-consume.sample.summary.json");
const indexOutputPath = join(tempDir, "local-real-source-run-consume.sample.index.json");
const sampleIndexOutputPath = join(
  tempDir,
  "local-real-source-run-consume.sample.artifact-set.index.json"
);
const toolPackIndexOutputPath = join(tempDir, "local-real-source-tool-pack.index.json");
const consumptionSummaryOutputPath = join(
  tempDir,
  "local-real-source-tool-pack.run-consume.sample.summary.json"
);
const runConsumptionIndexOutputPath = join(
  tempDir,
  "local-real-source-tool-pack.run-consume.sample.index.json"
);
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

const sampleResult = writeLocalRealSourceToolPackSingleCommandConsumptionSample({
  manifest_output_path: manifestOutputPath,
  request_output_path: requestOutputPath,
  response_output_path: responseOutputPath,
  summary_output_path: summaryOutputPath,
  index_output_path: indexOutputPath,
  sample_index_output_path: sampleIndexOutputPath,
  tool_pack_index_output_path: toolPackIndexOutputPath,
  consumption_summary_output_path: consumptionSummaryOutputPath,
  run_consumption_index_output_path: runConsumptionIndexOutputPath
});

const manifestArtifact = readJson(manifestOutputPath);
const requestArtifact = readJson(requestOutputPath);
const responseArtifact = readJson(responseOutputPath);
const summaryArtifact = readJson(summaryOutputPath);
const toolPackIndexArtifact = readJson(toolPackIndexOutputPath);
const consumptionSummaryArtifact = readJson(consumptionSummaryOutputPath);
const runConsumptionIndexArtifact = readJson(runConsumptionIndexOutputPath);
const commandRefs = manifestArtifact.commands.map((command) => command.command_ref);

const assertions = {
  sample_written:
    sampleResult.verification_result ===
      "local_real_source_tool_pack_single_command_consumption_sample_written" &&
    sampleResult.output_contract_ref ===
      "local-real-source-tool-pack-single-command-consumption-sample-artifact-set/v1" &&
    sampleResult.failure_count === 0,
  explicit_paths_used:
    sampleResult.artifact_paths.manifest_output_path === manifestOutputPath &&
    sampleResult.artifact_paths.request_output_path === requestOutputPath &&
    sampleResult.artifact_paths.response_output_path === responseOutputPath &&
    sampleResult.artifact_paths.summary_output_path === summaryOutputPath &&
    sampleResult.artifact_paths.index_output_path === indexOutputPath &&
    sampleResult.artifact_paths.sample_index_output_path === sampleIndexOutputPath &&
    sampleResult.artifact_paths.tool_pack_index_output_path === toolPackIndexOutputPath &&
    sampleResult.artifact_paths.consumption_summary_output_path === consumptionSummaryOutputPath &&
    sampleResult.artifact_paths.run_consumption_index_output_path ===
      runConsumptionIndexOutputPath,
  contracts_match_artifacts:
    sampleResult.artifact_contract_refs.manifest === manifestArtifact.manifest_version &&
    sampleResult.artifact_contract_refs.request === requestArtifact.operation_version &&
    sampleResult.artifact_contract_refs.response === responseArtifact.output_contract_ref &&
    sampleResult.artifact_contract_refs.run_summary === summaryArtifact.output_contract_ref &&
    sampleResult.artifact_contract_refs.tool_pack_index ===
      toolPackIndexArtifact.output_contract_ref &&
    sampleResult.artifact_contract_refs.consumption_summary ===
      consumptionSummaryArtifact.output_contract_ref,
  manifest_advertises_sample_writer:
    commandRefs.includes("tool:local-real-source-tool-pack-run-consume-sample:write") &&
    manifestArtifact.recommended_sequence.includes(
      "tool:local-real-source-tool-pack-run-consume-sample:write"
    ),
  result_matches_written_index:
    runConsumptionIndexArtifact.verification_result === sampleResult.verification_result &&
    runConsumptionIndexArtifact.output_contract_ref === sampleResult.output_contract_ref &&
    runConsumptionIndexArtifact.agent_context_request_id ===
      sampleResult.agent_context_request_id &&
    runConsumptionIndexArtifact.single_command_consumption_contract_ref ===
      "local-real-source-tool-pack-single-command-consumption-v0/v1",
  consumption_summary_matches_index:
    consumptionSummaryArtifact.verification_result ===
      "local_real_source_tool_pack_index_consumption_completed" &&
    consumptionSummaryArtifact.input_mode === "tool_pack_index_only" &&
    sampleResult.index_consumption_contract_ref ===
      "local-real-source-tool-pack-index-consumption/v1",
  selected_refs_preserved:
    sampleResult.selected_scope_ids.join("|") === "scope:repo-work-context" &&
    sampleResult.selected_scope_ids.join("|") ===
      toolPackIndexArtifact.selected_scope_ids.join("|") &&
    sampleResult.selected_source_refs.join("|") ===
      toolPackIndexArtifact.selected_source_refs.join("|") &&
    sampleResult.selected_source_refs.join("|") === summaryArtifact.selected_source_refs.join("|"),
  default_deny_posture_preserved:
    sampleResult.direct_agent_repo_file_access_allowed_now === false &&
    sampleResult.arbitrary_source_loading_allowed === false &&
    sampleResult.arbitrary_file_read_allowed_now === false &&
    sampleResult.user_selected_path_read_allowed_now === false &&
    sampleResult.directory_traversal_allowed_now === false &&
    sampleResult.directory_listing_allowed_now === false &&
    sampleResult.repo_scanning_allowed_now === false &&
    sampleResult.runtime_permission_granted === false &&
    sampleResult.actual_contour_execution_allowed_now === false,
  runtime_surfaces_remain_closed:
    sampleResult.child_process_spawned === false &&
    sampleResult.mcp_server_implemented === false &&
    sampleResult.mcp_tool_registered === false &&
    sampleResult.mcp_resource_registered === false &&
    sampleResult.api_route_registered === false &&
    sampleResult.api_controller_registered === false &&
    sampleResult.runtime_handler_bound === false &&
    sampleResult.provider_sdk_call_allowed_now === false &&
    sampleResult.transport_execution_allowed_now === false &&
    sampleResult.concrete_persistence_read_allowed_now === false &&
    sampleResult.concrete_persistence_write_allowed_now === false &&
    sampleResult.real_model_call_allowed_now === false &&
    sampleResult.real_storage_write_allowed_now === false
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "local_real_source_tool_pack_single_command_consumption_sample_verified"
      : "local_real_source_tool_pack_single_command_consumption_sample_failed",
  output_contract_ref: sampleResult.output_contract_ref,
  tool_pack_index_output_path: toolPackIndexOutputPath,
  consumption_summary_output_path: consumptionSummaryOutputPath,
  run_consumption_index_output_path: runConsumptionIndexOutputPath,
  selected_scope_ids: sampleResult.selected_scope_ids,
  selected_source_refs: sampleResult.selected_source_refs,
  runtime_permission_granted: sampleResult.runtime_permission_granted,
  actual_contour_execution_allowed_now: sampleResult.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
