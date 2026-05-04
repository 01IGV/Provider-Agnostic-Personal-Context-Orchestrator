#!/usr/bin/env node

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import {
  runLocalRealSourceAgentToolEntrypointV0
} from "./local-real-source-agent-tool-entrypoint-v0-cli.mjs";

const tempDir = mkdtempSync(join(tmpdir(), "local-real-source-agent-tool-entrypoint-"));
const artifactDirPath = join(tempDir, "agent-tool-artifacts");
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

const entrypointResult = runLocalRealSourceAgentToolEntrypointV0({
  artifact_dir_path: artifactDirPath,
  variation: {
    task_signal: "entrypoint custom repo-work context request",
    read_mode_hint: "planning",
    depth_hint: "standard"
  }
});
const entrypointSummaryArtifact = readJson(entrypointResult.artifact_paths.entrypoint_summary_output_path);
const readinessIndexArtifact = readJson(entrypointResult.readiness_index_output_path);
const manifestArtifact = readJson(entrypointResult.artifact_paths.manifest_output_path);
const commandRefs = manifestArtifact.commands.map((command) => command.command_ref);
const artifactPathValues = Object.values(entrypointResult.artifact_paths);
const selectedSourceRefs = [
  "repo-file://docs/04-implementation/CURRENT_IMPLEMENTATION_STATE.md",
  "repo-file://docs/04-implementation/KNOWN_IMPLEMENTATION_ISSUES.md"
];

const assertions = {
  entrypoint_completed:
    entrypointResult.verification_result ===
      "local_real_source_agent_tool_entrypoint_v0_completed" &&
    entrypointResult.output_contract_ref === "local-real-source-agent-tool-entrypoint-v0/v1" &&
    entrypointResult.failure_count === 0,
  entrypoint_summary_written_to_fixed_path:
    entrypointSummaryArtifact.output_contract_ref === entrypointResult.output_contract_ref &&
    entrypointSummaryArtifact.verification_result === entrypointResult.verification_result &&
    entrypointSummaryArtifact.artifact_paths.entrypoint_summary_output_path ===
      entrypointResult.artifact_paths.entrypoint_summary_output_path,
  fixed_artifacts_stay_in_explicit_artifact_dir:
    entrypointResult.artifact_dir_path === artifactDirPath &&
    entrypointResult.fixed_artifact_paths_confined_to_artifact_dir === true &&
    artifactPathValues.every((artifactPath) => dirname(artifactPath) === artifactDirPath),
  readiness_index_is_agent_starting_point:
    entrypointResult.readiness_index_output_path ===
      entrypointResult.artifact_paths.readiness_index_output_path &&
    readinessIndexArtifact.output_contract_ref === "local-real-source-agent-tool-readiness-index/v1" &&
    readinessIndexArtifact.failure_count === 0 &&
    readinessIndexArtifact.primary_command_ref ===
      "tool:local-real-source-tool-pack:run-consume-v0",
  request_options_are_preserved_as_intent_only:
    entrypointResult.request_task_signal === "entrypoint custom repo-work context request" &&
    entrypointResult.request_read_mode_hint === "planning" &&
    entrypointResult.request_depth_hint === "standard" &&
    readinessIndexArtifact.request_task_signal === entrypointResult.request_task_signal,
  manifest_advertises_entrypoint:
    commandRefs.includes("tool:local-real-source-agent-tool-entrypoint-v0:run") &&
    manifestArtifact.recommended_sequence.includes(
      "tool:local-real-source-agent-tool-entrypoint-v0:run"
    ),
  verifier_commands_are_discoverable:
    entrypointResult.verifier_commands.includes(
      "npm run tool:local-real-source-agent-tool-entrypoint-v0:verify"
    ) &&
    entrypointResult.verifier_commands.includes(
      "npm run proof:local-real-source-agent-tool-readiness-acceptance:verify"
    ) &&
    entrypointResult.verifier_commands.includes(
      "npm run proof:authority-boundary-denial:verify"
    ),
  selected_refs_are_bounded:
    entrypointResult.selected_scope_ids.join("|") === "scope:repo-work-context" &&
    entrypointResult.selected_source_refs.join("|") === selectedSourceRefs.join("|") &&
    readinessIndexArtifact.selected_source_refs.join("|") === selectedSourceRefs.join("|"),
  envelope_refs_are_preserved:
    entrypointResult.source_materialization_receipt_ref ===
      readinessIndexArtifact.source_materialization_receipt_ref &&
    entrypointResult.provenance_envelope_ref === readinessIndexArtifact.provenance_envelope_ref &&
    entrypointResult.permission_envelope_ref === readinessIndexArtifact.permission_envelope_ref &&
    entrypointResult.audit_envelope_ref === readinessIndexArtifact.audit_envelope_ref,
  default_deny_posture_preserved:
    entrypointResult.readiness_posture === "local_agent_tool_ready_without_transport_runtime" &&
    entrypointResult.direct_agent_repo_file_access_allowed_now === false &&
    entrypointResult.arbitrary_source_loading_allowed === false &&
    entrypointResult.arbitrary_file_read_allowed_now === false &&
    entrypointResult.user_selected_path_read_allowed_now === false &&
    entrypointResult.directory_traversal_allowed_now === false &&
    entrypointResult.directory_listing_allowed_now === false &&
    entrypointResult.repo_scanning_allowed_now === false &&
    entrypointResult.runtime_permission_granted === false &&
    entrypointResult.actual_contour_execution_allowed_now === false,
  runtime_surfaces_remain_closed:
    entrypointResult.child_process_spawned === false &&
    entrypointResult.mcp_server_implemented === false &&
    entrypointResult.mcp_tool_registered === false &&
    entrypointResult.mcp_resource_registered === false &&
    entrypointResult.api_route_registered === false &&
    entrypointResult.api_controller_registered === false &&
    entrypointResult.runtime_handler_bound === false &&
    entrypointResult.provider_sdk_call_allowed_now === false &&
    entrypointResult.transport_execution_allowed_now === false &&
    entrypointResult.concrete_persistence_read_allowed_now === false &&
    entrypointResult.concrete_persistence_write_allowed_now === false &&
    entrypointResult.real_model_call_allowed_now === false &&
    entrypointResult.real_storage_write_allowed_now === false
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "local_real_source_agent_tool_entrypoint_v0_verified"
      : "local_real_source_agent_tool_entrypoint_v0_failed",
  output_contract_ref: entrypointResult.output_contract_ref,
  artifact_dir_path: artifactDirPath,
  entrypoint_summary_output_path: entrypointResult.artifact_paths.entrypoint_summary_output_path,
  readiness_index_output_path: entrypointResult.readiness_index_output_path,
  primary_command_ref: entrypointResult.primary_command_ref,
  selected_scope_ids: entrypointResult.selected_scope_ids,
  selected_source_refs: entrypointResult.selected_source_refs,
  runtime_permission_granted: entrypointResult.runtime_permission_granted,
  actual_contour_execution_allowed_now: entrypointResult.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
