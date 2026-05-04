#!/usr/bin/env node

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  writeLocalRealSourceAgentToolReadinessIndex
} from "./local-real-source-agent-tool-readiness-index-cli.mjs";

const tempDir = mkdtempSync(join(tmpdir(), "local-real-source-agent-tool-readiness-"));
const manifestOutputPath = join(tempDir, "local-json-agent-tool-manifest.json");
const requestOutputPath = join(tempDir, "agent-context-request.real-source-readiness.sample.json");
const responseOutputPath = join(tempDir, "local-real-source-readiness.sample.response.json");
const summaryOutputPath = join(tempDir, "local-real-source-readiness.sample.summary.json");
const indexOutputPath = join(tempDir, "local-real-source-readiness.sample.index.json");
const sampleIndexOutputPath = join(tempDir, "local-real-source-readiness.sample.artifact-set.index.json");
const toolPackIndexOutputPath = join(tempDir, "local-real-source-tool-pack.index.json");
const consumptionSummaryOutputPath = join(tempDir, "local-real-source-readiness.consumption.summary.json");
const runConsumptionIndexOutputPath = join(tempDir, "local-real-source-readiness.run-consumption.index.json");
const readinessIndexOutputPath = join(tempDir, "local-real-source-agent-tool.readiness.index.json");
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

const readinessResult = writeLocalRealSourceAgentToolReadinessIndex({
  manifest_output_path: manifestOutputPath,
  request_output_path: requestOutputPath,
  response_output_path: responseOutputPath,
  summary_output_path: summaryOutputPath,
  index_output_path: indexOutputPath,
  sample_index_output_path: sampleIndexOutputPath,
  tool_pack_index_output_path: toolPackIndexOutputPath,
  consumption_summary_output_path: consumptionSummaryOutputPath,
  run_consumption_index_output_path: runConsumptionIndexOutputPath,
  readiness_index_output_path: readinessIndexOutputPath
});

const manifestArtifact = readJson(manifestOutputPath);
const toolPackIndexArtifact = readJson(toolPackIndexOutputPath);
const consumptionSummaryArtifact = readJson(consumptionSummaryOutputPath);
const runConsumptionIndexArtifact = readJson(runConsumptionIndexOutputPath);
const readinessIndexArtifact = readJson(readinessIndexOutputPath);
const commandRefs = manifestArtifact.commands.map((command) => command.command_ref);

const assertions = {
  readiness_written:
    readinessResult.verification_result ===
      "local_real_source_agent_tool_readiness_index_written" &&
    readinessResult.output_contract_ref === "local-real-source-agent-tool-readiness-index/v1" &&
    readinessResult.failure_count === 0,
  readiness_index_written_to_explicit_path:
    readinessResult.artifact_paths.readiness_index_output_path === readinessIndexOutputPath &&
    readinessIndexArtifact.output_contract_ref === readinessResult.output_contract_ref &&
    readinessIndexArtifact.verification_result === readinessResult.verification_result,
  primary_command_is_discoverable:
    readinessResult.primary_command_ref === "tool:local-real-source-tool-pack:run-consume-v0" &&
    readinessResult.sample_writer_command_ref ===
      "tool:local-real-source-tool-pack-run-consume-sample:write" &&
    readinessResult.readiness_writer_command_ref ===
      "tool:local-real-source-agent-tool-readiness-index:write" &&
    readinessResult.required_command_refs.every((commandRef) => commandRefs.includes(commandRef)),
  manifest_advertises_readiness_writer:
    commandRefs.includes("tool:local-real-source-agent-tool-readiness-index:write") &&
    manifestArtifact.recommended_sequence.includes(
      "tool:local-real-source-agent-tool-readiness-index:write"
    ),
  artifact_refs_match:
    readinessResult.artifact_contract_refs.manifest === manifestArtifact.manifest_version &&
    readinessResult.artifact_contract_refs.tool_pack_index ===
      toolPackIndexArtifact.output_contract_ref &&
    readinessResult.artifact_contract_refs.consumption_summary ===
      consumptionSummaryArtifact.output_contract_ref &&
    readinessResult.artifact_contract_refs.run_consumption_index ===
      runConsumptionIndexArtifact.output_contract_ref,
  verifier_commands_present:
    readinessResult.verifier_commands.includes(
      "npm run tool:local-real-source-agent-tool-readiness-index:verify"
    ) &&
    readinessResult.verifier_commands.includes(
      "npm run tool:local-real-source-tool-pack-run-consume-v0:verify"
    ) &&
    readinessResult.verifier_commands.includes(
      "npm run proof:authority-boundary-denial:verify"
    ),
  selected_refs_preserved:
    readinessResult.selected_scope_ids.join("|") === "scope:repo-work-context" &&
    readinessResult.selected_scope_ids.join("|") ===
      toolPackIndexArtifact.selected_scope_ids.join("|") &&
    readinessResult.selected_source_refs.join("|") ===
      toolPackIndexArtifact.selected_source_refs.join("|"),
  default_deny_posture_preserved:
    readinessResult.readiness_posture === "local_agent_tool_ready_without_transport_runtime" &&
    readinessResult.direct_agent_repo_file_access_allowed_now === false &&
    readinessResult.arbitrary_source_loading_allowed === false &&
    readinessResult.arbitrary_file_read_allowed_now === false &&
    readinessResult.user_selected_path_read_allowed_now === false &&
    readinessResult.directory_traversal_allowed_now === false &&
    readinessResult.directory_listing_allowed_now === false &&
    readinessResult.repo_scanning_allowed_now === false &&
    readinessResult.runtime_permission_granted === false &&
    readinessResult.actual_contour_execution_allowed_now === false,
  runtime_surfaces_remain_closed:
    readinessResult.child_process_spawned === false &&
    readinessResult.mcp_server_implemented === false &&
    readinessResult.mcp_tool_registered === false &&
    readinessResult.mcp_resource_registered === false &&
    readinessResult.api_route_registered === false &&
    readinessResult.api_controller_registered === false &&
    readinessResult.runtime_handler_bound === false &&
    readinessResult.provider_sdk_call_allowed_now === false &&
    readinessResult.transport_execution_allowed_now === false &&
    readinessResult.concrete_persistence_read_allowed_now === false &&
    readinessResult.concrete_persistence_write_allowed_now === false &&
    readinessResult.real_model_call_allowed_now === false &&
    readinessResult.real_storage_write_allowed_now === false
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "local_real_source_agent_tool_readiness_index_verified"
      : "local_real_source_agent_tool_readiness_index_failed",
  output_contract_ref: readinessResult.output_contract_ref,
  readiness_index_output_path: readinessIndexOutputPath,
  primary_command_ref: readinessResult.primary_command_ref,
  selected_scope_ids: readinessResult.selected_scope_ids,
  selected_source_refs: readinessResult.selected_source_refs,
  runtime_permission_granted: readinessResult.runtime_permission_granted,
  actual_contour_execution_allowed_now: readinessResult.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
