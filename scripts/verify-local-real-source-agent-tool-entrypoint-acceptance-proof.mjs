#!/usr/bin/env node

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import {
  runLocalRealSourceAgentToolEntrypointV0
} from "./local-real-source-agent-tool-entrypoint-v0-cli.mjs";

const tempDir = mkdtempSync(join(tmpdir(), "local-real-source-agent-tool-entrypoint-acceptance-"));
const artifactDirPath = join(tempDir, "agent-tool-artifacts");
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const selectedSourceRefs = [
  "repo-file://docs/04-implementation/CURRENT_IMPLEMENTATION_STATE.md",
  "repo-file://docs/04-implementation/KNOWN_IMPLEMENTATION_ISSUES.md"
];

const entrypointRunResult = runLocalRealSourceAgentToolEntrypointV0({
  artifact_dir_path: artifactDirPath,
  variation: {
    task_signal: "entrypoint acceptance proof repo-work context request",
    read_mode_hint: "planning",
    depth_hint: "standard"
  }
});
const entrypointSummaryPath = entrypointRunResult.artifact_paths.entrypoint_summary_output_path;
const entrypointSummaryArtifact = readJson(entrypointSummaryPath);
const artifactPaths = entrypointSummaryArtifact.artifact_paths;
const readinessIndexArtifact = readJson(entrypointSummaryArtifact.readiness_index_output_path);
const manifestArtifact = readJson(artifactPaths.manifest_output_path);
const toolPackIndexArtifact = readJson(artifactPaths.tool_pack_index_output_path);
const responseArtifact = readJson(artifactPaths.response_output_path);
const consumptionSummaryArtifact = readJson(artifactPaths.consumption_summary_output_path);
const runConsumptionIndexArtifact = readJson(artifactPaths.run_consumption_index_output_path);
const commandRefs = manifestArtifact.commands.map((command) => command.command_ref);
const artifactPathValues = Object.values(artifactPaths);

const assertions = {
  entrypoint_summary_is_starting_point:
    entrypointRunResult.verification_result ===
      "local_real_source_agent_tool_entrypoint_v0_completed" &&
    entrypointSummaryArtifact.verification_result ===
      "local_real_source_agent_tool_entrypoint_v0_completed" &&
    entrypointSummaryArtifact.output_contract_ref ===
      "local-real-source-agent-tool-entrypoint-v0/v1" &&
    entrypointSummaryArtifact.failure_count === 0,
  entrypoint_summary_points_to_readiness_index:
    entrypointSummaryArtifact.readiness_index_output_path ===
      artifactPaths.readiness_index_output_path &&
    readinessIndexArtifact.output_contract_ref ===
      "local-real-source-agent-tool-readiness-index/v1" &&
    readinessIndexArtifact.failure_count === 0,
  fixed_artifact_paths_are_confined:
    entrypointSummaryArtifact.artifact_dir_path === artifactDirPath &&
    entrypointSummaryArtifact.fixed_artifact_paths_confined_to_artifact_dir === true &&
    artifactPathValues.every((artifactPath) => dirname(artifactPath) === artifactDirPath),
  agent_can_discover_primary_command:
    entrypointSummaryArtifact.entrypoint_command_ref ===
      "tool:local-real-source-agent-tool-entrypoint-v0:run" &&
    entrypointSummaryArtifact.primary_command_ref ===
      "tool:local-real-source-tool-pack:run-consume-v0" &&
    readinessIndexArtifact.primary_command_ref === entrypointSummaryArtifact.primary_command_ref &&
    commandRefs.includes("tool:local-real-source-agent-tool-entrypoint-v0:run") &&
    commandRefs.includes("tool:local-real-source-tool-pack:run-consume-v0"),
  request_options_are_intent_only:
    entrypointSummaryArtifact.request_task_signal ===
      "entrypoint acceptance proof repo-work context request" &&
    entrypointSummaryArtifact.request_read_mode_hint === "planning" &&
    entrypointSummaryArtifact.request_depth_hint === "standard" &&
    readinessIndexArtifact.request_task_signal ===
      entrypointSummaryArtifact.request_task_signal,
  verifier_commands_are_discoverable:
    entrypointSummaryArtifact.verifier_commands.includes(
      "npm run tool:local-real-source-agent-tool-entrypoint-v0:verify"
    ) &&
    entrypointSummaryArtifact.verifier_commands.includes(
      "npm run proof:local-real-source-agent-tool-readiness-acceptance:verify"
    ) &&
    entrypointSummaryArtifact.verifier_commands.includes(
      "npm run proof:authority-boundary-denial:verify"
    ),
  artifact_contract_refs_match_discovered_artifacts:
    entrypointSummaryArtifact.artifact_contract_refs.entrypoint_summary ===
      entrypointSummaryArtifact.output_contract_ref &&
    entrypointSummaryArtifact.artifact_contract_refs.readiness_index ===
      readinessIndexArtifact.output_contract_ref &&
    entrypointSummaryArtifact.artifact_contract_refs.manifest ===
      manifestArtifact.manifest_version &&
    entrypointSummaryArtifact.artifact_contract_refs.tool_pack_index ===
      toolPackIndexArtifact.output_contract_ref &&
    entrypointSummaryArtifact.artifact_contract_refs.consumption_summary ===
      consumptionSummaryArtifact.output_contract_ref &&
    entrypointSummaryArtifact.artifact_contract_refs.run_consumption_index ===
      runConsumptionIndexArtifact.output_contract_ref,
  bounded_context_is_discoverable:
    responseArtifact.output_contract_ref === "local-real-source-adapter-v0-response/v1" &&
    responseArtifact.read_boundary_ref === "narrow-local-real-source-read-boundary/v1" &&
    responseArtifact.source_catalog_ref === "local-v0-source-catalog/v1" &&
    responseArtifact.selected_scope_ids.join("|") === "scope:repo-work-context" &&
    responseArtifact.selected_source_refs.join("|") === selectedSourceRefs.join("|"),
  selected_refs_are_consistent:
    entrypointSummaryArtifact.selected_scope_ids.join("|") === "scope:repo-work-context" &&
    entrypointSummaryArtifact.selected_source_refs.join("|") === selectedSourceRefs.join("|") &&
    readinessIndexArtifact.selected_source_refs.join("|") === selectedSourceRefs.join("|") &&
    toolPackIndexArtifact.selected_source_refs.join("|") === selectedSourceRefs.join("|"),
  envelope_refs_are_preserved:
    entrypointSummaryArtifact.source_materialization_receipt_ref ===
      readinessIndexArtifact.source_materialization_receipt_ref &&
    entrypointSummaryArtifact.source_materialization_receipt_ref ===
      toolPackIndexArtifact.source_materialization_receipt_ref &&
    entrypointSummaryArtifact.provenance_envelope_ref ===
      readinessIndexArtifact.provenance_envelope_ref &&
    entrypointSummaryArtifact.permission_envelope_ref ===
      readinessIndexArtifact.permission_envelope_ref &&
    entrypointSummaryArtifact.audit_envelope_ref === readinessIndexArtifact.audit_envelope_ref,
  default_deny_posture_preserved:
    entrypointSummaryArtifact.readiness_posture ===
      "local_agent_tool_ready_without_transport_runtime" &&
    entrypointSummaryArtifact.direct_agent_repo_file_access_allowed_now === false &&
    entrypointSummaryArtifact.arbitrary_source_loading_allowed === false &&
    entrypointSummaryArtifact.arbitrary_file_read_allowed_now === false &&
    entrypointSummaryArtifact.user_selected_path_read_allowed_now === false &&
    entrypointSummaryArtifact.directory_traversal_allowed_now === false &&
    entrypointSummaryArtifact.directory_listing_allowed_now === false &&
    entrypointSummaryArtifact.repo_scanning_allowed_now === false &&
    entrypointSummaryArtifact.runtime_permission_granted === false &&
    entrypointSummaryArtifact.actual_contour_execution_allowed_now === false,
  runtime_surfaces_remain_closed:
    entrypointSummaryArtifact.child_process_spawned === false &&
    entrypointSummaryArtifact.mcp_server_implemented === false &&
    entrypointSummaryArtifact.mcp_tool_registered === false &&
    entrypointSummaryArtifact.mcp_resource_registered === false &&
    entrypointSummaryArtifact.api_route_registered === false &&
    entrypointSummaryArtifact.api_controller_registered === false &&
    entrypointSummaryArtifact.runtime_handler_bound === false &&
    entrypointSummaryArtifact.provider_sdk_call_allowed_now === false &&
    entrypointSummaryArtifact.transport_execution_allowed_now === false &&
    entrypointSummaryArtifact.concrete_persistence_read_allowed_now === false &&
    entrypointSummaryArtifact.concrete_persistence_write_allowed_now === false &&
    entrypointSummaryArtifact.real_model_call_allowed_now === false &&
    entrypointSummaryArtifact.real_storage_write_allowed_now === false
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "local_real_source_agent_tool_entrypoint_acceptance_proof_verified"
      : "local_real_source_agent_tool_entrypoint_acceptance_proof_failed",
  output_contract_ref: "local-real-source-agent-tool-entrypoint-acceptance-proof/v1",
  artifact_dir_path: artifactDirPath,
  entrypoint_summary_output_path: entrypointSummaryPath,
  readiness_index_output_path: entrypointSummaryArtifact.readiness_index_output_path,
  primary_command_ref: entrypointSummaryArtifact.primary_command_ref,
  selected_scope_ids: entrypointSummaryArtifact.selected_scope_ids,
  selected_source_refs: entrypointSummaryArtifact.selected_source_refs,
  started_from_entrypoint_summary: true,
  used_discovered_entrypoint_refs: failed.length === 0,
  runtime_permission_granted: entrypointSummaryArtifact.runtime_permission_granted,
  actual_contour_execution_allowed_now:
    entrypointSummaryArtifact.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
