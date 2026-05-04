#!/usr/bin/env node

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  writeLocalRealSourceAgentToolReadinessIndex
} from "./local-real-source-agent-tool-readiness-index-cli.mjs";

const tempDir = mkdtempSync(join(tmpdir(), "local-real-source-agent-tool-readiness-acceptance-"));
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

const readinessIndexArtifact = readJson(readinessIndexOutputPath);
const artifactPaths = readinessIndexArtifact.artifact_paths;
const manifestArtifact = readJson(artifactPaths.manifest_output_path);
const toolPackIndexArtifact = readJson(artifactPaths.tool_pack_index_output_path);
const consumptionSummaryArtifact = readJson(artifactPaths.consumption_summary_output_path);
const runConsumptionIndexArtifact = readJson(artifactPaths.run_consumption_index_output_path);
const commandRefs = manifestArtifact.commands.map((command) => command.command_ref);
const selectedSourceRefs = [
  "repo-file://docs/04-implementation/CURRENT_IMPLEMENTATION_STATE.md",
  "repo-file://docs/04-implementation/KNOWN_IMPLEMENTATION_ISSUES.md"
];

const assertions = {
  readiness_index_can_be_starting_point:
    readinessResult.verification_result ===
      "local_real_source_agent_tool_readiness_index_written" &&
    readinessIndexArtifact.output_contract_ref === "local-real-source-agent-tool-readiness-index/v1" &&
    readinessIndexArtifact.failure_count === 0 &&
    artifactPaths.readiness_index_output_path === readinessIndexOutputPath,
  discovered_artifact_paths_are_used:
    artifactPaths.manifest_output_path === manifestOutputPath &&
    artifactPaths.tool_pack_index_output_path === toolPackIndexOutputPath &&
    artifactPaths.consumption_summary_output_path === consumptionSummaryOutputPath &&
    artifactPaths.run_consumption_index_output_path === runConsumptionIndexOutputPath,
  primary_tool_path_is_discoverable:
    readinessIndexArtifact.primary_command_ref ===
      "tool:local-real-source-tool-pack:run-consume-v0" &&
    readinessIndexArtifact.sample_writer_command_ref ===
      "tool:local-real-source-tool-pack-run-consume-sample:write" &&
    readinessIndexArtifact.readiness_writer_command_ref ===
      "tool:local-real-source-agent-tool-readiness-index:write" &&
    readinessIndexArtifact.required_command_refs.every((commandRef) =>
      commandRefs.includes(commandRef)
    ),
  acceptance_proof_is_advertised:
    manifestArtifact.recommended_sequence.includes(
      "proof:local-real-source-agent-tool-readiness-acceptance:verify"
    ) &&
    commandRefs.includes("proof:local-real-source-agent-tool-readiness-acceptance:verify"),
  verifier_commands_preserve_guardrails:
    readinessIndexArtifact.verifier_commands.includes(
      "npm run tool:local-real-source-agent-tool-readiness-index:verify"
    ) &&
    readinessIndexArtifact.verifier_commands.includes(
      "npm run tool:local-real-source-tool-pack-run-consume-v0:verify"
    ) &&
    readinessIndexArtifact.verifier_commands.includes(
      "npm run proof:authority-boundary-denial:verify"
    ),
  artifact_contract_refs_match_discovered_artifacts:
    readinessIndexArtifact.artifact_contract_refs.manifest === manifestArtifact.manifest_version &&
    readinessIndexArtifact.artifact_contract_refs.tool_pack_index ===
      toolPackIndexArtifact.output_contract_ref &&
    readinessIndexArtifact.artifact_contract_refs.consumption_summary ===
      consumptionSummaryArtifact.output_contract_ref &&
    readinessIndexArtifact.artifact_contract_refs.run_consumption_index ===
      runConsumptionIndexArtifact.output_contract_ref,
  selected_refs_are_bounded_and_replayable:
    readinessIndexArtifact.selected_scope_ids.join("|") === "scope:repo-work-context" &&
    readinessIndexArtifact.selected_scope_ids.join("|") ===
      toolPackIndexArtifact.selected_scope_ids.join("|") &&
    readinessIndexArtifact.selected_scope_ids.join("|") ===
      runConsumptionIndexArtifact.selected_scope_ids.join("|") &&
    readinessIndexArtifact.selected_source_refs.join("|") === selectedSourceRefs.join("|") &&
    readinessIndexArtifact.selected_source_refs.join("|") ===
      toolPackIndexArtifact.selected_source_refs.join("|") &&
    readinessIndexArtifact.selected_source_refs.join("|") ===
      runConsumptionIndexArtifact.selected_source_refs.join("|"),
  envelope_refs_are_preserved:
    readinessIndexArtifact.source_materialization_receipt_ref ===
      toolPackIndexArtifact.source_materialization_receipt_ref &&
    readinessIndexArtifact.source_materialization_receipt_ref ===
      consumptionSummaryArtifact.source_materialization_receipt_ref &&
    readinessIndexArtifact.provenance_envelope_ref === toolPackIndexArtifact.provenance_envelope_ref &&
    readinessIndexArtifact.provenance_envelope_ref ===
      consumptionSummaryArtifact.provenance_envelope_ref &&
    readinessIndexArtifact.permission_envelope_ref === toolPackIndexArtifact.permission_envelope_ref &&
    readinessIndexArtifact.permission_envelope_ref ===
      consumptionSummaryArtifact.permission_envelope_ref &&
    readinessIndexArtifact.audit_envelope_ref === toolPackIndexArtifact.audit_envelope_ref &&
    readinessIndexArtifact.audit_envelope_ref === consumptionSummaryArtifact.audit_envelope_ref,
  default_deny_posture_preserved:
    readinessIndexArtifact.readiness_posture ===
      "local_agent_tool_ready_without_transport_runtime" &&
    readinessIndexArtifact.direct_agent_repo_file_access_allowed_now === false &&
    readinessIndexArtifact.arbitrary_source_loading_allowed === false &&
    readinessIndexArtifact.arbitrary_file_read_allowed_now === false &&
    readinessIndexArtifact.user_selected_path_read_allowed_now === false &&
    readinessIndexArtifact.directory_traversal_allowed_now === false &&
    readinessIndexArtifact.directory_listing_allowed_now === false &&
    readinessIndexArtifact.repo_scanning_allowed_now === false &&
    readinessIndexArtifact.runtime_permission_granted === false &&
    readinessIndexArtifact.actual_contour_execution_allowed_now === false,
  runtime_surfaces_remain_closed:
    readinessIndexArtifact.child_process_spawned === false &&
    readinessIndexArtifact.mcp_server_implemented === false &&
    readinessIndexArtifact.mcp_tool_registered === false &&
    readinessIndexArtifact.mcp_resource_registered === false &&
    readinessIndexArtifact.api_route_registered === false &&
    readinessIndexArtifact.api_controller_registered === false &&
    readinessIndexArtifact.runtime_handler_bound === false &&
    readinessIndexArtifact.provider_sdk_call_allowed_now === false &&
    readinessIndexArtifact.transport_execution_allowed_now === false &&
    readinessIndexArtifact.concrete_persistence_read_allowed_now === false &&
    readinessIndexArtifact.concrete_persistence_write_allowed_now === false &&
    readinessIndexArtifact.real_model_call_allowed_now === false &&
    readinessIndexArtifact.real_storage_write_allowed_now === false
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "local_real_source_agent_tool_readiness_acceptance_proof_verified"
      : "local_real_source_agent_tool_readiness_acceptance_proof_failed",
  output_contract_ref: "local-real-source-agent-tool-readiness-acceptance-proof/v1",
  readiness_index_output_path: readinessIndexOutputPath,
  primary_command_ref: readinessIndexArtifact.primary_command_ref,
  selected_scope_ids: readinessIndexArtifact.selected_scope_ids,
  selected_source_refs: readinessIndexArtifact.selected_source_refs,
  started_from_readiness_index: true,
  used_discovered_readiness_refs: failed.length === 0,
  runtime_permission_granted: readinessIndexArtifact.runtime_permission_granted,
  actual_contour_execution_allowed_now: readinessIndexArtifact.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
